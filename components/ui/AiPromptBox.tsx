'use client';

import { useRef, useState, type ReactNode } from 'react';
import { Paperclip, Globe, Lightbulb, Sparkles, ArrowUp, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export type PromptMode = {
  id: string;
  label: string;
  icon: LucideIcon;
};

export const DEFAULT_PROMPT_MODES: PromptMode[] = [
  { id: 'reasoning', label: 'Reasoning', icon: Lightbulb },
  { id: 'tutor', label: 'Tutor', icon: Sparkles },
  { id: 'research', label: 'Deep Research', icon: Globe },
];

type Props = {
  placeholder?: string;
  modes?: PromptMode[];
  footer?: ReactNode;
  autoFocus?: boolean;
  className?: string;
  onSubmit?: (value: string, activeModes: string[]) => void;
};

export default function AiPromptBox({
  placeholder = 'Ask Studymo anything…',
  modes = DEFAULT_PROMPT_MODES,
  footer,
  autoFocus = false,
  className,
  onSubmit,
}: Props) {
  const [value, setValue] = useState('');
  const [active, setActive] = useState<string[]>([]);
  const taRef = useRef<HTMLTextAreaElement>(null);

  const toggleMode = (id: string) =>
    setActive(prev => (prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]));

  const grow = (el: HTMLTextAreaElement) => {
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 220)}px`;
  };

  const submit = () => {
    if (!value.trim()) return;
    onSubmit?.(value.trim(), active);
  };

  return (
    <div className={cn('w-full', className)}>
      <div className="ai-beam-wrap rounded-[26px] p-[1.5px]" style={{ boxShadow: '0 25px 60px rgba(255,101,0,0.18), 0 8px 24px rgba(255,101,0,0.1)' }}>
      <div
        className="rounded-3xl px-4 pt-5 pb-4 sm:px-7 sm:pt-7 sm:pb-5 transition-shadow"
        style={{
          backgroundColor: 'var(--bg-card)',
          boxShadow: '0 12px 40px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.04)',
        }}
      >
        <div className="flex items-start gap-2.5 sm:gap-3">
          <Sparkles size={22} className="mt-1.5 shrink-0" style={{ color: '#FF6500' }} />
          <textarea
            ref={taRef}
            rows={1}
            autoFocus={autoFocus}
            value={value}
            placeholder={placeholder}
            onChange={e => {
              setValue(e.target.value);
              grow(e.target);
            }}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            className="flex-1 resize-none bg-transparent border-0 outline-none text-lg sm:text-xl leading-relaxed py-1.5 min-h-[3.5rem] sm:min-h-[4.5rem]"
            style={{ color: 'var(--text-1)' }}
          />
        </div>

        <div className="mt-4 sm:mt-5 flex items-center gap-2">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar -mx-1 px-1">
            <IconButton label="Attach">
              <Paperclip size={19} />
            </IconButton>
            {modes.map(m => {
              const on = active.includes(m.id);
              const Icon = m.icon;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => toggleMode(m.id)}
                  className="inline-flex items-center gap-1.5 h-9 px-3 rounded-full text-sm font-medium whitespace-nowrap transition-colors"
                  style={{
                    backgroundColor: on ? 'rgba(255,101,0,0.12)' : 'transparent',
                    border: `1px solid ${on ? 'rgba(255,101,0,0.4)' : 'var(--border-md)'}`,
                    color: on ? '#FF6500' : 'var(--text-2)',
                  }}
                >
                  <Icon size={15} />
                  {m.label}
                </button>
              );
            })}
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={submit}
              disabled={!value.trim()}
              aria-label="Send"
              className="inline-flex items-center justify-center h-11 w-11 rounded-full text-white transition-opacity disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg, #FF6500, #FF9A3C)' }}
            >
              <ArrowUp size={20} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>
      </div>

      {footer && (
        <div className="mt-3 text-center text-xs" style={{ color: 'var(--text-3)' }}>
          {footer}
        </div>
      )}

      <style>{`
        .no-scrollbar::-webkit-scrollbar{display:none}
        .no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}
        @property --beam-angle { syntax: '<angle>'; initial-value: 0deg; inherits: false; }
        @keyframes ai-beam-spin { to { --beam-angle: 360deg; } }
        .ai-beam-wrap {
          background: conic-gradient(
            from var(--beam-angle),
            transparent 0%,
            transparent 72%,
            rgba(255,101,0,0.04) 78%,
            rgba(255,101,0,0.25) 86%,
            rgba(255,101,0,0.75) 93%,
            #FF6500 98%,
            transparent 100%
          );
          animation: ai-beam-spin 10s linear infinite;
        }
      `}</style>
    </div>
  );
}

function IconButton({ label, children }: { label: string; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      className="inline-flex items-center justify-center h-11 w-11 shrink-0 rounded-full transition-colors hover:[background-color:var(--bg-hover)]"
      style={{ color: 'var(--text-2)' }}
    >
      {children}
    </button>
  );
}
