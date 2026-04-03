import * as React from 'react';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

// ── Base styles shared by all variants ──────────────────────────────────────
const base =
  'w-full bg-transparent outline-none text-sm text-[var(--text-1)] placeholder:text-[var(--text-3)] disabled:opacity-50 transition-colors';

const shell =
  'rounded-xl border transition-colors';

const sharedShell = {
  backgroundColor: 'var(--bg-card)',
  borderColor: 'var(--border-md)',
} as React.CSSProperties;

// ── Input ────────────────────────────────────────────────────────────────────

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'search';
  leftIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant = 'default', leftIcon, ...props }, ref) => {
    const hasLeft = variant === 'search' || leftIcon;

    return (
      <div className={cn('relative flex items-center', shell)} style={sharedShell}>
        {hasLeft && (
          <span className="pl-3 shrink-0 flex items-center" style={{ color: 'var(--text-3)' }}>
            {leftIcon ?? <Search size={14} />}
          </span>
        )}
        <input
          ref={ref}
          className={cn(base, hasLeft ? 'pl-2 pr-3 py-2' : 'px-3 py-2', className)}
          {...props}
        />
      </div>
    );
  }
);
Input.displayName = 'Input';

// ── Textarea ─────────────────────────────────────────────────────────────────

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  autoResize?: boolean;
  maxHeight?: number;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, autoResize, maxHeight = 200, onInput, ...props }, ref) => {
    function handleInput(e: React.FormEvent<HTMLTextAreaElement>) {
      if (autoResize) {
        const el = e.currentTarget;
        el.style.height = 'auto';
        el.style.height = Math.min(el.scrollHeight, maxHeight) + 'px';
      }
      onInput?.(e);
    }

    return (
      <div className={cn(shell)} style={sharedShell}>
        <textarea
          ref={ref}
          onInput={handleInput}
          className={cn(base, 'px-4 py-3 resize-none leading-relaxed', className)}
          {...props}
        />
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';
