'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { House, Plus, Folder as FolderIcon, Library, Wrench, Layers, Heart, ClipboardList, Mic, TriangleAlert, CheckSquare, CalendarDays, Zap, Sun, Moon, PanelLeft } from 'lucide-react';
import { useTheme } from '@/components/ui/ThemeProvider';
import { useAuth } from '@/hooks/useAuth';
import { useNewChat } from '@/hooks/useNewChat';
import { cn } from '@/lib/utils';
import { foldersApi, Folder, practiceExamsApi } from '@/lib/api/organization';
import { documentsApi } from '@/lib/api/documents';
import { podcastsApi } from '@/lib/api/podcasts';
import { flattenFolders } from '@/components/library/libraryUtils';
import { CountBadge, SectionHeader, NavLink, sectionMotion, SectionKey } from './SidebarNavPrimitives';
import SidebarChatHistory from './SidebarChatHistory';
import SidebarRail from './SidebarRail';

interface Counts {
  notes: number;
  flashcardDecks: number;
  quizDecks: number;
  exams: number;
  podcasts: number;
}

interface SidebarContentProps {
  pathname: string;
  selectedFolder: string;
  isLibraryActive: boolean;
  folders: Folder[];
  counts: Partial<Counts>;
  unfiledCount: number;
  sectionOpen: Record<SectionKey, boolean>;
  toggleSection: (key: SectionKey) => void;
  toggleCollapsed?: () => void;
  displayName: string;
  initials: string;
  subscriptionStatus: { hasAccess: boolean } | null;
}

