'use client';

import { MoreHorizontal, LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdownMenu';
import { cn } from '@/lib/utils';

export interface RowAction {
  label: string;
  icon: LucideIcon;
  onSelect?: () => void;
  /** Renders as a download link instead of a button. */
  href?: string;
  download?: string;
  danger?: boolean;
}

interface Props {
  actions: RowAction[];
  label?: string;
  align?: 'start' | 'end';
  className?: string;
}

/**
 * The three-dot row menu. Replaces the hand-rolled hover-timer popovers that
 * podcasts, practice exams and the note header each had their own copy of —
 * those had no focus trap, no Escape, and no keyboard access.
 */
export default function RowActionsMenu({ actions, label = 'More actions', align = 'end', className }: Props) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label={label} className={cn('text-[var(--text-3)]', className)}>
          <MoreHorizontal size={15} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align}>
        {actions.map(({ label: itemLabel, icon: Icon, onSelect, href, download, danger }) => (
          <DropdownMenuItem
            key={itemLabel}
            onSelect={onSelect}
            asChild={!!href}
            className={danger ? 'text-[var(--danger-ink)]' : undefined}
          >
            {href ? (
              <a href={href} download={download}>
                <Icon size={12} className="shrink-0" />
                {itemLabel}
              </a>
            ) : (
              <>
                <Icon size={12} className="shrink-0" />
                {itemLabel}
              </>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
