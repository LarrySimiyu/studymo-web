import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { tagStyle } from '@/lib/tagColors';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border font-semibold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-border)]',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
        secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive: 'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
        outline: 'text-foreground',
        // Tag pill — colour is per-tag, supplied inline by TagBadge
        tag: 'border-0 font-medium',
        // Toggleable pill — on/off driven by data-state, applied by TogglePill
        pill: [
          'border-0 shadow-field bg-[var(--bg-card)] text-[var(--text-2)]',
          'hover:bg-[var(--bg-hover)] hover:text-[var(--text-1)]',
          'data-[state=on]:bg-[var(--brand)] data-[state=on]:text-white',
          'data-[state=on]:hover:bg-[var(--brand-hover)] data-[state=on]:hover:text-white',
        ],
      },
      size: {
        default: 'px-2.5 py-0.5 text-xs',
        sm: 'gap-1 px-1.5 py-0.5 text-[10px] leading-4',
        pill: 'h-7 gap-1 px-2.5 text-xs font-medium',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  asChild?: boolean;
}

function Badge({ className, variant, size, asChild, ...props }: BadgeProps) {
  const Comp = asChild ? Slot : 'span';
  return <Comp className={cn(badgeVariants({ variant, size }), className)} {...props} />;
}

export interface TagBadgeProps extends Omit<BadgeProps, 'variant' | 'color'> {
  color?: string | null;
  /** Omit for a read-only tag. Supplied, an × reveals on hover. */
  onRemove?: () => void;
  removeLabel?: string;
}

function TagBadge({ color, className, onRemove, removeLabel, children, ...props }: TagBadgeProps) {
  return (
    <Badge variant="tag" className={cn(onRemove && 'group/tag', className)} style={tagStyle(color)} {...props}>
      {children}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={removeLabel ?? 'Remove tag'}
          className={cn(
            'w-0 cursor-pointer overflow-hidden leading-none opacity-0 outline-none transition-all duration-150',
            'group-hover/tag:ml-1 group-hover/tag:w-3 group-hover/tag:opacity-60 hover:!opacity-100',
            'focus-visible:ml-1 focus-visible:w-3 focus-visible:opacity-100'
          )}
        >
          ×
        </button>
      )}
    </Badge>
  );
}

export interface TogglePillProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'color'> {
  pressed?: boolean;
}

function TogglePill({ pressed, className, type = 'button', ...props }: TogglePillProps) {
  return (
    <Badge asChild variant="pill" size="pill">
      <button type={type} data-state={pressed ? 'on' : 'off'} aria-pressed={pressed} className={className} {...props} />
    </Badge>
  );
}

export { Badge, TagBadge, TogglePill, badgeVariants };
