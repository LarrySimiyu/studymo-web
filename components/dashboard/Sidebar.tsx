'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { label: 'Home', href: '/dashboard', icon: '⌂' },
  { label: 'Library', href: '/dashboard/library', icon: '📚' },
  { label: 'Notes', href: '/dashboard/notes', icon: '📝' },
  { label: 'Flashcards', href: '/dashboard/flashcards', icon: '🗂' },
  { label: 'Quizzes', href: '/dashboard/quizzes', icon: '❓' },
  { label: 'Weak Topics', href: '/dashboard/weak-topics', icon: '⚠' },
  { label: 'Practice Exams', href: '/dashboard/practice-exams', icon: '📋' },
  { label: 'Tasks', href: '/dashboard/tasks', icon: '✓' },
  { label: 'Study Plan', href: '/dashboard/study-plan', icon: '📅' },
  { label: 'Groups', href: '/dashboard/groups', icon: '👥' },
  { label: 'AI Tutor', href: '/dashboard/tutor', icon: '🎓' },
  { label: 'Podcasts', href: '/dashboard/podcasts', icon: '🎙️' },
  { label: 'Analytics', href: '/dashboard/analytics', icon: '📊' },
  { label: 'Settings', href: '/dashboard/settings', icon: '⚙' },
  { label: 'Billing', href: '/dashboard/settings/billing', icon: '💳' },
];

export default function Sidebar() {
  const { signOut, currentUser, dbUser } = useAuth();
  const pathname = usePathname();

  const displayName = dbUser?.name ?? currentUser?.displayName ?? currentUser?.email?.split('@')[0] ?? 'User';
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <aside className="w-60 shrink-0 flex flex-col" style={{ backgroundColor: '#1A1A1A', borderRight: '1px solid #2A2A2A' }}>
      {/* Logo */}
      <div className="p-5" style={{ borderBottom: '1px solid #2A2A2A' }}>
        <span className="text-lg font-bold text-white tracking-tight">Studymo</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = item.href === '/dashboard'
            ? pathname === '/dashboard'
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              )}
              style={isActive ? { backgroundColor: '#9747FF20', color: '#9747FF' } : {}}
            >
              <span className="text-base leading-none">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="p-3" style={{ borderTop: '1px solid #2A2A2A' }}>
        <div className="flex items-center gap-3 px-2 py-2 mb-1">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0"
            style={{ backgroundColor: '#9747FF' }}
          >
            {initials}
          </div>
          <p className="text-xs text-gray-400 truncate flex-1">{currentUser?.email}</p>
        </div>
        <button
          onClick={() => signOut()}
          className="w-full text-left text-xs text-gray-500 hover:text-gray-300 transition-colors px-2 py-1.5 rounded-lg hover:bg-white/5"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
