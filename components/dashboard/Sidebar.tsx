'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { foldersApi, Folder, practiceExamsApi } from '@/lib/api/organization';
import { documentsApi } from '@/lib/api/documents';
import { podcastsApi } from '@/lib/api/podcasts';

interface Counts {
  notes: number;
  flashcardDecks: number;
  quizDecks: number;
  exams: number;
  podcasts: number;
}

function flattenFolders(folders: Folder[], depth = 0): (Folder & { depth: number })[] {
  const result: (Folder & { depth: number })[] = [];
  for (const f of folders) {
    result.push({ ...f, depth });
    if (f.children?.length) result.push(...flattenFolders(f.children, depth + 1));
  }
  return result;
}

function CountBadge({ n }: { n: number | undefined }) {
  if (!n) return null;
  return (
    <span
      className="ml-auto shrink-0 text-[10px] font-medium leading-5 min-w-[18px] text-center"
      style={{ color: 'var(--text-3)' }}
    >
      {n}
    </span>
  );
}

function Divider() {
  return <div className="mx-2 my-1.5" style={{ height: 1, backgroundColor: 'var(--border)' }} />;
}

function SectionHeader({
  label, collapsed, open, onToggle,
}: { label: string; collapsed: boolean; open: boolean; onToggle: () => void }) {
  if (collapsed) return <Divider />;
  return (
    <button onClick={onToggle} className="w-full flex items-center gap-1 px-2.5 pt-3 pb-1">
      <span className="flex-1 text-left text-xs font-semibold" style={{ color: 'var(--text-1)' }}>
        {label}
      </span>
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none"
        style={{ color: 'var(--text-1)', transform: open ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.15s' }}>
        <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

function NavLink({ href, icon, label, count, isActive, collapsed }: {
  href: string; icon: string; label: string; count?: number; isActive: boolean; collapsed: boolean;
}) {
  return (
    <Link
      href={href}
      title={collapsed ? label : undefined}
      className={cn(
        'flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors',
        collapsed ? 'justify-center' : '',
        isActive
          ? 'text-[var(--text-1)] bg-[var(--bg-hover)]'
          : 'text-[var(--text-1)] hover:bg-[var(--bg-hover)]'
      )}
    >
      <span className="text-sm leading-none shrink-0">{icon}</span>
      {!collapsed && (
        <>
          <span className="truncate flex-1">{label}</span>
          <CountBadge n={count} />
        </>
      )}
    </Link>
  );
}

export default function Sidebar() {
  const { currentUser, dbUser } = useAuth();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [folders, setFolders] = useState<Folder[]>([]);
  const [counts, setCounts] = useState<Partial<Counts>>({});
  const [unfiledCount, setUnfiledCount] = useState(0);
  const [sectionOpen, setSectionOpen] = useState({ notes: true, study: true, tools: true });
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('sidebar-collapsed') === 'true';
    return false;
  });

  const isLibraryActive = pathname.startsWith('/dashboard/library');
  const selectedFolder = searchParams.get('folder') ?? 'all';

  function toggleCollapsed() {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem('sidebar-collapsed', String(next));
  }

  function toggleSection(key: keyof typeof sectionOpen) {
    setSectionOpen(s => ({ ...s, [key]: !s[key] }));
  }

  function isActive(href: string, exact = false) {
    return exact ? pathname === href : pathname.startsWith(href);
  }

  function isFolderActive(value: string) {
    if (!isLibraryActive || pathname !== '/dashboard/library') return false;
    return selectedFolder === value;
  }

  function folderHref(value: string) {
    return value === 'all' ? '/dashboard/library' : `/dashboard/library?folder=${value}`;
  }

  useEffect(() => {
    async function load() {
      const [foldersRes, docsRes, podcastsRes, examsRes] = await Promise.all([
        foldersApi.getAll(),
        documentsApi.getAll(),
        podcastsApi.getAll(),
        practiceExamsApi.getAll(),
      ]);
      if (foldersRes.data) setFolders(foldersRes.data);
      const docs = docsRes.data ?? [];
      const completeDocs = docs.filter(d => d.status === 'complete');
      setUnfiledCount(completeDocs.filter(d => !d.folderId).length);
      setCounts({
        notes: docs.length,
        flashcardDecks: completeDocs.length,
        quizDecks: completeDocs.length,
        exams: examsRes.data?.length ?? 0,
        podcasts: podcastsRes.data?.length ?? 0,
      });
    }
    load();
  }, []);

  useEffect(() => {
    if (!isLibraryActive) return;
    foldersApi.getAll().then(({ data }) => { if (data) setFolders(data); });
  }, [isLibraryActive]);

  useEffect(() => {
    if (!isLibraryActive) return;
    const handler = () => foldersApi.getAll().then(({ data }) => { if (data) setFolders(data); });
    window.addEventListener('library:folders-changed', handler);
    return () => window.removeEventListener('library:folders-changed', handler);
  }, [isLibraryActive]);

  const displayName = dbUser?.name ?? currentUser?.displayName ?? currentUser?.email?.split('@')[0] ?? 'User';
  const initials = displayName.slice(0, 2).toUpperCase();
  const flat = flattenFolders(folders);

  return (
    <aside
      className="shrink-0 flex flex-col transition-all duration-200"
      style={{ width: collapsed ? 52 : 220, backgroundColor: 'var(--bg-card)' }}
    >
      {/* Logo + collapse + global upload */}
      <div
        className="flex items-center justify-between px-3 py-3.5 shrink-0"
      >
        {!collapsed && (
          <span className="text-sm font-bold tracking-tight" style={{ color: 'var(--text-1)' }}>Studymo</span>
        )}
        <button
          onClick={toggleCollapsed}
          className={cn('flex items-center justify-center w-6 h-6 rounded-md transition-colors hover:bg-[var(--bg-hover)]', collapsed && 'mx-auto')}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none"
            style={{ color: 'var(--text-3)', transform: collapsed ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        {/* Collapsed: show + button centered */}
        {collapsed && (
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('app:open-upload'))}
            title="New note"
            className="absolute left-0 right-0 mx-auto mt-10 hidden"
          />
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-1.5 py-2 overflow-y-auto overflow-x-hidden space-y-0.5">
        <NavLink href="/dashboard" icon="⌂" label="Home" isActive={isActive('/dashboard', true)} collapsed={collapsed} />
        <NavLink href="/dashboard/tutor" icon="🎓" label="AI Tutor" isActive={isActive('/dashboard/tutor')} collapsed={collapsed} />

        {/* ── NOTES ── */}
        <SectionHeader label="Notes" collapsed={collapsed} open={sectionOpen.notes} onToggle={() => toggleSection('notes')} />

        {sectionOpen.notes && (
          <>
            <NavLink
              href="/dashboard/library"
              icon="📝"
              label="Notes"
              count={counts.notes}
              isActive={isLibraryActive && selectedFolder === 'all'}
              collapsed={collapsed}
            />

            {!collapsed && isLibraryActive && (
              <div className="ml-3 mt-0.5 mb-1 space-y-0.5 border-l pl-2" style={{ borderColor: 'var(--border)' }}>
                <Link
                  href={folderHref('none')}
                  className={cn(
                    'flex items-center gap-2 px-2 py-1 rounded-md text-xs transition-colors',
                    isFolderActive('none')
                      ? 'text-[var(--text-1)] bg-[var(--bg-hover)]'
                      : 'text-[var(--text-1)] hover:bg-[var(--bg-hover)]'
                  )}
                >
                  <span className="shrink-0 text-xs">📭</span>
                  <span className="truncate flex-1">Unfiled</span>
                  <CountBadge n={unfiledCount} />
                </Link>

                {flat.map((f) => (
                  <Link
                    key={f.id}
                    href={folderHref(f.id)}
                    className={cn(
                      'flex items-center gap-2 py-1 rounded-md text-body-sm transition-colors',
                      isFolderActive(f.id)
                        ? 'text-[var(--brand)] bg-[var(--brand-subtle)]'
                        : 'text-[var(--text-1)] hover:bg-[var(--bg-hover)]'
                    )}
                    style={{ paddingLeft: `${8 + f.depth * 10}px`, paddingRight: '8px' }}
                  >
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: f.color ?? 'var(--brand)' }} />
                    <span className="truncate flex-1">{f.name}</span>
                    <CountBadge n={f._count?.documents} />
                  </Link>
                ))}

                <button
                  onClick={() => window.dispatchEvent(new CustomEvent('library:new-folder'))}
                  className="w-full flex items-center gap-2 px-2 py-1 rounded-md text-xs transition-colors text-[var(--text-1)] hover:bg-[var(--bg-hover)]"
                >
                  <span className="text-xs opacity-60">+</span>
                  <span>New Collection</span>
                </button>
              </div>
            )}
          </>
        )}

        {/* ── STUDY MATERIALS ── */}
        <SectionHeader label="Study Materials" collapsed={collapsed} open={sectionOpen.study} onToggle={() => toggleSection('study')} />

        {sectionOpen.study && (
          <>
            <NavLink href="/dashboard/flashcards" icon="🗂" label="Flashcards" count={counts.flashcardDecks} isActive={isActive('/dashboard/flashcards')} collapsed={collapsed} />
            <NavLink href="/dashboard/quizzes" icon="❓" label="Quizzes" count={counts.quizDecks} isActive={isActive('/dashboard/quizzes')} collapsed={collapsed} />
            <NavLink href="/dashboard/practice-exams" icon="📋" label="Practice Exams" count={counts.exams} isActive={isActive('/dashboard/practice-exams')} collapsed={collapsed} />
            <NavLink href="/dashboard/podcasts" icon="🎙️" label="Podcasts" count={counts.podcasts} isActive={isActive('/dashboard/podcasts')} collapsed={collapsed} />
          </>
        )}

        {/* ── TOOLS ── */}
        <SectionHeader label="Tools" collapsed={collapsed} open={sectionOpen.tools} onToggle={() => toggleSection('tools')} />

        {sectionOpen.tools && (
          <>
            <NavLink href="/dashboard/weak-topics" icon="⚠" label="Weak Topics" isActive={isActive('/dashboard/weak-topics')} collapsed={collapsed} />
            <NavLink href="/dashboard/tasks" icon="✓" label="Tasks" isActive={isActive('/dashboard/tasks')} collapsed={collapsed} />
            <NavLink href="/dashboard/study-plan" icon="📅" label="Study Plan" isActive={isActive('/dashboard/study-plan')} collapsed={collapsed} />
          </>
        )}
      </nav>

      {/* User footer — click name to go to settings */}
      <div className="px-1.5 pb-2 pt-1">
        {!collapsed ? (
          <Link
            href="/dashboard/settings"
            className="flex items-center gap-2 px-2.5 py-2 rounded-lg transition-colors hover:bg-[var(--bg-hover)]"
          >
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-semibold shrink-0"
              style={{ backgroundColor: 'var(--brand)' }}
            >
              {initials}
            </div>
            <p className="text-xs font-medium truncate flex-1 min-w-0" style={{ color: 'var(--text-1)' }}>
              {displayName}
            </p>
          </Link>
        ) : (
          <Link
            href="/dashboard/settings"
            title="Settings"
            className="w-full flex items-center justify-center py-2 rounded-lg transition-colors hover:bg-[var(--bg-hover)]"
          >
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-semibold"
              style={{ backgroundColor: 'var(--brand)' }}
            >
              {initials}
            </div>
          </Link>
        )}
      </div>
    </aside>
  );
}
