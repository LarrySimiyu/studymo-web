'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { House, Star, Folder as FolderIcon, Library, Wrench, Layers, Heart, ClipboardList, Mic, TriangleAlert, CheckSquare, CalendarDays, Menu, LucideIcon } from 'lucide-react';
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
    <span className="ml-auto shrink-0 text-[10px] font-medium leading-5 min-w-[18px] text-center text-[var(--text-3)] group-hover:text-white group-[.active]:text-white">
      {n}
    </span>
  );
}

function Divider() {
  return <div className="mx-2 my-1.5" style={{ height: 1, backgroundColor: 'var(--border)' }} />;
}

function SectionHeader({
  label, icon: Icon, collapsed, open, onToggle,
}: { label: string; icon?: LucideIcon; collapsed: boolean; open: boolean; onToggle: () => void }) {
  if (collapsed) {
    return Icon ? (
      <button onClick={onToggle} className="group w-full flex justify-center py-1.5">
        <Icon size={16} className="text-[var(--text-2)] group-hover:text-white transition-colors" />
      </button>
    ) : null;
  }
  return (
    <button onClick={onToggle} className="group w-full flex items-center gap-1.5 px-2.5 pt-2 pb-1">
      {Icon && <Icon size={14} className="text-[var(--text-2)] group-hover:text-white transition-colors" />}
      <span className="flex-1 text-left text-sm font-semibold text-[var(--text-2)] group-hover:text-white transition-colors">
        {label}
      </span>
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none"
        className="text-[var(--text-2)] group-hover:text-white transition-colors"
        style={{ transform: open ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.15s' }}>
        <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

function NavLink({ href, icon, label, count, isActive, collapsed, small }: {
  href: string; icon: React.ReactNode; label: string; count?: number; isActive: boolean; collapsed: boolean; small?: boolean;
}) {
  return (
    <Link
      href={href}
      title={collapsed ? label : undefined}
      className={cn(
        'group flex items-center gap-1.5 px-2.5 py-2 rounded-lg font-medium transition-colors',
        small ? 'text-xs' : 'text-sm',
        collapsed ? 'justify-center' : '',
        isActive
          ? 'active text-[var(--text-1)] bg-[var(--bg-hover)]'
          : 'text-[var(--text-2)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-1)]'
      )}
    >
      <span className="leading-none shrink-0 flex items-center">{icon}</span>
      {!collapsed && (
        <>
          <span className="truncate flex-1">{label}</span>
          <CountBadge n={count} />
        </>
      )}
    </Link>
  );
}

interface SidebarContentProps {
  collapsed: boolean;
  pathname: string;
  selectedFolder: string;
  isLibraryActive: boolean;
  folders: Folder[];
  counts: Partial<Counts>;
  unfiledCount: number;
  sectionOpen: { notes: boolean; study: boolean; tools: boolean };
  toggleSection: (key: 'notes' | 'study' | 'tools') => void;
  toggleCollapsed?: () => void;
  showCollapseBtn?: boolean;
  displayName: string;
  initials: string;
}

function SidebarContent({
  collapsed,
  pathname,
  selectedFolder,
  isLibraryActive,
  folders,
  counts,
  unfiledCount,
  sectionOpen,
  toggleSection,
  toggleCollapsed,
  showCollapseBtn,
  displayName,
  initials,
}: SidebarContentProps) {
  const flat = flattenFolders(folders);

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

  return (
    <>
      {/* Logo + collapse */}
      <div className="flex items-center justify-between px-3 py-3.5 shrink-0">
        {!collapsed && (
          <span className="text-sm font-bold tracking-tight" style={{ color: 'var(--text-1)' }}>Studymo</span>
        )}
        {showCollapseBtn && isLibraryActive && (
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
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-1.5 py-2 overflow-y-auto overflow-x-hidden space-y-1">
        <NavLink href="/dashboard" icon={<House size={16} />} label="Home" isActive={isActive('/dashboard', true)} collapsed={collapsed} />
        <Link
          href="/dashboard/tutor"
          title={collapsed ? 'AI Tutor' : undefined}
          className={cn(
            'flex items-center gap-1.5 px-2.5 py-2 rounded-lg font-medium transition-opacity text-sm text-white hover:opacity-90',
            collapsed ? 'justify-center' : '',
          )}
          style={{ background: 'linear-gradient(135deg, #FF6500, #FF9A3C)' }}
        >
          <Star size={16} className="shrink-0" fill="white" />
          {!collapsed && <span className="truncate flex-1">AI Tutor</span>}
        </Link>

        {/* ── NOTES ── */}
        <SectionHeader label="Notes" icon={FolderIcon} collapsed={collapsed} open={sectionOpen.notes} onToggle={() => toggleSection('notes')} />

        <AnimatePresence initial={false}>
          {sectionOpen.notes && (
            <motion.div
              key="notes-section"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="overflow-hidden space-y-1"
            >
              {!collapsed && (
                <div className="ml-4 space-y-0.5 overflow-hidden">
                  <Link
                    href="/dashboard/library"
                    className={cn(
                      'flex items-center gap-2 px-2 py-1 rounded-md text-xs transition-colors',
                      isLibraryActive && selectedFolder === 'all'
                        ? 'text-[var(--text-1)] bg-[var(--bg-hover)]'
                        : 'text-[var(--text-2)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-1)]'
                    )}
                  >
                    <span className="truncate flex-1">All Notes</span>
                    <CountBadge n={counts.notes} />
                  </Link>
                  <Link
                    href={folderHref('none')}
                    className={cn(
                      'flex items-center gap-2 px-2 py-1 rounded-md text-xs transition-colors',
                      isFolderActive('none')
                        ? 'text-[var(--text-1)] bg-[var(--bg-hover)]'
                        : 'text-[var(--text-2)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-1)]'
                    )}
                  >
                    <span className="truncate flex-1">No Collection</span>
                    <CountBadge n={unfiledCount} />
                  </Link>

                  {flat.map((f) => (
                    <Link
                      key={f.id}
                      href={folderHref(f.id)}
                      className={cn(
                        'flex items-center gap-2 py-1 rounded-md text-xs transition-colors',
                        isFolderActive(f.id)
                          ? 'text-[var(--brand)] bg-[var(--bg-hover)]'
                          : 'text-[var(--text-2)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-1)]'
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
                    className="w-full flex items-center gap-2 px-2 py-1 rounded-md text-xs transition-colors text-[var(--text-2)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-1)]"
                  >
                    <span className="text-xs opacity-60">+</span>
                    <span>New Collection</span>
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── STUDY MATERIALS ── */}
        <SectionHeader label="Study Materials" icon={Library} collapsed={collapsed} open={sectionOpen.study} onToggle={() => toggleSection('study')} />

        <AnimatePresence initial={false}>
          {sectionOpen.study && (
            <motion.div
              key="study-section"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className={cn('overflow-hidden space-y-0.5', !collapsed && 'ml-4')}
            >
              <NavLink href="/dashboard/flashcards" icon={<Layers size={14} />} label="Flashcards" count={counts.flashcardDecks} isActive={isActive('/dashboard/flashcards')} collapsed={collapsed} small />
              <NavLink href="/dashboard/quizzes" icon={<Heart size={14} />} label="Quizzes" count={counts.quizDecks} isActive={isActive('/dashboard/quizzes')} collapsed={collapsed} small />
              <NavLink href="/dashboard/practice-exams" icon={<ClipboardList size={14} />} label="Practice Exams" count={counts.exams} isActive={isActive('/dashboard/practice-exams')} collapsed={collapsed} small />
              <NavLink href="/dashboard/podcasts" icon={<Mic size={14} />} label="Podcasts" count={counts.podcasts} isActive={isActive('/dashboard/podcasts')} collapsed={collapsed} small />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── TOOLS ── */}
        <SectionHeader label="Tools" icon={Wrench} collapsed={collapsed} open={sectionOpen.tools} onToggle={() => toggleSection('tools')} />

        <AnimatePresence initial={false}>
          {sectionOpen.tools && (
            <motion.div
              key="tools-section"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className={cn('overflow-hidden space-y-0.5', !collapsed && 'ml-4')}
            >
              <NavLink href="/dashboard/weak-topics" icon={<TriangleAlert size={14} />} label="Weak Topics" isActive={isActive('/dashboard/weak-topics')} collapsed={collapsed} small />
              <NavLink href="/dashboard/tasks" icon={<CheckSquare size={14} />} label="Tasks" isActive={isActive('/dashboard/tasks')} collapsed={collapsed} small />
              <NavLink href="/dashboard/study-plan" icon={<CalendarDays size={14} />} label="Study Plan" isActive={isActive('/dashboard/study-plan')} collapsed={collapsed} small />
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* User footer */}
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
    </>
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

  // Responsive: true when viewport < 1024px
  const [isSmall, setIsSmall] = useState(false);
  const [overlayOpen, setOverlayOpen] = useState(false);
  const overlayCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const check = () => setIsSmall(window.innerWidth < 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

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
    if (!isLibraryActive) {
      setCollapsed(false);
      return;
    }
    foldersApi.getAll().then(({ data }) => { if (data) setFolders(data); });
  }, [isLibraryActive]);

  useEffect(() => {
    if (!isLibraryActive) return;
    const handler = () => foldersApi.getAll().then(({ data }) => { if (data) setFolders(data); });
    window.addEventListener('library:folders-changed', handler);
    return () => window.removeEventListener('library:folders-changed', handler);
  }, [isLibraryActive]);

  // Close overlay when route changes
  useEffect(() => { setOverlayOpen(false); }, [pathname]);

  // Listen for open/close events dispatched by TopNav hamburger
  useEffect(() => {
    if (!isSmall) return;
    function handleOpen() {
      if (overlayCloseTimer.current) clearTimeout(overlayCloseTimer.current);
      setOverlayOpen(true);
    }
    function handleCloseIntent() {
      overlayCloseTimer.current = setTimeout(() => setOverlayOpen(false), 200);
    }
    window.addEventListener('sidebar:open', handleOpen);
    window.addEventListener('sidebar:close-intent', handleCloseIntent);
    return () => {
      window.removeEventListener('sidebar:open', handleOpen);
      window.removeEventListener('sidebar:close-intent', handleCloseIntent);
    };
  }, [isSmall]);

  const displayName = dbUser?.name ?? currentUser?.displayName ?? currentUser?.email?.split('@')[0] ?? 'User';
  const initials = displayName.slice(0, 2).toUpperCase();

  const sharedProps = {
    pathname,
    selectedFolder,
    isLibraryActive,
    folders,
    counts,
    unfiledCount,
    sectionOpen,
    toggleSection,
    displayName,
    initials,
  };

  // ── Small screen: overlay only (hamburger lives in TopNav) ──────────
  if (isSmall) {
    function handleOverlayEnter() {
      if (overlayCloseTimer.current) clearTimeout(overlayCloseTimer.current);
    }
    function handleOverlayLeave() {
      overlayCloseTimer.current = setTimeout(() => setOverlayOpen(false), 200);
    }

    return (
      <AnimatePresence>
        {overlayOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOverlayOpen(false)} />
            <motion.div
              key="sidebar-overlay"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="fixed top-14 left-3 bottom-3 z-50 flex flex-col rounded-2xl overflow-hidden shadow-2xl"
              style={{ width: 280, backgroundColor: 'var(--bg-card)' }}
              onMouseEnter={handleOverlayEnter}
              onMouseLeave={handleOverlayLeave}
            >
              <SidebarContent
                {...sharedProps}
                collapsed={false}
                showCollapseBtn={false}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  }

  // ── Large screen: regular collapsible sidebar ────────────────────────
  return (
    <aside
      className="shrink-0 flex flex-col transition-all duration-200 my-3 ml-3 rounded-2xl overflow-hidden"
      style={{ width: collapsed ? 60 : 330, backgroundColor: 'var(--bg-card)' }}
    >
      <SidebarContent
        {...sharedProps}
        collapsed={collapsed}
        toggleCollapsed={toggleCollapsed}
        showCollapseBtn={true}
      />
    </aside>
  );
}
