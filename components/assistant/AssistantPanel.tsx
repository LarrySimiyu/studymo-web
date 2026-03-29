'use client';

import { useEffect, useRef, useState } from 'react';
import { useAssistant } from '@/context/AssistantContext';
import { useAuth } from '@/hooks/useAuth';

const ACTION_LABELS: Record<string, string> = {
  navigate: '→ Navigating…',
  generate_quiz: '📝 Opening quiz…',
  generate_exam: '📋 Opening practice exam…',
  create_study_plan: '📅 Opening study plan…',
  open_timer: '⏱ Opening timer…',
};

function ActionCard({ action, onExecute }: { action: Record<string, unknown>; onExecute: () => void }) {
  const label = ACTION_LABELS[action.type as string] ?? '→ Taking action…';
  return (
    <button
      onClick={onExecute}
      className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs mt-1 transition-colors hover:opacity-80"
      style={{ backgroundColor: '#9747FF15', border: '1px solid #9747FF40', color: '#9747FF' }}
    >
      {label}
      <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M2 6h8M6 2l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

export default function AssistantPanel() {
  const {
    isOpen, isTutoringMode, messages, isLoading,
    openAssistant, closeAssistant, toggleTutoringMode, sendMessage, handleAction, clearSession,
  } = useAssistant();
  const { dbUser } = useAuth();
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get first subject tag for suggestion chip
  const firstName = dbUser?.name?.split(' ')[0] ?? 'there';

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  function handleSend() {
    const text = input.trim();
    if (!text) return;
    setInput('');
    sendMessage(text);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const SUGGESTION_CHIPS = [
    'When is my next test?',
    "What am I struggling with?",
    'How is my streak?',
  ];

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 left-6 z-40">
        <div className="relative">
          <span className="absolute inset-0 rounded-full animate-ping opacity-30" style={{ backgroundColor: '#9747FF' }} />
          <button
            onClick={openAssistant}
            className="relative w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105"
            style={{ backgroundColor: '#9747FF' }}
            title="Ask Studymo anything (⌘K)"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed bottom-6 left-6 z-40 flex flex-col rounded-2xl shadow-2xl overflow-hidden"
      style={{
        width: 400,
        height: 520,
        backgroundColor: '#111111',
        border: '1px solid #2A2A2A',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 shrink-0" style={{ borderBottom: '1px solid #2A2A2A' }}>
        <div className="flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9747FF" strokeWidth="2">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
          </svg>
          <span className="text-sm font-semibold text-white">Studymo Assistant</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Tutoring Mode toggle */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs" style={{ color: isTutoringMode ? '#9747FF' : '#6B7280' }}>
              {isTutoringMode ? 'Tutoring 🎓' : 'Tutoring'}
            </span>
            <button
              onClick={toggleTutoringMode}
              className="w-8 h-4 rounded-full relative transition-colors"
              style={{ backgroundColor: isTutoringMode ? '#9747FF' : '#2A2A2A' }}
              title="Toggle tutoring mode — I'll guide you to answers instead of giving them directly"
            >
              <div
                className="absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform"
                style={{ transform: isTutoringMode ? 'translateX(17px)' : 'translateX(2px)' }}
              />
            </button>
          </div>
          {/* New session */}
          <button
            onClick={clearSession}
            className="text-gray-500 hover:text-gray-300 transition-colors p-1"
            title="New conversation"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
          </button>
          {/* Close */}
          <button onClick={closeAssistant} className="text-gray-500 hover:text-white transition-colors p-1">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Tutoring mode banner */}
      {isTutoringMode && (
        <div className="px-4 py-2 text-xs shrink-0" style={{ backgroundColor: '#9747FF15', borderBottom: '1px solid #9747FF30', color: '#9747FF' }}>
          🎓 Tutoring mode active — I'll guide you, not give you answers
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="flex flex-col gap-4">
            <div className="text-sm text-gray-300">
              Hi {firstName}! 👋 I'm your Studymo assistant. Ask me anything about your studies, or try:
            </div>
            <div className="flex flex-col gap-2">
              {SUGGESTION_CHIPS.map(chip => (
                <button
                  key={chip}
                  onClick={() => sendMessage(chip)}
                  className="text-left text-xs px-3 py-2 rounded-lg transition-colors hover:opacity-90"
                  style={{ backgroundColor: '#1A1A1A', border: '1px solid #2A2A2A', color: '#9CA3AF' }}
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className="max-w-[85%]">
                {msg.role === 'assistant' && (
                  <div className="flex items-start gap-2">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9747FF" strokeWidth="2" className="mt-1 shrink-0">
                      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                    </svg>
                    <div>
                      <div
                        className="text-sm leading-relaxed text-gray-200 whitespace-pre-wrap"
                      >
                        {msg.content}
                        {msg.isStreaming && (
                          <span className="inline-block w-1 h-3 ml-0.5 rounded-sm animate-pulse" style={{ backgroundColor: '#9747FF' }} />
                        )}
                      </div>
                      {msg.action && !msg.isStreaming && (
                        <ActionCard
                          action={msg.action as Record<string, unknown>}
                          onExecute={() => handleAction(msg.action as Record<string, unknown>)}
                        />
                      )}
                    </div>
                  </div>
                )}
                {msg.role === 'user' && (
                  <div
                    className="text-sm leading-relaxed text-white px-3 py-2 rounded-xl"
                    style={{ backgroundColor: '#9747FF' }}
                  >
                    {msg.content}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
          <div className="flex justify-start">
            <div className="flex items-center gap-1.5 px-3 py-2">
              <div className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: '#9747FF', animationDelay: '0ms' }} />
              <div className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: '#9747FF', animationDelay: '150ms' }} />
              <div className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: '#9747FF', animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-3 shrink-0" style={{ borderTop: '1px solid #2A2A2A' }}>
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything…"
            disabled={isLoading}
            className="flex-1 px-3 py-2 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none disabled:opacity-50"
            style={{ backgroundColor: '#1A1A1A', border: '1px solid #2A2A2A' }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-opacity disabled:opacity-40"
            style={{ backgroundColor: '#9747FF' }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
