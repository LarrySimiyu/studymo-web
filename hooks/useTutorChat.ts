'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import {
  tutorApi,
  streamTutorChat,
  TutorSession,
  TutorMessage,
  NoteOffer,
} from '@/lib/api/tutor';
import { documentsApi, notesApi } from '@/lib/api/documents';
import { useTutorSessions } from '@/context/TutorSessionsContext';
import { TutorMode } from '@/components/tutor/TutorModeDropdown';

export type UIMessage =
  | TutorMessage
  | { id: string; role: 'system' | 'assistant' | 'user'; content: string; isStreaming?: boolean };

type NoteSummary = { id: string; summary: string | null; document: { id: string; title: string } };
type DocSummary = { id: string; title: string; status: string };

const MAX_NOTES = 15;

let msgIdCounter = 0;
function nextId() { return `local-${++msgIdCounter}`; }

export function useTutorChat() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionParam = searchParams.get('session');
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

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    notesApi.getAll().then(({ data }) => {
      if (data) setAllNotes(data as NoteSummary[]);
    });
    documentsApi.getAll().then(({ data }) => {
      if (data) setAllDocs(data.map(d => ({ id: d.id, title: d.title, status: d.status })));
    });
  }, []);

  // The ?session= param is the source of truth for what's open
  useEffect(() => {
    if (!sessionParam) {
      setActiveSession(null);
      setMessages([]);
      setSuggestions([]);
      return;
    }
    if (activeSession?.id === sessionParam) return;
    loadSession(sessionParam);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionParam]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function loadSession(id: string) {
    const { data } = await tutorApi.getSession(id);
    if (!data) return;
    setActiveSession(data);
    setMessages(data.messages);
    setSuggestions([]);
    if (data.messages.length === 0) {
      tutorApi.getSuggestions(id).then(({ data: s }) => {
        if (s?.suggestions) setSuggestions(s.suggestions);
      }).catch(() => {});
    }
    setTimeout(() => inputRef.current?.focus(), 100);
  }

  async function createSession() {
    const id = await createTutorSession();
    if (id) router.push(`/dashboard/tutor?session=${id}`);
  }

  async function changeMode(mode: TutorMode) {
    if (!activeSession || activeSession.mode === mode) return;
    const { data } = await tutorApi.updateMode(activeSession.id, mode);
    if (data) setActiveSession(data);
  }

  async function sendMessage(override?: string) {
    const text = (override ?? input).trim();
    if (!text || isStreaming || !activeSession || !currentUser) return;
    setInput('');
    setSuggestions([]);
    setNoteOffer(null);
    setOfferSaved(false);
    const wasReveal = revealAnswer;
    setRevealAnswer(false);
    setIsStreaming(true);

    // What the student sees — no tag
    const userMsg: UIMessage = { id: nextId(), role: 'user', content: text };
    const assistantId = nextId();
    const assistantMsg: UIMessage = { id: assistantId, role: 'assistant', content: '', isStreaming: true };
    setMessages(prev => [...prev, userMsg, assistantMsg]);

    // What gets sent to the API — append reveal tag if toggled
    const apiMessage = wasReveal
      ? `${text}\n\n[STUDENT_REQUESTING_DIRECT_ANSWER]`
      : text;

    try {
      const token = await currentUser.getIdToken();
      await streamTutorChat(
        activeSession.id,
        apiMessage,
        chunk => {
          setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: m.content + chunk } : m));
        },
        () => {},
        token,
        offer => setNoteOffer(offer),
        resolved => setResolvedTopics(prev => [...prev, resolved.topic])
      );
    } catch {
      setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: 'Something went wrong. Please try again.', isStreaming: false } : m));
    } finally {
      setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, isStreaming: false } : m));
      touchSession(activeSession.id, text);
      // The server generates the session title from the first message fire-and-forget,
      // so an immediate refetch usually still returns the placeholder. Poll once more.
      const isFirstMessage = messages.filter(m => m.role === 'user').length === 1;
      if (isFirstMessage) {
        refetch().catch(() => {});
        setTimeout(() => {
          refetch().then(() => {
            tutorApi.getSession(activeSession.id).then(({ data }) => {
              if (data) setActiveSession(prev => prev?.id === data.id ? { ...prev, title: data.title } : prev);
            });
          }).catch(() => {});
        }, 2500);
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
    activeSession, messages, input, setInput, isStreaming, creating,
    allNotes, sources, availableNotes, noteSearch, setNoteSearch, maxNotes: MAX_NOTES,
    revealAnswer, setRevealAnswer, suggestions,
    noteOffer, setNoteOffer, offerSaving, offerSaved, resolvedTopics, setResolvedTopics,
    bottomRef, inputRef,
    createSession, changeMode, sendMessage, saveTitle,
    addNote, removeNote, toggleNote, acceptOffer,
  };
}
