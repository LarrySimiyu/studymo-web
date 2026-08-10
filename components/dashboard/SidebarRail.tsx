'use client';

import Image from 'next/image';
import Link from 'next/link';
import { House, CirclePlus, Folder as FolderIcon, Library, Wrench, PanelLeft, Zap, LucideIcon } from 'lucide-react';
import studymoLogo from '@/assets/studymo_logo.png';
import { useNewChat } from '@/hooks/useNewChat';
import { cn } from '@/lib/utils';
import { showPaywall } from '@/lib/paywall';
import { Button } from '@/components/ui/Button';
import type { SectionKey } from './SidebarNavPrimitives';

interface RailItem {
  label: string;
  icon: LucideIcon;
  href?: string;
  section?: SectionKey;
  paths: string[];
  exact?: boolean;
}

const ITEMS: RailItem[] = [
  { label: 'Home', icon: House, href: '/dashboard/home', paths: ['/dashboard/home'], exact: true },
  { label: 'Notes', icon: FolderIcon, href: '/dashboard/library', paths: ['/dashboard/library'] },
  {
    label: 'Study Materials',
    icon: Library,
    section: 'study',
    paths: ['/dashboard/flashcards', '/dashboard/quizzes', '/dashboard/practice-exams', '/dashboard/podcasts'],
  },
  {
    label: 'Tools',
    icon: Wrench,
    section: 'tools',
    paths: ['/dashboard/study-plan', '/dashboard/tasks', '/dashboard/weak-topics'],
  },
];

function RailButton({ icon: Icon, label, active, href, onClick }: {
  icon: LucideIcon; label: string; active?: boolean; href?: string; onClick?: () => void;
}) {
  // Same active rule as the expanded sidebar — lift to --text-1 on --bg-hover.
  // The brand accent bar is the only orange, since the rail has no labels.
  const className = cn(
    'relative flex items-center justify-center w-10 h-10 rounded-xl transition-colors',
    active
      ? 'bg-[var(--bg-hover)] text-[var(--text-1)]'
      : 'text-[var(--text-2)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-1)]'
  );

  const body = (
    <>
      {active && (
        <span className="absolute -left-3 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-full bg-[var(--brand)]" />
      )}
      <Icon size={18} strokeWidth={1.75} />
    </>
  );

  return href
    ? <Link href={href} title={label} aria-label={label} className={className}>{body}</Link>
    : <button onClick={onClick} title={label} aria-label={label} className={className}>{body}</button>;
}

interface Props {
  pathname: string;
  initials: string;
  hasAccess: boolean;
  onExpand: (section?: SectionKey) => void;
}

export default function SidebarRail({ pathname, initials, hasAccess, onExpand }: Props) {
  const { startNewChat, creating } = useNewChat();

  function isActive(item: RailItem) {
    return item.exact
      ? item.paths.includes(pathname)
      : item.paths.some(p => pathname.startsWith(p));
  }

  return (
    <aside
      className="shrink-0 w-16 flex flex-col items-center gap-1 py-3 h-screen"
      style={{ backgroundColor: 'var(--bg-card)', borderRight: '1px solid var(--border)' }}
    >
      <button
        onClick={() => onExpand()}
        title="Expand sidebar"
        aria-label="Expand sidebar"
        className="group relative flex items-center justify-center w-12 h-12 mb-2 rounded-xl transition-colors hover:bg-[var(--bg-hover)]"
      >
        <Image src={studymoLogo} alt="StudyMo" className="w-11 h-11 object-contain transition-opacity group-hover:opacity-0" />
        <PanelLeft size={18} strokeWidth={1.75} className="absolute opacity-0 transition-opacity group-hover:opacity-100 text-[var(--text-2)]" />
      </button>

      <Button
        variant="primary"
        onClick={startNewChat}
        disabled={creating}
        title="New Chat"
        aria-label="New Chat"
        className="h-10 w-10 rounded-xl p-0"
      >
        {creating
          ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          : <CirclePlus size={18} strokeWidth={2} />}
      </Button>

      {ITEMS.map(item => (
        <RailButton
          key={item.label}
          icon={item.icon}
          label={item.label}
          active={isActive(item)}
          href={item.href}
          onClick={item.section ? () => onExpand(item.section) : undefined}
        />
      ))}

      <div className="flex-1" />

      {!hasAccess && (
        <Button
          variant="upgrade"
          onClick={() => showPaywall('sidebar_rail')}
          title="Get Unlimited"
          aria-label="Get Unlimited"
          className="h-10 w-10 rounded-xl p-0"
        >
          <Zap size={16} />
        </Button>
      )}

      <Link
        href="/dashboard/settings"
        title="Settings"
        aria-label="Settings"
        className="flex items-center justify-center w-10 h-10 rounded-xl transition-colors hover:bg-[var(--bg-hover)]"
      >
        <span className="w-7 h-7 rounded-full flex items-center justify-center bg-[var(--brand)] text-white text-2xs font-semibold">
          {initials}
        </span>
      </Link>
    </aside>
  );
}
