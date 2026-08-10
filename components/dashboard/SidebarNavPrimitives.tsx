'use client';

import Link from 'next/link';
import { ChevronDown, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export type SectionKey = 'notes' | 'study' | 'tools' | 'chats';

// One active treatment for the whole sidebar: idle rows sit at --text-2 and the
// current row lifts to --text-1 on --bg-hover. The contrast comes from the
// dimming, not from tinting rows orange.
export const navRow = 'group flex items-center gap-1.5 rounded-lg px-2.5 py-2 transition-colors';
export const navIdle = 'text-[var(--text-2)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-1)]';
export const navActive = 'active bg-[var(--bg-hover)] text-[var(--text-1)]';

// Indented sub-item rows (folders, chat history) — same states, tighter box.
export const subItemRow = 'group flex items-center gap-2 rounded-md px-2 py-1 text-xs transition-colors';
export const subItemIdle = navIdle;
export const subItemActive = navActive;

export function CountBadge({ n }: { n: number | undefined }) {
  if (!n) return null;
  return (
    <span className="ml-auto min-w-[18px] shrink-0 text-center text-2xs font-medium leading-5 text-[var(--text-3)] transition-colors group-hover:text-[var(--text-1)] group-[.active]:text-[var(--text-1)]">
      {n}
    </span>
  );
}

export function SectionHeader({
  label, icon: Icon, open, onToggle,
}: { label: string; icon?: LucideIcon; open: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      aria-expanded={open}
      className="group flex w-full items-center gap-1.5 rounded-lg px-2.5 pb-1 pt-2 text-[var(--text-3)] transition-colors hover:text-[var(--text-1)]"
    >
      {Icon && <Icon size={14} className="shrink-0" />}
      <span className="flex-1 text-left text-xs font-semibold uppercase tracking-wide">
        {label}
      </span>
      <ChevronDown
        size={12}
        className="shrink-0 transition-transform duration-150"
        style={{ transform: open ? 'rotate(0deg)' : 'rotate(-90deg)' }}
      />
    </button>
  );
}

export function NavLink({ href, icon, label, count, isActive, small }: {
  href: string; icon: React.ReactNode; label: string; count?: number; isActive: boolean; small?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        navRow,
        small ? 'text-xs font-medium' : 'text-sm font-medium',
        isActive ? navActive : navIdle
      )}
    >
      <span className="flex shrink-0 items-center leading-none">{icon}</span>
      <span className="flex-1 truncate">{label}</span>
      <CountBadge n={count} />
    </Link>
  );
}

// Shared collapse animation for sidebar sections.
export const sectionMotion = {
  initial: { opacity: 0, height: 0 },
  animate: { opacity: 1, height: 'auto' as const },
  exit: { opacity: 0, height: 0 },
  transition: { duration: 0.2, ease: 'easeInOut' as const },
};
