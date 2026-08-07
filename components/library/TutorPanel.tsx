'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  tutorApi,
  streamTutorChat,
  TutorMessage,
  TutorSession,
  TutorNoteMeta,
} from '@/lib/api/tutor';
import { notesApi } from '@/lib/api/documents';
import { invalidatePrefix } from '@/lib/api';
import { useTutorSessions } from '@/context/TutorSessionsContext';
import TutorModeDropdown, { TutorMode } from '@/components/tutor/TutorModeDropdown';
import { useAuth } from '@/hooks/useAuth';
import { useEmptyChatCleanup } from '@/hooks/useEmptyChatCleanup';
import TutorInput from '@/components/tutor/TutorInput';
import UserBubble from '@/components/tutor/UserBubble';
import AssistantMessage from '@/components/tutor/AssistantMessage';
import ContextPicker from '@/components/tutor/ContextPicker';

interface Props {
  noteId: string;
  sessionId: string | null;
  onSessionCreated: (id: string | null) => void;
  onClose: () => void;
  initialMessage?: string;
  initialReveal?: boolean;
  onInitialMessageConsumed?: () => void;
}

type UIMessage = TutorMessage & { isStreaming?: boolean };

let msgIdCounter = 0;
function nextId() { return `local-${++msgIdCounter}`; }

