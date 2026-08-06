import * as React from 'react';
import { Search } from 'lucide-react';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const fieldVariants = cva(
  [
    'w-full min-w-0 rounded-md bg-[var(--bg-card)]',
    'text-[var(--text-1)] placeholder:text-[var(--text-3)]',
    'outline-none transition-colors',
    'disabled:cursor-not-allowed disabled:opacity-50',
  ],
  {
    variants: {
      field: {
        // text-base on mobile stops iOS from zooming on focus; h-11 keeps the 44px touch target
        input: 'flex h-11 py-1 text-base sm:h-9 sm:text-sm',
        textarea: 'block min-h-[4rem] resize-none py-2 text-base leading-relaxed sm:text-sm',
      },
      inset: {
        none: 'px-3',
        left: 'pl-8 pr-3',
      },
      tone: {
        bordered: 'border border-[var(--border-md)] shadow-sm',
        flat: 'border-0 shadow-field',
      },
    },
    defaultVariants: { field: 'input', inset: 'none', tone: 'bordered' },
  }
);

// ── Input ────────────────────────────────────────────────────────────────────

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'search';
  leftIcon?: React.ReactNode;
  /** Layout classes land on the wrapper; use this to restyle the field itself. */
  inputClassName?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, inputClassName, variant = 'default', leftIcon, ...props }, ref) => {
    const hasLeft = variant === 'search' || Boolean(leftIcon);

    return (
      <div className={cn('relative', className)}>
        {hasLeft && (
          <span
            className="pointer-events-none absolute left-2.5 top-1/2 flex -translate-y-1/2 items-center text-[var(--text-3)]"
            aria-hidden
          >
            {leftIcon ?? <Search size={14} />}
          </span>
        )}
        <input
          ref={ref}
          className={cn(
            fieldVariants({
              field: 'input',
              inset: hasLeft ? 'left' : 'none',
              tone: variant === 'search' ? 'flat' : 'bordered',
            }),
            inputClassName
          )}
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
      <textarea
        ref={ref}
        onInput={handleInput}
        className={cn(fieldVariants({ field: 'textarea' }), className)}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export { fieldVariants };
