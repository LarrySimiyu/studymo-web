import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-full font-medium transition-all duration-150 ease-out active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        // The single primary action in a view.
        primary: 'bg-[var(--brand)] text-white hover:bg-[var(--brand-hover)]',
        // Neutral filled — secondary actions, toolbar buttons.
        secondary: 'bg-[var(--bg-input)] text-[var(--text-1)] hover:bg-[var(--bg-hover)]',
        // Bordered neutral — pairs with primary in modal footers.
        outline: 'border border-[var(--border-md)] text-[var(--text-1)] hover:bg-[var(--bg-hover)]',
        // Transparent until hovered — icon buttons, menu rows, dismissals.
        ghost: 'text-[var(--text-2)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-1)]',
        // Inline text action. Pair with size="link".
        link: 'text-[var(--text-2)] underline-offset-4 hover:text-[var(--text-1)]',
        // Soft semantic fills. The -ink text tokens are darkened in light mode
        // so the label clears AA on the tint; the raw accents do not.
        danger: 'bg-[var(--danger-subtle)] text-[var(--danger-ink)] hover:bg-[var(--danger-subtle-hover)]',
        success: 'bg-[var(--success-subtle)] text-[var(--success-ink)] hover:bg-[var(--success-subtle-hover)]',
        warning: 'bg-[var(--warning-subtle)] text-[var(--warning-ink)] hover:bg-[var(--warning-subtle-hover)]',
        brandSoft: 'bg-[var(--brand-subtle)] text-[var(--brand-ink)] hover:bg-[var(--brand-subtle-hover)]',
        // Brand gradient — reserved for upgrade/paywall CTAs. Nothing else.
        upgrade: 'bg-brand-gradient text-white hover:opacity-90',
        // Raised chip — sits on a card surface, so it fills with --bg-input to stay visible.
        pill: 'bg-[var(--bg-input)] text-[var(--text-2)] shadow-field hover:bg-[var(--bg-hover)] hover:text-[var(--text-1)]',
      },
      size: {
        xs: 'h-7 px-2.5 text-xs',
        sm: 'h-8 px-3 text-sm',
        default: 'h-9 px-3.5 text-sm',
        lg: 'h-11 px-4 text-sm font-semibold',
        icon: 'h-9 w-9',
        'icon-sm': 'h-7 w-7',
        'icon-xs': 'h-6 w-6',
        pill: 'h-7 gap-1 px-2.5 text-xs',
        link: 'h-auto p-0 text-sm active:scale-100',
      },
    },
    defaultVariants: {
      variant: 'secondary',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
