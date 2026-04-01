'use client';

import { useRef } from 'react';

export interface ContextNote { id: string; title: string }

interface Props {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  disabled?: boolean;
  placeholder?: string;
  contextNotes: ContextNote[];
  onAddContext: () => void;
  onRemoveContext: (id: string) => void;
  revealAnswer: boolean;
  onToggleReveal: () => void;
  inputRef?: React.RefObject<HTMLTextAreaElement>;
}

export default function TutorInput({
  value, onChange, onSend, disabled, placeholder,
  contextNotes, onAddContext, onRemoveContext,
  revealAnswer, onToggleReveal, inputRef: externalRef,
}: Props) {
  const internalRef = useRef<HTMLTextAreaElement>(null);
  const ref = externalRef ?? internalRef;

  return (
    <div>
      {/* Context chips */}
      <div className="flex flex-wrap items-center gap-1.5 mb-2">
        <button
          onClick={onAddContext}
          className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs transition-colors hover:opacity-80"
          style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-md)', color: 'var(--text-2)' }}
        >
          <span className="font-medium">+</span>
          Add context
        </button>
        {contextNotes.map(n => (
          <span
            key={n.id}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs"
            style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-md)', color: 'var(--text-1)' }}
          >
            {/* Doc icon */}
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0" style={{ color: 'var(--text-3)' }}>
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            <span className="max-w-[140px] truncate">{n.title}</span>
            <button
              onClick={() => onRemoveContext(n.id)}
              className="leading-none hover:text-[var(--text-1)] transition-colors ml-0.5"
              style={{ color: 'var(--text-3)' }}
            >
              ×
            </button>
          </span>
        ))}
      </div>

      {/* Input box */}
      <div
        className="rounded-xl focus-within:ring-1 focus-within:ring-[#9747FF]/40 transition-shadow"
        style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-md)' }}
      >
        <textarea
          ref={ref}
          value={value}
          onChange={e => onChange(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSend(); }
          }}
          onInput={e => {
            const el = e.target as HTMLTextAreaElement;
            el.style.height = 'auto';
            el.style.height = Math.min(el.scrollHeight, 160) + 'px';
          }}
          disabled={disabled}
          placeholder={placeholder ?? 'Ask your tutor…'}
          rows={3}
          className="w-full bg-transparent outline-none resize-none text-sm text-[var(--text-1)] placeholder-[var(--text-3)] leading-relaxed disabled:opacity-50 px-4 pt-3 pb-2"
          style={{ minHeight: 72, maxHeight: 160 }}
        />

        {/* Bottom toolbar */}
        <div className="flex items-center justify-between px-3 pb-2.5">
          {/* Reveal toggle */}
          <button
            onClick={onToggleReveal}
            title="Get the direct answer with your next message"
            className="flex items-center gap-1.5 px-2 py-1 rounded-full text-xs transition-all hover:opacity-80"
            style={revealAnswer
              ? { backgroundColor: '#F59E0B20', border: '1px solid #F59E0B60', color: '#F59E0B' }
              : { color: 'var(--text-3)' }
            }
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
            </svg>
            {revealAnswer && <span>Just tell me</span>}
          </button>

          {/* Send */}
          <button
            onClick={onSend}
            disabled={!value.trim() || disabled}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-opacity disabled:opacity-30 hover:opacity-90"
            style={{ backgroundColor: '#9747FF' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 19V5M5 12l7-7 7 7" />
            </svg>
          </button>
        </div>
      </div>

      <p className="text-[10px] text-center mt-1.5" style={{ color: 'var(--text-3)' }}>
        Enter to send · Shift+Enter for new line
      </p>
    </div>
  );
}
