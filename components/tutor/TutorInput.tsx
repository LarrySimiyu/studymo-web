'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ArrowUp, FileText, Lightbulb, Plus, X } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

export interface ContextNote { id: string; title: string }

interface Props {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  disabled?: boolean;
  placeholder?: string;
  contextNotes: ContextNote[];
  onAddContext?: () => void;
  contextPillClassName?: string;
  onRemoveContext: (id: string) => void;
  revealAnswer: boolean;
  onToggleReveal: () => void;
  inputRef?: React.RefObject<HTMLTextAreaElement>;
}

const MAX_HEIGHT = 200;
const MULTILINE_AT = 44;

const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

export default function TutorInput({
  value, onChange, onSend, disabled, placeholder,
  contextNotes, onAddContext, contextPillClassName, onRemoveContext,
  revealAnswer, onToggleReveal, inputRef: externalRef,
}: Props) {
  const internalRef = useRef<HTMLTextAreaElement>(null);
  const ref = externalRef ?? internalRef;
  const [multiline, setMultiline] = useState(false);

  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    const next = Math.min(el.scrollHeight, MAX_HEIGHT);
    el.style.height = `${next}px`;
    setMultiline(next > MULTILINE_AT);
  }, [value, ref]);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-1.5 mb-2">
        <Button
          variant="pill"
          size="pill"
          onClick={onToggleReveal}
          title="Get the direct answer with your next message"
          aria-pressed={revealAnswer}
          className={cn(
            revealAnswer &&
              'bg-[var(--brand-subtle)] border-[var(--brand-border)] text-[var(--brand-ink)] hover:bg-[var(--brand-subtle)] hover:text-[var(--brand-ink)]'
          )}
        >
          <Lightbulb size={12} />
          Just tell me
        </Button>

        {onAddContext && (
          <Button variant="pill" size="pill" onClick={onAddContext} className={contextPillClassName}>
            <Plus size={12} />
            Add context
          </Button>
        )}

        {contextNotes.map(n => (
          <span
            key={n.id}
            className={cn(
              buttonVariants({ variant: 'pill', size: 'pill' }),
              'text-[var(--text-1)] hover:bg-[var(--bg-card)] pr-2'
            )}
          >
            <FileText size={12} className="shrink-0" style={{ color: 'var(--text-3)' }} />
            <span className="max-w-[140px] truncate">{n.title}</span>
            <button
              onClick={() => onRemoveContext(n.id)}
              aria-label={`Remove ${n.title}`}
              className="shrink-0 rounded-full p-0.5 transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text-1)]"
              style={{ color: 'var(--text-3)' }}
            >
              <X size={12} />
            </button>
          </span>
        ))}
      </div>

      <div
        className={cn(
          'flex gap-2 p-2 pl-4 rounded-2xl border bg-[var(--bg-card)] border-[var(--border)]',
          'shadow-[0_1px_2px_rgba(0,0,0,0.04),0_6px_16px_-4px_rgba(0,0,0,0.08)]',
          'transition-[border-color,box-shadow] duration-150',
          'focus-within:border-[var(--brand-border)]',
          'focus-within:shadow-[0_0_0_3px_var(--brand-subtle),0_6px_16px_-4px_rgba(0,0,0,0.08)]',
          multiline ? 'items-end' : 'items-center'
        )}
      >
        <textarea
          ref={ref}
          value={value}
          rows={1}
          onChange={e => onChange(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSend(); }
          }}
          disabled={disabled}
          placeholder={placeholder ?? 'Ask your tutor…'}
          className="flex-1 min-w-0 bg-transparent outline-none resize-none py-1.5 text-sm leading-relaxed text-[var(--text-1)] placeholder-[var(--text-3)] disabled:opacity-50"
          style={{ maxHeight: MAX_HEIGHT }}
        />

        <button
          onClick={onSend}
          disabled={!value.trim() || disabled}
          aria-label="Send"
          className="w-9 h-9 shrink-0 rounded-xl flex items-center justify-center transition-opacity disabled:opacity-30 hover:opacity-90"
          style={{ backgroundColor: 'var(--brand)' }}
        >
          <ArrowUp size={16} color="white" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