export default function TutorPanel({ noteId, sessionId, onSessionCreated, onClose, initialMessage, initialReveal, onInitialMessageConsumed }: Props) {
  const { currentUser } = useAuth();
  const { refetch: refetchSessions } = useTutorSessions();
  const [session, setSession] = useState<TutorSession | null>(null);
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [isStreaming, setIsStreaming] = useState(false);
  const [showContextPanel, setShowContextPanel] = useState(false);
  const [revealAnswer, setRevealAnswer] = useState(false);
  const [noteSearch, setNoteSearch] = useState('');
  const [resolvedTopics, setResolvedTopics] = useState<string[]>([]);
  const [allNotes, setAllNotes] = useState<{ id: string; summary: string | null; document: { title: string } }[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const initialMessageSentRef = useRef(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // A pending initialMessage counts as busy — it sends on a short delay after init.
  useEmptyChatCleanup({
    sessionId: session?.id ?? null,
    loadedId: session?.id ?? null,
    messageCount: messages.length,
    busy: isStreaming || loading || !!initialMessage,
    onDiscarded: () => onSessionCreated(null),
  });

  useEffect(() => {
    notesApi.getAll().then(({ data }) => {
      if (data) setAllNotes(data as typeof allNotes);
    });
  }, []);

  useEffect(() => {
    async function init() {
      setLoading(true);
      if (sessionId) {
        const { data } = await tutorApi.getSession(sessionId);
        if (data) { setSession(data); setMessages(data.messages ?? []); }
      } else {
        const { data: existing } = await tutorApi.getSessions();
        const match = existing?.find(s => s.noteIds.includes(noteId));
        if (match) {
          const { data } = await tutorApi.getSession(match.id);
          if (data) { setSession(data); setMessages(data.messages ?? []); onSessionCreated(data.id); }
        } else {
          const { data } = await tutorApi.createSession({ noteIds: [noteId], mode: 'tutor' });
          if (data) {
            setSession(data);
            setMessages(data.messages ?? []);
            onSessionCreated(data.id);
            refetchSessions();
          }
        }
      }
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [noteId]);

  const sendText = useCallback(async (text: string, withReveal = false) => {
    if (!text || isStreaming || !session || !currentUser) return;

    const token = await currentUser.getIdToken();
    setRevealAnswer(false);
    if (inputRef.current) { inputRef.current.style.height = 'auto'; }

    const userMsg: UIMessage = { id: nextId(), sessionId: session.id, role: 'user', content: text, createdAt: new Date().toISOString() };
    const assistantId = nextId();
    const assistantMsg: UIMessage = { id: assistantId, sessionId: session.id, role: 'assistant', content: '', createdAt: new Date().toISOString(), isStreaming: true };

    setMessages(prev => [...prev, userMsg, assistantMsg]);
    setIsStreaming(true);

    try {
      await streamTutorChat(
        session.id,
        withReveal ? `${text}\n\n[STUDENT_REQUESTING_DIRECT_ANSWER]` : text,
        chunk => setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: m.content + chunk } : m)),
        () => {},
        token,
        undefined,
        resolved => setResolvedTopics(prev => [...prev, resolved.topic])
      );
    } catch {
      setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: 'Something went wrong. Please try again.', isStreaming: false } : m));
    } finally {
      setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, isStreaming: false } : m));
      setIsStreaming(false);
      // streamTutorChat bypasses the api cache layer, so invalidate manually
      // so the next panel open fetches fresh session data with all messages
      invalidatePrefix('/tutor');
    }
  }, [isStreaming, session, currentUser]);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text) return;
    setInput('');
    await sendText(text, revealAnswer);
  }, [input, revealAnswer, sendText]);

  async function removeNote(id: string) {
    if (!session) return;
    const { data } = await tutorApi.updateNotes(session.id, session.noteIds.filter(n => n !== id));
    if (data) setSession(data);
  }

  async function addNote(id: string) {
    if (!session || session.noteIds.length >= 15) return;
    const { data } = await tutorApi.updateNotes(session.id, [...session.noteIds, id]);
    if (data) setSession(data);
  }

  useEffect(() => {
    if (!loading && session && initialMessage && !initialMessageSentRef.current) {
      initialMessageSentRef.current = true;
      setTimeout(() => {
        sendText(initialMessage, initialReveal).then(() => onInitialMessageConsumed?.());
      }, 150);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, session]);

  const loadedNoteIds = new Set(session?.noteIds ?? []);
  const availableNotes = allNotes.filter(n => {
    if (loadedNoteIds.has(n.id)) return false;
    if (!noteSearch) return true;
    return n.document.title.toLowerCase().includes(noteSearch.toLowerCase());
  });

  async function changeMode(mode: TutorMode) {
    if (!session || session.mode === mode) return;
    const { data } = await tutorApi.updateMode(session.id, mode);
    if (data) setSession(data);
  }

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: 'var(--bg-page)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 shrink-0">
        <span className="text-xs font-semibold text-[var(--text-1)]">AI Tutor</span>
        <div className="flex items-center gap-2">
          {session && (
            <TutorModeDropdown
              value={session.mode as TutorMode}
              onChange={changeMode}
            />
          )}
          <button onClick={onClose} className="text-[var(--text-3)] hover:text-[var(--text-1)] transition-colors leading-none text-lg">×</button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
        {loading && (
          <div className="flex justify-center py-8">
            <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--brand)', borderTopColor: 'transparent' }} />
          </div>
        )}
        {messages.map(msg => (
          msg.role === 'user' ? (
            <UserBubble key={msg.id} content={msg.content} />
          ) : (
            <AssistantMessage key={msg.id} content={msg.content} isStreaming={msg.isStreaming} />
          )
        ))}
        {messages.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center h-full text-center gap-3 py-20">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(255,101,0,0.15), rgba(255,154,60,0.15))' }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" strokeWidth="1.75"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--text-1)]">Ask me anything about this note</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-3)' }}>I have this note loaded as context</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 px-3 pb-3 relative">
        {resolvedTopics.length > 0 && (
          <div className="mb-2 px-3 py-1.5 rounded-xl text-xs flex items-center justify-between gap-2" style={{ backgroundColor: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
            <div className="flex items-center gap-1.5">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
              <span style={{ color: '#22C55E' }}>
                {resolvedTopics.length === 1 ? `"${resolvedTopics[0]}" understood` : `${resolvedTopics.length} weak topics understood`}
              </span>
            </div>
            <button onClick={() => setResolvedTopics([])} className="opacity-50 hover:opacity-100" style={{ color: '#22C55E' }}>×</button>
          </div>
        )}
        {session && (
          <ContextPicker
            open={showContextPanel}
            loadedNotes={session.notes.map((n: TutorNoteMeta) => ({ id: n.id, title: n.document.title }))}
            availableNotes={availableNotes.map(n => ({ id: n.id, title: n.document.title }))}
            noteSearch={noteSearch}
            onNoteSearchChange={setNoteSearch}
            onRemove={removeNote}
            onAdd={addNote}
            onClose={() => setShowContextPanel(false)}
          />
        )}
        <TutorInput
          value={input}
          onChange={setInput}
          onSend={send}
          disabled={isStreaming}
          placeholder="Ask your tutor…"
          contextNotes={session?.notes.map((n: TutorNoteMeta) => ({ id: n.id, title: n.document.title })) ?? []}
          onAddContext={() => setShowContextPanel(v => !v)}
          onRemoveContext={removeNote}
          revealAnswer={revealAnswer}
          onToggleReveal={() => setRevealAnswer(v => !v)}
          inputRef={inputRef}
        />
      </div>
    </div>
  );
}
