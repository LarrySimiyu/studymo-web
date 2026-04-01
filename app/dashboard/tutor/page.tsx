'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { marked } from 'marked';
import { useAuth } from '@/hooks/useAuth';
import {
  tutorApi,
  streamTutorChat,
  TutorSession,
  TutorSessionSummary,
  TutorMessage,
  TutorNoteMeta,
  NoteOffer,
} from '@/lib/api/tutor';
import { notesApi } from '@/lib/api/documents';
import TutorInput from '@/components/tutor/TutorInput';
import UserBubble from '@/components/tutor/UserBubble';
import ContextPicker from '@/components/tutor/ContextPicker';

// ─── types ──────────────────────────────────────────────────────────────────

type UIMessage = TutorMessage | { id: string; role: 'system' | 'assistant' | 'user'; content: string; isStreaming?: boolean };

// ─── helpers ────────────────────────────────────────────────────────────────

function timeAgo(date: string): string {
  const diff = (Date.now() - new Date(date).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function renderMarkdown(text: string): string {
  // Collapse 3+ consecutive newlines to 2, and 2 newlines between short lines to 1
  const collapsed = text
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\n\n(?=[^\n])/g, (_, offset, str) => {
      // If previous paragraph is short (< 120 chars) treat as single newline
      const prev = str.slice(0, offset).split('\n').pop() ?? '';
      return prev.length < 120 ? '\n' : '\n\n';
    });
  return marked.parse(collapsed, { breaks: true }) as string;
}

function buildWelcome(name: string, session: TutorSession): string {
  const { notes, weakTopicCount } = session;
  const noteCount = notes.length;

  const greeting = `Hi ${name}! 🎓`;

  const contextLine = noteCount === 0
    ? "I don't have any notes loaded yet — add some context using the button below, or ask me anything."
    : noteCount === 1
      ? `I have **${notes[0].document.title}** loaded.`
      : `I have **${noteCount} notes** loaded: ${notes.map(n => n.document.title).join(', ')}.`;

  const weakLine = weakTopicCount > 0
    ? `\n\nI can see you have **${weakTopicCount} weak topic${weakTopicCount !== 1 ? 's' : ''}** from quizzes on this material — I'll make sure we work through those.`
    : '';

  const prompt = noteCount === 0
    ? '\n\nWhat would you like to study today?'
    : '\n\nWhat topic would you like to start with, or should I pick one based on your notes?';

  return `${greeting} ${contextLine}${weakLine}${prompt}`;
}

let msgIdCounter = 0;
function nextId() { return `local-${++msgIdCounter}`; }

// ─── sub-components ─────────────────────────────────────────────────────────

// ModeBadge shelved with helper mode

// ─── main page ───────────────────────────────────────────────────────────────

export default function TutorPage() {
  const { currentUser, dbUser } = useAuth();
  const searchParams = useSearchParams();
  const initialSession = searchParams.get('session');

  const [sessions, setSessions] = useState<TutorSessionSummary[]>([]);
  const [activeSession, setActiveSession] = useState<TutorSession | null>(null);
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [showContextPanel, setShowContextPanel] = useState(false);
  // const [showNewMenu, setShowNewMenu] = useState(false);
  const [noteSearch, setNoteSearch] = useState('');
  const [allNotes, setAllNotes] = useState<{ id: string; summary: string | null; document: { title: string } }[]>([]);
  const [creatingSession, setCreatingSession] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState('');
  const [revealAnswer, setRevealAnswer] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [noteOffer, setNoteOffer] = useState<NoteOffer | null>(null);
  const [offerSaving, setOfferSaving] = useState(false);
  const [offerSaved, setOfferSaved] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  const userName = dbUser?.name?.split(' ')[0] ?? 'there';

  // ── load sessions ──────────────────────────────────────────────────────────

  useEffect(() => {
    tutorApi.getSessions().then(({ data }) => {
      if (data) {
        setSessions(data);
        // Auto-select most recent session unless URL specifies one
        if (!initialSession && data.length > 0) {
          loadSession(data[0].id);
        }
      }
      setSessionsLoading(false);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── load all notes for context panel ──────────────────────────────────────

  useEffect(() => {
    notesApi.getAll().then(({ data }) => {
      if (data) setAllNotes(data as typeof allNotes);
    });
  }, []);

  // ── select session from URL ────────────────────────────────────────────────

  useEffect(() => {
    if (initialSession && !activeSession) {
      loadSession(initialSession);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialSession]);

  // ── auto scroll ───────────────────────────────────────────────────────────

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── functions ─────────────────────────────────────────────────────────────

  async function loadSession(id: string) {
    const { data } = await tutorApi.getSession(id);
    if (!data) return;
    setActiveSession(data);
    const welcome: UIMessage = { id: nextId(), role: 'assistant', content: buildWelcome(userName, data) };
    setMessages([welcome, ...data.messages]);
    setSuggestions([]);
    // Only show suggestions if the session has no real messages yet
    if (data.messages.length === 0) {
      tutorApi.getSuggestions(id).then(({ data: s }) => {
        if (s?.suggestions) setSuggestions(s.suggestions);
      }).catch(() => {});
    }
    setTimeout(() => inputRef.current?.focus(), 100);
  }

  async function createSession() {
    if (creatingSession) return;
    setCreatingSession(true);
    try {
      const { data } = await tutorApi.createSession({ mode: 'tutor' });
      if (!data) return;
      setSessions(prev => [{ id: data.id, title: data.title, mode: 'tutor', noteIds: data.noteIds, messageCount: 0, lastMessage: null, createdAt: data.createdAt, updatedAt: data.updatedAt }, ...prev]);
      setActiveSession(data);
      const welcome: UIMessage = { id: nextId(), role: 'assistant', content: buildWelcome(userName, data) };
      setMessages([welcome]);
      setSuggestions([]);
      tutorApi.getSuggestions(data.id).then(({ data: s }) => {
        if (s?.suggestions) setSuggestions(s.suggestions);
      }).catch(() => {});
      setTimeout(() => inputRef.current?.focus(), 100);
    } finally {
      setCreatingSession(false);
    }
  }

  async function sendMessage() {
    const text = input.trim();
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
        offer => setNoteOffer(offer)
      );
    } catch {
      setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: 'Something went wrong. Please try again.', isStreaming: false } : m));
    } finally {
      setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, isStreaming: false } : m));
      // Refresh session to pick up auto-generated title after first message
      const isFirstMessage = messages.filter(m => m.role === 'user').length === 1;
      if (isFirstMessage) {
        tutorApi.getSessions().then(({ data }) => { if (data) setSessions(data); }).catch(() => {});
      } else {
        setSessions(prev => prev.map(s => s.id === activeSession.id ? { ...s, lastMessage: text.slice(0, 100), updatedAt: new Date().toISOString() } : s));
      }
      setIsStreaming(false);
    }
  }

  // async function toggleMode() { /* shelved — helper mode disabled */ }

  async function deleteSession(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    await tutorApi.deleteSession(id);
    setSessions(prev => prev.filter(s => s.id !== id));
    if (activeSession?.id === id) {
      setActiveSession(null);
      setMessages([]);
    }
  }

  async function saveTitle() {
    if (!activeSession || !titleDraft.trim()) { setEditingTitle(false); return; }
    await tutorApi.updateTitle(activeSession.id, titleDraft);
    setActiveSession({ ...activeSession, title: titleDraft });
    setSessions(prev => prev.map(s => s.id === activeSession.id ? { ...s, title: titleDraft } : s));
    setEditingTitle(false);
  }

  async function removeNote(noteId: string) {
    if (!activeSession) return;
    const newIds = activeSession.noteIds.filter((id: string) => id !== noteId);
    const { data } = await tutorApi.updateNotes(activeSession.id, newIds);
    if (data) setActiveSession(data);
  }

  async function addNote(noteId: string) {
    if (!activeSession) return;
    if (activeSession.noteIds.length >= 15) return;
    const newIds = [...activeSession.noteIds, noteId];
    const { data } = await tutorApi.updateNotes(activeSession.id, newIds);
    if (data) setActiveSession(data);
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

  const loadedNoteIds = new Set(activeSession?.noteIds ?? []);
  const availableNotes = allNotes.filter(n => {
    if (loadedNoteIds.has(n.id)) return false;
    if (!noteSearch) return true;
    return n.document.title.toLowerCase().includes(noteSearch.toLowerCase());
  });

  // ── render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex h-full gap-0 -m-6 overflow-hidden" style={{ height: 'calc(100vh - 48px)' }}>

      {/* ── Left sidebar ── */}
      <div className="w-72 flex flex-col shrink-0 overflow-hidden" style={{ backgroundColor: 'var(--bg-page)', borderRight: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between px-4 py-4 shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
          <h2 className="text-sm font-semibold text-[var(--text-1)]">AI Tutor</h2>
          <button
            onClick={createSession}
            disabled={creatingSession}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-base font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: '#9747FF' }}
            title="New session"
          >
            {creatingSession ? (
              <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
            ) : '+'}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {sessionsLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#9747FF', borderTopColor: 'transparent' }} />
            </div>
          ) : sessions.length === 0 ? (
            <p className="text-xs text-[var(--text-3)] text-center py-8 px-4">No sessions yet — start one to begin</p>
          ) : (
            <div className="p-3 space-y-2">
              {sessions.map(s => (
                <div
                  key={s.id}
                  onClick={() => loadSession(s.id)}
                  className="block p-3 rounded-xl transition-colors hover:border-purple-500/50 cursor-pointer group"
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    border: activeSession?.id === s.id ? '1px solid #9747FF' : '1px solid var(--border)',
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--text-1)] truncate">{s.title}</p>
                      <p className="text-xs text-[var(--text-3)] mt-0.5">{timeAgo(s.updatedAt)}</p>
                      {s.lastMessage && (
                        <p className="text-xs text-[var(--text-2)] mt-1 truncate">{s.lastMessage}</p>
                      )}
                    </div>
                    <button
                      onClick={e => deleteSession(s.id, e)}
                      className="opacity-0 group-hover:opacity-100 text-[var(--text-3)] hover:text-red-400 transition-all shrink-0 mt-0.5"
                      title="Delete session"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {!activeSession ? (
          // ── Welcome / mode selection ──
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="flex flex-col items-center gap-8 max-w-xl w-full text-center">
              <div>
                <div className="text-6xl mb-4">🎓</div>
                <h1 className="text-2xl font-bold text-[var(--text-1)]">Welcome to AI Tutor</h1>
                <p className="text-[var(--text-2)] text-sm mt-2">Choose a mode to get started</p>
              </div>

              <div className="flex flex-col gap-4 w-full max-w-sm">
                {/* Tutor card */}
                <div className="flex flex-col gap-4 p-6 rounded-2xl text-left" style={{ backgroundColor: 'var(--brand-subtle)', border: '1px solid var(--brand-border)' }}>
                  <div>
                    <div className="text-3xl mb-2">🎓</div>
                    <h3 className="font-semibold text-[var(--text-1)] text-base mb-1">Tutor Mode</h3>
                    <p className="text-xs text-[var(--text-2)] leading-relaxed">I'll guide you with questions instead of giving direct answers. Proven to improve retention and understanding.</p>
                  </div>
                  <button
                    onClick={createSession}
                    disabled={creatingSession}
                    className="w-full py-2.5 rounded-xl text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                    style={{ backgroundColor: '#9747FF' }}
                  >
                    {creatingSession ? 'Creating…' : 'Start Study Session'}
                  </button>
                </div>
              </div>

              <p className="text-xs text-[var(--text-3)]">You can switch modes at any time during a session</p>
            </div>
          </div>
        ) : (
          // ── Chat view ──
          <>
            {/* Top bar */}
            <div className="flex items-center justify-between px-5 py-3 shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {editingTitle ? (
                  <input
                    ref={titleInputRef}
                    autoFocus
                    value={titleDraft}
                    onChange={e => setTitleDraft(e.target.value)}
                    onBlur={saveTitle}
                    onKeyDown={e => { if (e.key === 'Enter') saveTitle(); if (e.key === 'Escape') setEditingTitle(false); }}
                    className="text-sm font-semibold text-[var(--text-1)] bg-transparent border-b focus:outline-none flex-1 min-w-0"
                    style={{ borderColor: '#9747FF' }}
                  />
                ) : (
                  <button
                    onClick={() => { setTitleDraft(activeSession.title); setEditingTitle(true); }}
                    className="text-sm font-semibold text-[var(--text-1)] truncate hover:text-[var(--text-2)] transition-colors max-w-xs"
                    title="Click to rename"
                  >
                    {activeSession.title}
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {/* Delete */}
                <button
                  onClick={e => deleteSession(activeSession.id, e)}
                  className="text-[var(--text-3)] hover:text-red-400 transition-colors p-1"
                  title="Delete session"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
              {messages.map(msg => {
                if (msg.role === 'system') {
                  return (
                    <div key={msg.id} className="flex justify-center">
                      <p className="text-xs text-[var(--text-2)] italic px-3 py-1 rounded-full" style={{ backgroundColor: 'var(--bg-card)' }}>
                        {msg.content}
                      </p>
                    </div>
                  );
                }
                if (msg.role === 'user') {
                  return <UserBubble key={msg.id} content={msg.content} />;
                }
                return (
                  <div
                    key={msg.id}
                    className="tutor-message text-sm text-[var(--text-1)] leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) + ('isStreaming' in msg && msg.isStreaming ? '<span class="tutor-cursor"></span>' : '') }}
                  />
                );
              })}

              {isStreaming && messages[messages.length - 1]?.role !== 'assistant' && (
                <div className="flex items-center gap-1.5">
                  {[0, 150, 300].map(delay => (
                    <div key={delay} className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: '#9747FF', animationDelay: `${delay}ms` }} />
                  ))}
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input area */}
            <div className="px-4 pb-4 shrink-0 relative">
              {suggestions.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => { setInput(s); setSuggestions([]); inputRef.current?.focus(); }}
                      className="text-xs px-3 py-1.5 rounded-full transition-colors hover:opacity-80"
                      style={{ backgroundColor: 'var(--brand-subtle)', border: '1px solid var(--brand-border)', color: '#9747FF' }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
              {offerSaved && (
                <div className="mb-2 px-3 py-2 rounded-xl text-xs flex items-center gap-2" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-2)' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9747FF" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
                  Added to notes successfully.
                </div>
              )}

              {noteOffer && (
                <div className="mb-2 px-3 py-2.5 rounded-xl text-sm flex items-start gap-3" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--brand-border)' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9747FF" strokeWidth="2" className="shrink-0 mt-0.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-[var(--text-1)] mb-0.5">
                      Save &ldquo;{noteOffer.heading}&rdquo; to <span style={{ color: '#9747FF' }}>{noteOffer.noteTitle}</span>?
                    </p>
                    <p className="text-xs text-[var(--text-3)] truncate">{noteOffer.content.slice(0, 80)}{noteOffer.content.length > 80 ? '…' : ''}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={acceptOffer}
                      disabled={offerSaving}
                      className="text-xs px-2.5 py-1 rounded-lg font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                      style={{ backgroundColor: '#9747FF' }}
                    >
                      {offerSaving ? 'Saving…' : 'Add to notes'}
                    </button>
                    <button
                      onClick={() => setNoteOffer(null)}
                      className="text-xs px-2 py-1 rounded-lg transition-colors"
                      style={{ color: 'var(--text-3)' }}
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              )}

              {showContextPanel && (
                <ContextPicker
                  loadedNotes={activeSession.notes.map((n: TutorNoteMeta) => ({ id: n.id, title: n.document.title }))}
                  availableNotes={availableNotes}
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
                onSend={sendMessage}
                disabled={isStreaming}
                placeholder={isStreaming ? 'Thinking…' : 'Message your tutor…'}
                contextNotes={activeSession.notes.map((n: TutorNoteMeta) => ({ id: n.id, title: n.document.title }))}
                onAddContext={() => setShowContextPanel(v => !v)}
                onRemoveContext={removeNote}
                revealAnswer={revealAnswer}
                onToggleReveal={() => setRevealAnswer(v => !v)}
                inputRef={inputRef}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
