'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ArrowUp, FileText, Lightbulb, Plus, X } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/Button';
import { TogglePill } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface ContextNote { id: string; title: string }

interface Props {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  disabled?: boolean;
  placeholder?: string;
  autoFocus?: boolean;
  /** Omit to hide the "Just tell me" toggle. */
  revealAnswer?: boolean;
  onToggleReveal?: () => void;
  /** Omit to hide the "Add context" pill. */
  onAddContext?: () => void;
  contextPillClassName?: string;
  contextNotes?: ContextNote[];
  /** Omit to render context pills without a remove button. */
  onRemoveContext?: (id: string) => void;
  /** Renders a dismiss button beside send. */
  onDismiss?: () => void;
  inputRef?: React.RefObject<HTMLTextAreaElement>;
}

const MAX_HEIGHT = 200;
const MULTILINE_AT = 44;

const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

export default function TutorInput({
  value, onChange, onSend, disabled, placeholder, autoFocus,
  revealAnswer, onToggleReveal,
  onAddContext, contextPillClassName, contextNotes = [], onRemoveContext,
  onDismiss, inputRef: externalRef,
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

  const showPillRow = !!onToggleReveal || !!onAddContext || contextNotes.length > 0;

  return (
    <div>
      {showPillRow && (
        <div className="flex flex-wrap items-center gap-1.5 mb-2">
          {onToggleReveal && (
            <TogglePill
              pressed={revealAnswer}
              onClick={onToggleReveal}
              title="Get the direct answer with your next message"
            >
              <Lightbulb size={12} />
              Just tell me
            </TogglePill>
          )}

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
                'text-[var(--text-1)] hover:bg-[var(--bg-card)]',
                onRemoveContext && 'pr-2'
              )}
            >
              <FileText size={12} className="shrink-0" style={{ color: 'var(--text-3)' }} />
              <span className="max-w-[140px] truncate">{n.title}</span>
              {onRemoveContext && (
                <button
                  onClick={() => onRemoveContext(n.id)}
                  aria-label={`Remove ${n.title}`}
                  className="shrink-0 rounded-full p-0.5 transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text-1)]"
                  style={{ color: 'var(--text-3)' }}
                >
                  <X size={12} />
                </button>
              )}
            </span>
          ))}
        </div>
      )}

      <div
        className={cn(
          'flex gap-2 p-2 pl-4 rounded-2xl border bg-[var(--bg-card)] border-[var(--border)]',
          'shadow-field',
          'transition-colors duration-150',
          multiline ? 'items-end' : 'items-center'
        )}
      >
        <textarea
          ref={ref}
          value={value}
          rows={1}
          autoFocus={autoFocus}
          onChange={e => onChange(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSend(); }
          }}
          disabled={disabled}
          placeholder={placeholder ?? 'Ask your tutor…'}
          className="flex-1 min-w-0 bg-transparent outline-none resize-none py-1.5 text-sm leading-relaxed text-[var(--text-1)] placeholder-[var(--text-3)] disabled:opacity-50"
          style={{ maxHeight: MAX_HEIGHT }}
        />

        {onDismiss && (
          <button
            onClick={onDismiss}
            aria-label="Hide"
            className="w-9 h-9 shrink-0 rounded-xl flex items-center justify-center transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text-1)]"
            style={{ color: 'var(--text-3)' }}
          >
            <X size={16} strokeWidth={2.5} />
          </button>
        )}

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
