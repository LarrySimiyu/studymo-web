'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { marked } from 'marked';
import {
  tutorApi,
  streamTutorChat,
  TutorMessage,
  TutorSession,
  TutorNoteMeta,
} from '@/lib/api/tutor';
import { notesApi } from '@/lib/api/documents';
import { useAuth } from '@/hooks/useAuth';
import TutorInput from '@/components/tutor/TutorInput';
import UserBubble from '@/components/tutor/UserBubble';
import ContextPicker from '@/components/tutor/ContextPicker';

interface Props {
  noteId: string;
  sessionId: string | null;
  onSessionCreated: (id: string) => void;
  onClose: () => void;
}

type UIMessage = TutorMessage & { isStreaming?: boolean };

function renderMarkdown(text: string): string {
  const collapsed = text.replace(/\n{3,}/g, '\n\n');
  return marked.parse(collapsed, { breaks: true }) as string;
}

let msgIdCounter = 0;
function nextId() { return `local-${++msgIdCounter}`; }

export default function TutorPanel({ noteId, sessionId, onSessionCreated, onClose }: Props) {
  const { currentUser } = useAuth();
  const [session, setSession] = useState<TutorSession | null>(null);
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [isStreaming, setIsStreaming] = useState(false);
  const [showContextPanel, setShowContextPanel] = useState(false);
  const [revealAnswer, setRevealAnswer] = useState(false);
  const [noteSearch, setNoteSearch] = useState('');
  const [allNotes, setAllNotes] = useState<{ id: string; summary: string | null; document: { title: string } }[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
          if (data) { setSession(data); setMessages(data.messages ?? []); onSessionCreated(data.id); }
        }
      }
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [noteId]);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || isStreaming || !session || !currentUser) return;

    const token = await currentUser.getIdToken();
    const wasReveal = revealAnswer;
    setRevealAnswer(false);
    setInput('');
    if (inputRef.current) { inputRef.current.style.height = 'auto'; }

    const userMsg: UIMessage = { id: nextId(), sessionId: session.id, role: 'user', content: text, createdAt: new Date().toISOString() };
    const assistantId = nextId();
    const assistantMsg: UIMessage = { id: assistantId, sessionId: session.id, role: 'assistant', content: '', createdAt: new Date().toISOString(), isStreaming: true };

    setMessages(prev => [...prev, userMsg, assistantMsg]);
    setIsStreaming(true);

    try {
      await streamTutorChat(
        session.id,
        wasReveal ? `${text}\n\n[STUDENT_REQUESTING_DIRECT_ANSWER]` : text,
        chunk => setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: m.content + chunk } : m)),
        () => {},
        token,
      );
    } catch {
      setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: 'Something went wrong. Please try again.', isStreaming: false } : m));
    } finally {
      setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, isStreaming: false } : m));
      setIsStreaming(false);
    }
  }, [input, isStreaming, session, currentUser, revealAnswer]);

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

  const loadedNoteIds = new Set(session?.noteIds ?? []);
  const availableNotes = allNotes.filter(n => {
    if (loadedNoteIds.has(n.id)) return false;
    if (!noteSearch) return true;
    return n.document.title.toLowerCase().includes(noteSearch.toLowerCase());
  });

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: 'var(--bg-page)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 shrink-0">
        <span className="text-xs font-semibold text-[var(--text-1)]">AI Tutor</span>
        <button onClick={onClose} className="text-[var(--text-3)] hover:text-[var(--text-1)] transition-colors leading-none text-lg">×</button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
        {loading && (
          <div className="flex justify-center py-8">
            <div className="w-5 h-5 border-2 border-[#9747FF] border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        {messages.map(msg => (
          msg.role === 'user' ? (
            <UserBubble key={msg.id} content={msg.content} />
          ) : (
            <div
              key={msg.id}
              className="tutor-message text-sm text-[var(--text-1)] leading-relaxed"
              dangerouslySetInnerHTML={{
                __html: renderMarkdown(msg.content) + (msg.isStreaming ? '<span class="tutor-cursor"></span>' : ''),
              }}
            />
          )
        ))}
        {messages.length === 0 && !loading && (
          <p className="text-xs text-[var(--text-3)] text-center py-6">Ask anything about this note…</p>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 px-3 pb-3 relative">
        {showContextPanel && session && (
          <ContextPicker
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
