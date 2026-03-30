'use client';

import Link from 'next/link';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { foldersApi, Folder } from '@/lib/api/organization';

const NAV_ITEMS = [
  { label: 'Home', href: '/dashboard', icon: '⌂' },
  { label: 'Library', href: '/dashboard/library', icon: '📚' },
  { label: 'Flashcards', href: '/dashboard/flashcards', icon: '🗂' },
  { label: 'Quizzes', href: '/dashboard/quizzes', icon: '❓' },
  { label: 'Weak Topics', href: '/dashboard/weak-topics', icon: '⚠' },
  { label: 'Practice Exams', href: '/dashboard/practice-exams', icon: '📋' },
  { label: 'Tasks', href: '/dashboard/tasks', icon: '✓' },
  { label: 'Study Plan', href: '/dashboard/study-plan', icon: '📅' },
  { label: 'AI Tutor', href: '/dashboard/tutor', icon: '🎓' },
  { label: 'Podcasts', href: '/dashboard/podcasts', icon: '🎙️' },
  { label: 'Analytics', href: '/dashboard/analytics', icon: '📊' },
  { label: 'Settings', href: '/dashboard/settings', icon: '⚙' },
];

function flattenFolders(folders: Folder[], depth = 0): (Folder & { depth: number })[] {
  const result: (Folder & { depth: number })[] = [];
  for (const f of folders) {
    result.push({ ...f, depth });
    if (f.children?.length) result.push(...flattenFolders(f.children, depth + 1));
  }
  return result;
}

export default function Sidebar() {
  const { signOut, currentUser, dbUser } = useAuth();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [folders, setFolders] = useState<Folder[]>([]);

  const isLibraryActive = pathname.startsWith('/dashboard/library');
  const selectedFolder = searchParams.get('folder') ?? 'all';

  useEffect(() => {
    if (!isLibraryActive) return;
    foldersApi.getAll().then(({ data }) => { if (data) setFolders(data); });
  }, [isLibraryActive]);

  // Refresh folders when library signals a change (e.g. after create/delete)
  useEffect(() => {
    if (!isLibraryActive) return;
    const handler = () => foldersApi.getAll().then(({ data }) => { if (data) setFolders(data); });
    window.addEventListener('library:folders-changed', handler);
    return () => window.removeEventListener('library:folders-changed', handler);
  }, [isLibraryActive]);

  const displayName = dbUser?.name ?? currentUser?.displayName ?? currentUser?.email?.split('@')[0] ?? 'User';
  const initials = displayName.slice(0, 2).toUpperCase();

  const flat = flattenFolders(folders);

  function folderHref(value: string) {
    return value === 'all' ? '/dashboard/library' : `/dashboard/library?folder=${value}`;
  }

  function isFolderActive(value: string) {
    if (!isLibraryActive) return false;
    // Only match exact library path (not /dashboard/library/[id]) for folder selection
    const onListPage = pathname === '/dashboard/library';
    if (!onListPage) return false;
    return selectedFolder === value;
  }

  return (
    <aside className="w-60 shrink-0 flex flex-col" style={{ backgroundColor: '#1A1A1A', borderRight: '1px solid #2A2A2A' }}>
      {/* Logo */}
      <div className="p-5" style={{ borderBottom: '1px solid #2A2A2A' }}>
        <span className="text-lg font-bold text-white tracking-tight">Studymo</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = item.href === '/dashboard'
            ? pathname === '/dashboard'
            : pathname.startsWith(item.href);

          return (
            <div key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive ? 'text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
                )}
                style={isActive ? { backgroundColor: '#9747FF20', color: '#9747FF' } : {}}
              >
                <span className="text-base leading-none">{item.icon}</span>
                {item.label}
              </Link>

              {/* Library folder expansion */}
              {item.href === '/dashboard/library' && isLibraryActive && (
                <div className="ml-3 mt-0.5 mb-1 space-y-0.5">
                  {/* All Documents */}
                  <Link
                    href={folderHref('all')}
                    className={cn(
                      'flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-colors',
                      isFolderActive('all') ? 'text-white' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                    )}
                    style={isFolderActive('all') ? { backgroundColor: '#9747FF15', color: '#9747FF' } : {}}
                  >
                    <span>📚</span> All Documents
                  </Link>

                  {/* Unfiled */}
                  <Link
                    href={folderHref('none')}
                    className={cn(
                      'flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-colors',
                      isFolderActive('none') ? 'text-white' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                    )}
                    style={isFolderActive('none') ? { backgroundColor: '#9747FF15', color: '#9747FF' } : {}}
                  >
                    <span>📭</span> Unfiled
                  </Link>

                  {/* User folders */}
                  {flat.map((f) => (
                    <Link
                      key={f.id}
                      href={folderHref(f.id)}
                      className={cn(
                        'flex items-center gap-2 py-1.5 rounded-lg text-xs transition-colors',
                        isFolderActive(f.id) ? 'text-white' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                      )}
                      style={{
                        paddingLeft: `${12 + f.depth * 12}px`,
                        paddingRight: '12px',
                        ...(isFolderActive(f.id) ? { backgroundColor: '#9747FF15', color: '#9747FF' } : {}),
                      }}
                    >
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: f.color ?? '#9747FF' }} />
                      <span className="truncate">{f.name}</span>
                    </Link>
                  ))}

                  {/* New folder */}
                  <button
                    onClick={() => window.dispatchEvent(new CustomEvent('library:new-folder'))}
                    className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-gray-600 hover:text-gray-400 hover:bg-white/5 transition-colors"
                  >
                    + New Folder
                  </button>
                </div>
              )}
            </div>
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
