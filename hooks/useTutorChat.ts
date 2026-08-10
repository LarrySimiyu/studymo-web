'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import {
  tutorApi,
  streamTutorChat,
  FreeLimitError,
  TutorSession,
  TutorMessage,
  NoteOffer,
} from '@/lib/api/tutor';
import { documentsApi, notesApi } from '@/lib/api/documents';
import { invalidatePrefix } from '@/lib/api';
import { useTutorSessions } from '@/context/TutorSessionsContext';
import { useEmptyChatCleanup } from '@/hooks/useEmptyChatCleanup';
import { TutorMode } from '@/components/tutor/TutorModeDropdown';

export type UIMessage =
  | TutorMessage
  | { id: string; role: 'system' | 'assistant' | 'user'; content: string; isStreaming?: boolean };

type NoteSummary = { id: string; summary: string | null; document: { id: string; title: string } };
type DocSummary = { id: string; title: string; status: string };

const MAX_NOTES = 15;

let msgIdCounter = 0;
function nextId() { return `local-${++msgIdCounter}`; }

export function useTutorChat(sessionParam: string | null) {
  const { currentUser } = useAuth();
  const router = useRouter();
  const { creating, createSession: createTutorSession, renameSession, touchSession, refetch } = useTutorSessions();

  const [activeSession, setActiveSession] = useState<TutorSession | null>(null);
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [allNotes, setAllNotes] = useState<NoteSummary[]>([]);
  const [allDocs, setAllDocs] = useState<DocSummary[]>([]);
  const [noteSearch, setNoteSearch] = useState('');
  const [revealAnswer, setRevealAnswer] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [noteOffer, setNoteOffer] = useState<NoteOffer | null>(null);
  const [offerSaving, setOfferSaving] = useState(false);
  const [offerSaved, setOfferSaved] = useState(false);
  const [resolvedTopics, setResolvedTopics] = useState<string[]>([]);
  const [outOfMessages, setOutOfMessages] = useState(false);
  const [starting, setStarting] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  /** Which chat this view has claimed. A ref, not state, so a claim is visible to the
   *  route effect in the same tick it is made rather than a render later. */
  const openSessionRef = useRef<string | null>(null);

  useEffect(() => {
    notesApi.getAll().then(({ data }) => {
      if (data) setAllNotes(data as NoteSummary[]);
    });
    documentsApi.getAll().then(({ data }) => {
      if (data) setAllDocs(data.map(d => ({ id: d.id, title: d.title, status: d.status })));
    });
  }, []);

  // The [sessionId] route segment is the source of truth for what's open
  useEffect(() => {
    if (!sessionParam) {
      openSessionRef.current = null;
      setActiveSession(null);
      setMessages([]);
      setSuggestions([]);
      return;
    }
    // startWithMessage claims the chat it creates before it navigates, so the send
    // already streaming into it is never reloaded — and blanked — out from under it.
    if (openSessionRef.current === sessionParam) return;
    loadSession(sessionParam);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionParam]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEmptyChatCleanup({
    sessionId: sessionParam,
    loadedId: activeSession?.id ?? null,
    messageCount: messages.length,
    busy: isStreaming || creating || starting,
  });

  async function loadSession(id: string) {
    openSessionRef.current = id;
    setMessages([]);
    setSuggestions([]);
    const { data } = await tutorApi.getSession(id);
    // A newer chat claimed the view while this was in flight.
    if (openSessionRef.current !== id) return;
    if (!data) {
      openSessionRef.current = null;
      return;
    }
    setActiveSession(data);
    setMessages(data.messages ?? []);
    if ((data.messages ?? []).length === 0) {
      tutorApi.getSuggestions(id).then(({ data: s }) => {
        if (openSessionRef.current !== id) return;
        if (s?.suggestions) setSuggestions(s.suggestions);
      }).catch(() => {});
    }
    setTimeout(() => inputRef.current?.focus(), 100);
  }

  /**
   * First message on the welcome screen creates the session and sends in one go.
   * The new session is passed straight to sendMessage — waiting on the route
   * round trip would drop the text the student already typed.
   *
   * `starting` stays true for the whole create → send handshake so the chat is never
   * momentarily "idle and empty" between the two, which is what the cleanup hook reads.
   */
  async function startWithMessage() {
    const text = input.trim();
    if (!text || creating || starting || isStreaming || outOfMessages) return;
    setStarting(true);
    try {
      const session = await createTutorSession();
      if (!session) return;
      openSessionRef.current = session.id;
      setActiveSession(session);
      setMessages([]);
      setSuggestions([]);
      router.push(`/dashboard/tutor/${session.id}`);
      setTimeout(() => inputRef.current?.focus(), 100);
      await sendMessage(text, session);
    } finally {
      setStarting(false);
    }
  }

  async function changeMode(mode: TutorMode) {
    if (!activeSession || activeSession.mode === mode) return;
    const { data } = await tutorApi.updateMode(activeSession.id, mode);
    if (data) setActiveSession(data);
  }

  async function sendMessage(override?: string, sessionOverride?: TutorSession) {
    const session = sessionOverride ?? activeSession;
    const text = (override ?? input).trim();
    if (!text || isStreaming || !session || !currentUser || outOfMessages) return;
    setInput('');
    setSuggestions([]);
    setNoteOffer(null);
    setOfferSaved(false);
    const wasReveal = revealAnswer;
    setRevealAnswer(false);
    setIsStreaming(true);

    let limitHit = false;

    // What the student sees — no tag
    const userMsg: UIMessage = { id: nextId(), role: 'user', content: text };
    const assistantId = nextId();
    const assistantMsg: UIMessage = { id: assistantId, role: 'assistant', content: '', isStreaming: true };
    setMessages(prev => [...prev, userMsg, assistantMsg]);

    // streamTutorChat bypasses lib/api, so nothing clears this session's cached GET on
    // its own. Drop it up front too: the server stores the student's message before it
    // starts generating, so a reload mid-stream must not read back the pre-send copy.
    invalidatePrefix(`/tutor/${session.id}`);

    // What gets sent to the API — append reveal tag if toggled
    const apiMessage = wasReveal
      ? `${text}\n\n[STUDENT_REQUESTING_DIRECT_ANSWER]`
      : text;

    try {
      const token = await currentUser.getIdToken();
      await streamTutorChat(
        session.id,
        apiMessage,
        chunk => {
          setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: m.content + chunk } : m));
        },
        () => {},
        token,
        offer => setNoteOffer(offer),
        resolved => setResolvedTopics(prev => [...prev, resolved.topic])
      );
    } catch (err) {
      if (err instanceof FreeLimitError) {
        // Nothing was sent, so leave no trace of it — pull both bubbles back out
        // and hand the student their text so they don't have to retype it.
        limitHit = true;
        setOutOfMessages(true);
        setMessages(prev => prev.filter(m => m.id !== userMsg.id && m.id !== assistantId));
        setInput(text);
        setRevealAnswer(wasReveal);
      } else {
        setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: 'Something went wrong. Please try again.', isStreaming: false } : m));
      }
    } finally {
      // A rejected message never reached the session, so it must not touch the
      // session preview or trigger the first-message title poll.
      if (!limitHit) {
        setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, isStreaming: false } : m));
        touchSession(session.id, text);
        invalidatePrefix(`/tutor/${session.id}`);
        // The server generates the session title from the first message fire-and-forget,
        // so an immediate refetch usually still returns the placeholder. Poll once more.
        // `messages` is the pre-send closure value, so the first message sees zero.
        const isFirstMessage = messages.filter(m => m.role === 'user').length === 0;
        if (isFirstMessage) {
          refetch().catch(() => {});
          setTimeout(() => {
            refetch().then(() => {
              tutorApi.getSession(session.id).then(({ data }) => {
                if (data) setActiveSession(prev => prev?.id === data.id ? { ...prev, title: data.title } : prev);
              });
            }).catch(() => {});
          }, 2500);
        }
      }
      setIsStreaming(false);
    }
  }

  async function saveTitle(next: string) {
    if (!activeSession) return;
    setActiveSession({ ...activeSession, title: next });
    await renameSession(activeSession.id, next);
  }

  async function updateNotes(newIds: string[]) {
    if (!activeSession) return;
    const { data } = await tutorApi.updateNotes(activeSession.id, newIds);
    if (data) setActiveSession(data);
  }

  function removeNote(noteId: string) {
    if (!activeSession) return;
    updateNotes(activeSession.noteIds.filter((id: string) => id !== noteId));
  }

  function addNote(noteId: string) {
    if (!activeSession || activeSession.noteIds.length >= MAX_NOTES) return;
    updateNotes([...activeSession.noteIds, noteId]);
  }

  function toggleNote(noteId: string) {
    if (!activeSession) return;
    if (activeSession.noteIds.includes(noteId)) removeNote(noteId);
    else addNote(noteId);
  }

  async function acceptOffer() {
    if (!noteOffer || offerSaving) return;
    setOfferSaving(true);
    try {
      await notesApi.append(noteOffer.noteId, noteOffer.heading, noteOffer.content);
      setOfferSaved(true);
      setNoteOffer(null);
    } catch {
      // silently fail — user can try again
    } finally {
      setOfferSaving(false);
    }
  }

  // Sources lists documents, not notes — a document is only attachable once
  // processing has produced its note.
  const noteByDocId = new Map(allNotes.map(n => [n.document.id, n.id]));
  const sources = allDocs.map(d => ({
    id: d.id,
    title: d.title,
    noteId: noteByDocId.get(d.id),
    status: d.status,
  }));

  const loadedNoteIds = new Set(activeSession?.noteIds ?? []);
  const availableNotes = allNotes.filter(n => {
    if (loadedNoteIds.has(n.id)) return false;
    if (!noteSearch) return true;
    return n.document.title.toLowerCase().includes(noteSearch.toLowerCase());
  });

  return {
    activeSession, messages, input, setInput, isStreaming, creating: creating || starting,
    allNotes, sources, availableNotes, noteSearch, setNoteSearch, maxNotes: MAX_NOTES,
    revealAnswer, setRevealAnswer, suggestions, outOfMessages,
    noteOffer, setNoteOffer, offerSaving, offerSaved, resolvedTopics, setResolvedTopics,
    bottomRef, inputRef,
    startWithMessage, changeMode, sendMessage, saveTitle,
    addNote, removeNote, toggleNote, acceptOffer,
  };
}
