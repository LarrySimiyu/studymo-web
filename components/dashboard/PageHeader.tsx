import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

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

export function PageHeader({ title, subtitle, action, actionSlot }: PageHeaderProps) {
  const actionButton = action ? (
    action.href ? (
      <Button variant="brand" size="sm" asChild>
        <Link href={action.href}>
          <Plus size={14} />
          {action.label}
        </Link>
      </Button>
    ) : (
      <Button variant="brand" size="sm" onClick={action.onClick}>
        <Plus size={14} />
        {action.label}
      </Button>
    )
  ) : null;

  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div>
        <h1 className="text-heading-sm md:text-heading font-bold text-[var(--text-1)]">{title}</h1>
        {subtitle && (
          <p className="text-body-sm mt-0.5 text-[var(--text-2)]">{subtitle}</p>
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
