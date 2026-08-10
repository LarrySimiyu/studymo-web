'use client';

import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { cva, type VariantProps } from 'class-variance-authority';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;
const DialogClose = DialogPrimitive.Close;

/* Radix puts the body scroll-lock on the Overlay, so it is always rendered —
   the fullscreen variant just makes it transparent behind opaque content. */
const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-50 bg-black/55',
      'data-[state=open]:animate-overlay-in data-[state=closed]:animate-overlay-out',
      className
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const dialogContentVariants = cva(
  cn(
    'pointer-events-auto relative outline-none',
    'data-[state=open]:animate-dialog-in data-[state=closed]:animate-dialog-out'
  ),
  {
    variants: {
      variant: {
        default: cn(
          'w-full max-h-[90vh] overflow-y-auto rounded-2xl p-5 sm:p-6',
          'border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-1)]',
          'shadow-[var(--shadow-pop)]'
        ),
        fullscreen: 'w-full h-full overflow-y-auto bg-[var(--bg-page)] text-[var(--text-1)]',
      },
      size: {
        sm: 'max-w-sm',
        default: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-2xl',
      },
    },
    compoundVariants: [
      { variant: 'fullscreen', class: 'max-w-none rounded-none border-0 p-0 shadow-none' },
    ],
    defaultVariants: { variant: 'default', size: 'default' },
  }
);

interface DialogContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>,
    VariantProps<typeof dialogContentVariants> {
  /** Renders the corner X. Off by default — the house pattern is a text
   *  cancel link under the primary action. */
  showClose?: boolean;
}

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  DialogContentProps
>(({ className, children, variant, size, showClose = false, ...props }, ref) => {
  const fullscreen = variant === 'fullscreen';
  return (
    <DialogPortal>
      <DialogOverlay className={cn(fullscreen && 'bg-transparent')} />
      <div
        className={cn(
          'pointer-events-none fixed inset-0 z-50 flex',
          !fullscreen && 'items-center justify-center p-4'
        )}
      >
        <DialogPrimitive.Content
          ref={ref}
          className={cn(dialogContentVariants({ variant, size }), className)}
          {...props}
        >
          {children}
          {showClose && (
            <DialogPrimitive.Close
              className={cn(
                'absolute right-4 top-4 rounded-lg p-1 transition-colors',
                'text-[var(--text-3)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-1)]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-border)]',
                'disabled:pointer-events-none'
              )}
            >
              <X size={18} />
              <span className="sr-only">Close</span>
            </DialogPrimitive.Close>
          )}
        </DialogPrimitive.Content>
      </div>
    </DialogPortal>
  );
});
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('mb-4 flex flex-col gap-1.5', className)} {...props} />
);
DialogHeader.displayName = 'DialogHeader';

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', className)} {...props} />
);
DialogFooter.displayName = 'DialogFooter';

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn('text-body font-semibold text-[var(--text-1)]', className)}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn('text-body-sm text-[var(--text-2)]', className)}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogTrigger,
  DialogPortal,
  DialogClose,
  DialogOverlay,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
