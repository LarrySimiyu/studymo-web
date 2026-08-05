'use client';

import Link from 'next/link';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export type SectionKey = 'notes' | 'study' | 'tools' | 'chats';

export function CountBadge({ n }: { n: number | undefined }) {
  if (!n) return null;
  return (
    <span className="ml-auto shrink-0 text-[10px] font-medium leading-5 min-w-[18px] text-center text-[var(--text-3)] group-hover:text-[var(--text-1)] group-[.active]:text-[var(--text-1)]">
      {n}
    </span>
  );
}

export function SectionHeader({
  label, icon: Icon, open, onToggle,
}: { label: string; icon?: LucideIcon; open: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle} className="group w-full flex items-center gap-1.5 px-2.5 pt-2 pb-1">
      {Icon && <Icon size={14} className="text-[var(--text-1)] transition-colors" />}
      <span className="flex-1 text-left text-sm font-semibold text-[var(--text-1)] transition-colors">
        {label}
      </span>
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none"
        className="text-[var(--text-1)] transition-colors"
        style={{ transform: open ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.15s' }}>
        <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
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
        'group flex items-center gap-1.5 px-2.5 py-2 rounded-lg font-medium transition-colors',
        small ? 'text-xs' : 'text-sm',
        isActive
          ? 'active text-[var(--text-1)] bg-[var(--bg-hover)]'
          : 'text-[var(--text-1)] hover:bg-[var(--bg-hover)]'
      )}
    >
      <span className="leading-none shrink-0 flex items-center">{icon}</span>
      <span className="truncate flex-1">{label}</span>
      <CountBadge n={count} />
    </Link>
  );
}

// Shared class strings for the indented sub-item rows (folders, chat history).
export const subItemRow = 'flex items-center gap-2 px-2 py-1 rounded-md text-xs transition-colors';
export const subItemIdle = 'text-[var(--text-2)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-1)]';
export const subItemActive = 'text-[var(--text-1)] bg-[var(--bg-hover)]';

// Shared collapse animation for sidebar sections.
export const sectionMotion = {
  initial: { opacity: 0, height: 0 },
  animate: { opacity: 1, height: 'auto' as const },
  exit: { opacity: 0, height: 0 },
  transition: { duration: 0.2, ease: 'easeInOut' as const },
};
