'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { House, CirclePlus, Folder as FolderIcon, Library, Wrench, Layers, Heart, ClipboardList, Mic, TriangleAlert, CheckSquare, CalendarDays, Zap, Plus, PanelLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useDisplayName } from '@/hooks/useGreeting';
import { useNewChat } from '@/hooks/useNewChat';
import { useSidebarCounts, SidebarCounts } from '@/hooks/useSidebarCounts';
import { cn } from '@/lib/utils';
import { showPaywall } from '@/lib/paywall';
import { Button } from '@/components/ui/Button';
import FreeUsageStrip from './FreeUsageStrip';
import { Folder } from '@/lib/api/organization';
import { flattenFolders } from '@/components/library/libraryUtils';
import { CountBadge, SectionHeader, NavLink, sectionMotion, SectionKey, subItemRow, subItemIdle, subItemActive } from './SidebarNavPrimitives';
import SidebarChatHistory from './SidebarChatHistory';
import SidebarRail from './SidebarRail';

interface SidebarContentProps {
  pathname: string;
  selectedFolder: string;
  isLibraryActive: boolean;
  folders: Folder[];
  counts: Partial<SidebarCounts>;
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
  sectionOpen,
  toggleSection,
  toggleCollapsed,
  displayName,
  initials,
  subscriptionStatus,
}: SidebarContentProps) {
  const flat = flattenFolders(folders);
  const { startNewChat, creating } = useNewChat();

  function isActive(href: string, exact = false) {
    return exact ? pathname === href : pathname.startsWith(href);
  }

  function isFolderActive(value: string) {
    if (!isLibraryActive) return false;
    return selectedFolder === value;
  }

  function folderHref(value: string) {
    return value === 'all' ? '/dashboard/library' : `/dashboard/library?folder=${value}`;
  }

  return (
    <>
      {/* Logo + collapse */}
      <div className="flex items-center justify-between px-3 py-3.5 shrink-0">
        <span className="text-body-sm font-bold tracking-tight text-[var(--text-1)]">StudyMo</span>
        {toggleCollapsed && (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={toggleCollapsed}
            title="Collapse sidebar"
            aria-label="Collapse sidebar"
          >
            <PanelLeft size={16} strokeWidth={1.75} />
          </Button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-1.5 py-2 overflow-y-auto overflow-x-hidden space-y-1">
        <Button
          variant="ghost"
          onClick={startNewChat}
          disabled={creating}
          className="w-full justify-start px-2.5 text-[var(--brand-ink)] hover:text-[var(--brand-ink)]"
        >
          {creating
            ? <span className="w-4 h-4 shrink-0 border-2 border-current border-t-transparent rounded-full animate-spin" />
            : <CirclePlus size={14} className="shrink-0" strokeWidth={2} />}
          <span className="truncate flex-1 text-left">New Chat</span>
        </Button>
        <NavLink href="/dashboard/home" icon={<House size={14} />} label="Home" isActive={isActive('/dashboard/home', true)} />

        {/* ── NOTES ── */}
        <SectionHeader label="Notes" icon={FolderIcon} open={sectionOpen.notes} onToggle={() => toggleSection('notes')} />

        <AnimatePresence initial={false}>
          {sectionOpen.notes && (
            <motion.div key="notes-section" {...sectionMotion} className="overflow-hidden space-y-1">
              <div className="ml-4 space-y-0.5 overflow-hidden">
                <Link
                  href="/dashboard/library"
                  className={cn(
                    subItemRow,
                    isLibraryActive && selectedFolder === 'all' ? subItemActive : subItemIdle
                  )}
                >
                  <span className="truncate flex-1">All Notes</span>
                  <CountBadge n={counts.notes} />
                </Link>
                {flat.map((f) => (
                  <Link
                    key={f.id}
                    href={folderHref(f.id)}
                    className={cn(subItemRow, 'px-0', isFolderActive(f.id) ? subItemActive : subItemIdle)}
                    style={{ paddingLeft: `${8 + f.depth * 10}px`, paddingRight: '8px' }}
                  >
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: f.color ?? 'var(--brand)' }} />
                    <span className="truncate flex-1">{f.name}</span>
                    <CountBadge n={f._count?.documents} />
                  </Link>
                ))}

                <button
                  onClick={() => window.dispatchEvent(new CustomEvent('library:new-folder'))}
                  className={cn(subItemRow, subItemIdle, 'w-full')}
                >
                  <Plus size={12} className="shrink-0" />
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

      {/* Free-tier usage + Get Unlimited banner — the one gradient in the app */}
      {!subscriptionStatus?.hasAccess && (
        <div className="flex flex-col gap-1.5 px-1.5 pb-1">
          <FreeUsageStrip />
          <Button
            variant="upgrade"
            size="lg"
            onClick={() => showPaywall('sidebar')}
            className="w-full justify-start"
          >
            <Zap size={14} className="shrink-0" />
            Get Unlimited
          </Button>
        </div>
      )}

      {/* User footer */}
      <div className="px-1.5 pb-2 pt-1">
        <Link
          href="/dashboard/settings"
          className="flex items-center gap-2 px-2.5 py-2 rounded-lg transition-colors hover:bg-[var(--bg-hover)]"
        >
          <div className="w-6 h-6 rounded-full flex items-center justify-center bg-[var(--brand)] text-white text-2xs font-semibold shrink-0">
            {initials}
          </div>
          <p className="text-xs font-medium truncate flex-1 min-w-0 text-[var(--text-1)]">
            {displayName}
          </p>
        </Link>
      </div>
    </>
  );
}

export default function Sidebar() {
  const { subscriptionStatus } = useAuth();
  const displayName = useDisplayName();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { folders, counts, refreshFolders } = useSidebarCounts();
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
    if (isLibraryActive) refreshFolders();
  }, [isLibraryActive, refreshFolders]);

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

  const initials = displayName.slice(0, 2).toUpperCase();

  const sharedProps = {
    pathname,
    selectedFolder,
    isLibraryActive,
    folders,
    counts,
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
              className="fixed top-0 left-0 bottom-0 z-50 flex flex-col overflow-hidden shadow-2xl"
              style={{ width: 280, backgroundColor: 'var(--bg-card)', borderRight: '1px solid var(--border)' }}
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
      className="shrink-0 w-[330px] flex flex-col h-screen overflow-hidden"
      style={{ backgroundColor: 'var(--bg-card)', borderRight: '1px solid var(--border)' }}
    >
      <SidebarContent {...sharedProps} toggleCollapsed={() => setCollapsedPersisted(true)} />
    </aside>
  );
}