function SidebarContent({
  pathname,
  selectedFolder,
  isLibraryActive,
  folders,
  counts,
  unfiledCount,
  sectionOpen,
  toggleSection,
  toggleCollapsed,
  displayName,
  initials,
  subscriptionStatus,
}: SidebarContentProps) {
  const flat = flattenFolders(folders);
  const { theme, toggle } = useTheme();
  const { startNewChat, creating } = useNewChat();

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
        <span className="text-sm font-bold tracking-tight" style={{ color: 'var(--text-1)' }}>StudyMo</span>
        {toggleCollapsed && (
          <button
            onClick={toggleCollapsed}
            className="flex items-center justify-center w-7 h-7 rounded-md transition-colors hover:bg-[var(--bg-hover)]"
            title="Collapse sidebar"
            aria-label="Collapse sidebar"
          >
            <PanelLeft size={16} strokeWidth={1.75} style={{ color: 'var(--text-3)' }} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-1.5 py-2 overflow-y-auto overflow-x-hidden space-y-1">
        <button
          onClick={startNewChat}
          disabled={creating}
          className="group w-full flex items-center gap-1.5 px-2.5 py-2 rounded-lg font-bold text-sm text-white transition-all duration-200 hover:scale-[1.03] hover:brightness-125 active:scale-100 disabled:opacity-60 disabled:hover:scale-100"
          style={{ background: 'linear-gradient(135deg, #FF6500, #FF9A3C)' }}
        >
          {creating
            ? <span className="w-4 h-4 shrink-0 border-2 border-white border-t-transparent rounded-full animate-spin" />
            : <Plus size={16} className="shrink-0" strokeWidth={2.5} />}
          <span className="truncate flex-1 text-left">New Chat</span>
        </button>
        <NavLink href="/dashboard/home" icon={<House size={16} />} label="Home" isActive={isActive('/dashboard/home', true)} />

        {/* ── NOTES ── */}
        <SectionHeader label="Notes" icon={FolderIcon} open={sectionOpen.notes} onToggle={() => toggleSection('notes')} />

        <AnimatePresence initial={false}>
          {sectionOpen.notes && (
            <motion.div key="notes-section" {...sectionMotion} className="overflow-hidden space-y-1">
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
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── STUDY MATERIALS ── */}
        <SectionHeader label="Study Materials" icon={Library} open={sectionOpen.study} onToggle={() => toggleSection('study')} />

        <AnimatePresence initial={false}>
          {sectionOpen.study && (
            <motion.div key="study-section" {...sectionMotion} className="overflow-hidden space-y-0.5 ml-4">
              <NavLink href="/dashboard/flashcards" icon={<Layers size={14} />} label="Flashcards" count={counts.flashcardDecks} isActive={isActive('/dashboard/flashcards')} small />
              <NavLink href="/dashboard/quizzes" icon={<Heart size={14} />} label="Quizzes" count={counts.quizDecks} isActive={isActive('/dashboard/quizzes')} small />
              <NavLink href="/dashboard/practice-exams" icon={<ClipboardList size={14} />} label="Practice Exams" count={counts.exams} isActive={isActive('/dashboard/practice-exams')} small />
              <NavLink href="/dashboard/podcasts" icon={<Mic size={14} />} label="Podcasts" count={counts.podcasts} isActive={isActive('/dashboard/podcasts')} small />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── TOOLS ── */}
        <SectionHeader label="Tools" icon={Wrench} open={sectionOpen.tools} onToggle={() => toggleSection('tools')} />

        <AnimatePresence initial={false}>
          {sectionOpen.tools && (
            <motion.div key="tools-section" {...sectionMotion} className="overflow-hidden space-y-0.5 ml-4">
              <NavLink href="/dashboard/study-plan" icon={<CalendarDays size={14} />} label="Study Plan" isActive={isActive('/dashboard/study-plan')} small />
              <NavLink href="/dashboard/tasks" icon={<CheckSquare size={14} />} label="Tasks" isActive={isActive('/dashboard/tasks')} small />
              <NavLink href="/dashboard/weak-topics" icon={<TriangleAlert size={14} />} label="Weak Topics" isActive={isActive('/dashboard/weak-topics')} small />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── RECENTS ── */}
        <SidebarChatHistory
          open={sectionOpen.chats}
          onToggle={() => toggleSection('chats')}
        />
      </nav>

      {/* Theme toggle */}
      <div className="px-1.5 pb-1">
        <div className="flex items-center gap-2 px-2.5 py-2">
          <button
            onClick={toggle}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="relative flex-shrink-0 w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none"
            style={{ backgroundColor: '#FF6500' }}
          >
            {/* track icons */}
            <Sun size={11} className="absolute left-1.5 top-1/2 -translate-y-1/2 text-white" />
            <Moon size={11} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-white" />
            {/* thumb */}
            <span
              className={cn(
                'absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 flex items-center justify-center',
                theme === 'dark' ? 'translate-x-5' : 'translate-x-0.5'
              )}
            >
              {theme === 'dark'
                ? <Moon size={11} className="text-[#FF6500]" />
                : <Sun size={11} className="text-[#FF6500]" />}
            </span>
          </button>
          <span className="text-xs" style={{ color: 'var(--text-2)' }}>
            {theme === 'dark' ? 'Light mode' : 'Dark mode'}
          </span>
        </div>
      </div>

      {/* Get Unlimited banner (free users only) */}
      {!subscriptionStatus?.hasAccess && (
        <div className="px-1.5 pb-1">
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('app:show-paywall'))}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-left transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #FF6500, #FF9A3C)' }}
          >
            <Zap size={14} className="text-white shrink-0" />
            <span className="text-xs font-semibold text-white">Get Unlimited</span>
          </button>
        </div>
      )}

      {/* User footer */}
      <div className="px-1.5 pb-2 pt-1">
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
      </div>
    </>
  );
}

export default function Sidebar() {
  const { currentUser, dbUser, subscriptionStatus } = useAuth();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [folders, setFolders] = useState<Folder[]>([]);
  const [counts, setCounts] = useState<Partial<Counts>>({});
  const [unfiledCount, setUnfiledCount] = useState(0);
  const [sectionOpen, setSectionOpen] = useState<Record<SectionKey, boolean>>({ notes: true, study: false, tools: false, chats: true });
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

  function setCollapsedPersisted(next: boolean) {
    setCollapsed(next);
    localStorage.setItem('sidebar-collapsed', String(next));
  }

  // Rail section icons expand the sidebar straight into that section.
  function expandTo(section?: SectionKey) {
    setCollapsedPersisted(false);
    if (section) setSectionOpen(s => ({ ...s, [section]: true }));
  }

  function toggleSection(key: SectionKey) {
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
    if (!isLibraryActive) return;
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
    subscriptionStatus,
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
              <SidebarContent {...sharedProps} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  }

  // ── Large screen: icon rail or full panel ────────────────────────────
  if (collapsed) {
    return (
      <SidebarRail
        pathname={pathname}
        initials={initials}
        hasAccess={!!subscriptionStatus?.hasAccess}
        onExpand={expandTo}
      />
    );
  }

  return (
    <aside
      className="shrink-0 w-[330px] flex flex-col my-3 ml-3 rounded-2xl overflow-hidden"
      style={{ backgroundColor: 'var(--bg-card)' }}
    >
      <SidebarContent {...sharedProps} toggleCollapsed={() => setCollapsedPersisted(true)} />
    </aside>
  );
}
