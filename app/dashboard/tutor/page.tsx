'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import {
  tutorApi,
  streamTutorChat,
  TutorSession,
  TutorSessionSummary,
  TutorMessage,
  TutorNoteMeta,
} from '@/lib/api/tutor';
import { notesApi } from '@/lib/api/documents';

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

function buildWelcome(name: string, noteCount: number): string {
  return `Hi ${name}! 🎓 Ready to study? I have ${noteCount} note${noteCount !== 1 ? 's' : ''} loaded.\n\nI won't give you direct answers — instead I'll ask you questions to help you think through the material yourself. This is proven to help you retain information much better.\n\nLet's start: What topic from your notes would you like to work on?`;
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

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  const userName = dbUser?.name?.split(' ')[0] ?? 'there';

  // ── load sessions ──────────────────────────────────────────────────────────

  useEffect(() => {
    tutorApi.getSessions().then(({ data }) => {
      if (data) setSessions(data);
      setSessionsLoading(false);
    });
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
    const welcome: UIMessage = { id: nextId(), role: 'assistant', content: buildWelcome(userName, data.notes.length) };
    setMessages([welcome, ...data.messages]);
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
      const welcome: UIMessage = { id: nextId(), role: 'assistant', content: buildWelcome(userName, data.notes.length) };
      setMessages([welcome]);
      setTimeout(() => inputRef.current?.focus(), 100);
    } finally {
      setCreatingSession(false);
    }
  }

  async function sendMessage() {
    const text = input.trim();
    if (!text || isStreaming || !activeSession || !currentUser) return;
    setInput('');
    setIsStreaming(true);

    const userMsg: UIMessage = { id: nextId(), role: 'user', content: text };
    const assistantId = nextId();
    const assistantMsg: UIMessage = { id: assistantId, role: 'assistant', content: '', isStreaming: true };
    setMessages(prev => [...prev, userMsg, assistantMsg]);

    try {
      const token = await currentUser.getIdToken();
      await streamTutorChat(
        activeSession.id,
        text,
        chunk => {
          setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: m.content + chunk } : m));
        },
        () => {},
        token
      );
    } catch {
      setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: 'Something went wrong. Please try again.', isStreaming: false } : m));
    } finally {
      setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, isStreaming: false } : m));
      setSessions(prev => prev.map(s => s.id === activeSession.id ? { ...s, lastMessage: text.slice(0, 100), updatedAt: new Date().toISOString() } : s));
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

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
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
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
            style={{ backgroundColor: '#9747FF', color: 'white' }}
          >
            {creatingSession ? (
              <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2">
                <path d="M6 1v10M1 6h10" strokeLinecap="round" />
              </svg>
            )}
            New
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
            sessions.map(s => (
              <div
                key={s.id}
                onClick={() => loadSession(s.id)}
                className="w-full text-left px-4 py-3 group relative transition-colors hover:bg-black/5 cursor-pointer"
                style={activeSession?.id === s.id ? { borderLeft: '2px solid #9747FF', backgroundColor: 'var(--brand-subtle)' } : { borderLeft: '2px solid transparent' }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <p className="text-xs font-medium text-[var(--text-1)] truncate">{s.title}</p>
                    </div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-xs text-[var(--text-3)]">{timeAgo(s.updatedAt)}</span>
                    </div>
                    {s.lastMessage && (
                      <p className="text-xs text-[var(--text-3)] truncate">{s.lastMessage}</p>
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
            ))
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
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
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
                if (msg.role === 'assistant') {
                  return (
                    <div key={msg.id} className="flex items-start gap-2 max-w-[80%]">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: 'var(--bg-input)' }}>
                        <span className="text-sm">🎓</span>
                      </div>
                      <div className="px-4 py-3 rounded-2xl rounded-tl-sm text-sm text-[var(--text-1)] whitespace-pre-wrap leading-relaxed" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                        {msg.content}
                        {'isStreaming' in msg && msg.isStreaming && (
                          <span className="inline-block w-1 h-3 ml-0.5 rounded-sm animate-pulse" style={{ backgroundColor: '#9747FF' }} />
                        )}
                      </div>
                    </div>
                  );
                }
                return (
                  <div key={msg.id} className="flex justify-end">
                    <div className="px-4 py-3 rounded-2xl rounded-tr-sm text-sm text-white max-w-[80%] whitespace-pre-wrap leading-relaxed" style={{ backgroundColor: '#9747FF' }}>
                      {msg.content}
                    </div>
                  </div>
                );
              })}

              {isStreaming && messages[messages.length - 1]?.role !== 'assistant' && (
                <div className="flex items-center gap-1.5 pl-9">
                  {[0, 150, 300].map(delay => (
                    <div key={delay} className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: '#9747FF', animationDelay: `${delay}ms` }} />
                  ))}
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Context panel (slides up) */}
            {showContextPanel && (
              <div className="shrink-0 mx-4 mb-2 rounded-xl overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', maxHeight: 280 }}>
                <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-[var(--text-1)]">Loaded Notes</span>
                    <span className="text-xs text-[var(--text-2)]">{activeSession.noteIds.length} / 15</span>
                  </div>
                  <button onClick={() => setShowContextPanel(false)} className="text-[var(--text-2)] hover:text-[var(--text-1)] transition-colors">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 6 6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="overflow-y-auto" style={{ maxHeight: 220 }}>
                  {/* Loaded notes */}
                  {activeSession.notes.length === 0 ? (
                    <p className="text-xs text-[var(--text-3)] px-4 py-3">No notes loaded. Add notes below.</p>
                  ) : (
                    activeSession.notes.map((n: TutorNoteMeta) => (
                      <div key={n.id} className="flex items-center justify-between px-4 py-2.5 hover:bg-black/5">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-[var(--text-1)] truncate">{n.document.title}</p>
                          {n.summary && <p className="text-xs text-[var(--text-2)] truncate">{n.summary}</p>}
                        </div>
                        <button onClick={() => removeNote(n.id)} className="ml-3 text-[var(--text-3)] hover:text-red-400 transition-colors shrink-0" title="Remove">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 6 6 18M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))
                  )}
                  {/* Divider */}
                  <div className="px-4 py-2" style={{ borderTop: '1px solid var(--border)' }}>
                    <input
                      type="text"
                      value={noteSearch}
                      onChange={e => setNoteSearch(e.target.value)}
                      placeholder="Search your notes…"
                      className="w-full px-3 py-1.5 rounded-lg text-xs text-[var(--text-1)] placeholder-[var(--text-3)] focus:outline-none"
                      style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-md)' }}
                    />
                  </div>
                  {availableNotes.map(n => (
                    <div key={n.id} className="flex items-center justify-between px-4 py-2.5 hover:bg-black/5">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-[var(--text-1)] truncate">{n.document.title}</p>
                        {n.summary && <p className="text-xs text-[var(--text-2)] truncate">{n.summary}</p>}
                      </div>
                      <button
                        onClick={() => addNote(n.id)}
                        disabled={activeSession.noteIds.length >= 15}
                        className="ml-3 text-xs px-2 py-1 rounded-lg transition-colors disabled:opacity-40"
                        style={{ backgroundColor: 'var(--bg-input)', color: '#9747FF' }}
                        title={activeSession.noteIds.length >= 15 ? 'Max reached' : 'Add note'}
                      >
                        {activeSession.noteIds.length >= 15 ? 'Max' : 'Add'}
                      </button>
                    </div>
                  ))}
                  {availableNotes.length === 0 && noteSearch && (
                    <p className="text-xs text-[var(--text-3)] px-4 py-2">No notes match your search.</p>
                  )}
                </div>
              </div>
            )}

            {/* Input area */}
            <div className="px-4 pb-4 shrink-0">
              {/* Context button */}
              <button
                onClick={() => setShowContextPanel(v => !v)}
                className="mb-2 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-colors hover:opacity-80"
                style={{
                  backgroundColor: activeSession.noteIds.length > 0 ? 'var(--brand-subtle)' : 'var(--bg-card)',
                  border: `1px solid ${activeSession.noteIds.length > 0 ? 'var(--brand-border)' : 'var(--border)'}`,
                  color: activeSession.noteIds.length > 0 ? '#9747FF' : 'var(--text-2)',
                }}
              >
                📚 {activeSession.noteIds.length > 0 ? `${activeSession.noteIds.length} note${activeSession.noteIds.length !== 1 ? 's' : ''} loaded` : 'No notes loaded — add notes for better answers'}
              </button>

              <div className="flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  rows={1}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isStreaming}
                  placeholder={isStreaming ? 'Thinking…' : 'Message your tutor…'}
                  className="flex-1 px-4 py-3 rounded-xl text-sm text-[var(--text-1)] placeholder-[var(--text-3)] focus:outline-none resize-none disabled:opacity-50"
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    minHeight: 48,
                    maxHeight: 120,
                  }}
                  onInput={e => {
                    const el = e.target as HTMLTextAreaElement;
                    el.style.height = 'auto';
                    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
                  }}
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || isStreaming}
                  className="w-11 h-11 rounded-xl flex items-center justify-center transition-opacity disabled:opacity-40 shrink-0"
                  style={{ backgroundColor: '#9747FF' }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
