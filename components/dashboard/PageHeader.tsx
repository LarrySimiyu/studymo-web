import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface ActionProps {
  label: string;
  onClick?: () => void;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  subtitle?: React.ReactNode;
  // Simple built-in button with Plus icon — no need to import Button in the page
  action?: ActionProps;
  // Escape hatch for complex action areas (e.g. multiple elements, custom buttons)
  actionSlot?: React.ReactNode;
}

/**
 * The page's top bar. Renders as a sibling *above* PageShell, not inside it —
 * it spans the full pane like the tutor's bar rather than sitting indented in
 * the content column. Sticky, so it survives the page scroll.
 */

export function PageHeader({ title, subtitle, action, actionSlot }: PageHeaderProps) {
  const actionButton = action ? (
    action.href ? (
      <Button variant="primary" size="sm" asChild>
        <Link href={action.href}>
          <Plus size={14} />
          {action.label}
        </Link>
      </Button>
    ) : (
      <Button variant="primary" size="sm" onClick={action.onClick}>
        <Plus size={14} />
        {action.label}
      </Button>
    )
  ) : null;

  return (
    <div
      className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between gap-3 bg-[var(--bg-page)] px-4 sm:px-5"
      style={{ borderBottom: '1px solid var(--border)' }}
    >
      <div className="flex min-w-0 items-center gap-2.5">
        <h1 className="shrink-0 text-body-sm font-semibold text-[var(--text-1)]">{title}</h1>
        {subtitle && (
          <div className="hidden min-w-0 truncate text-xs text-[var(--text-3)] sm:block">{subtitle}</div>
        )}
      </div>
      {(actionButton || actionSlot) && (
        <div className="shrink-0 flex items-center gap-2">
          {actionSlot}
          {actionButton}
        </div>
      )}
    </div>
  );
}

/**
 * Heading for a block within a page. One treatment app-wide — pages were
 * previously using five different sizes for the same rank.
 */
export function SectionHeading({
  children, action, className,
}: { children: React.ReactNode; action?: React.ReactNode; className?: string }) {
  return (
    <div className={cn('mb-3 flex items-center justify-between gap-3', className)}>
      <h2 className="text-body-sm font-semibold text-[var(--text-1)]">{children}</h2>
      {action}
    </div>
  );
}
