'use client';

import Image from 'next/image';
import Link from 'next/link';
import { House, Plus, Folder as FolderIcon, Library, Wrench, PanelLeft, Zap, Sun, Moon, LucideIcon } from 'lucide-react';
import studymoLogo from '@/assets/studymo_logo.png';
import { useTheme } from '@/components/ui/ThemeProvider';
import { useNewChat } from '@/hooks/useNewChat';
import { cn } from '@/lib/utils';
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
  const className = cn(
    'relative flex items-center justify-center w-10 h-10 rounded-xl transition-colors',
    active
      ? 'bg-[var(--bg-hover)] text-[var(--brand)]'
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
  const { theme, toggle } = useTheme();
  const { startNewChat, creating } = useNewChat();

  function isActive(item: RailItem) {
    return item.exact
      ? item.paths.includes(pathname)
      : item.paths.some(p => pathname.startsWith(p));
  }

  return (
    <aside
      className="shrink-0 w-16 flex flex-col items-center gap-1 py-3 my-3 ml-3 rounded-2xl"
      style={{ backgroundColor: 'var(--bg-card)' }}
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

      <button
        onClick={startNewChat}
        disabled={creating}
        title="New Chat"
        aria-label="New Chat"
        className="flex items-center justify-center w-10 h-10 rounded-xl text-white transition-all duration-200 hover:brightness-110 disabled:opacity-60"
        style={{ background: 'linear-gradient(135deg, #FF6500, #FF9A3C)' }}
      >
        {creating
          ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          : <Plus size={18} strokeWidth={2.5} />}
      </button>

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

      <RailButton
        icon={theme === 'dark' ? Sun : Moon}
        label={theme === 'dark' ? 'Light mode' : 'Dark mode'}
        onClick={toggle}
      />

      {!hasAccess && (
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('app:show-paywall'))}
          title="Get Unlimited"
          aria-label="Get Unlimited"
          className="flex items-center justify-center w-10 h-10 rounded-xl transition-opacity hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #FF6500, #FF9A3C)' }}
        >
          <Zap size={16} className="text-white" />
        </button>
      )}

      <Link
        href="/dashboard/settings"
        title="Settings"
        aria-label="Settings"
        className="flex items-center justify-center w-10 h-10 rounded-xl transition-colors hover:bg-[var(--bg-hover)]"
      >
        <span
          className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-semibold"
          style={{ backgroundColor: 'var(--brand)' }}
        >
          {initials}
        </span>
      </Link>
    </aside>
  );
}
