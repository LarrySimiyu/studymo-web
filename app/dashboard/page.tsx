'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { FileText } from 'lucide-react';
import RecommendedSection from '@/components/dashboard/RecommendedSection';
import PlanningPanel from '@/components/dashboard/PlanningPanel';
import TasksPanel from '@/components/tasks/TasksPanel';
import PlanningTasksSection from '@/components/dashboard/PlanningTasksSection';
import { useAuth } from '@/hooks/useAuth';
import { AnimatePresence, motion } from 'framer-motion';
import { weakTopicsApi, WeakTopic } from '@/lib/api/studyPlan';

const PALETTE: [string, string][] = [
  ['#FF6500', 'rgba(255,101,0,0.12)'],
  ['#22C55E', 'rgba(34,197,94,0.12)'],
  ['#3B82F6', 'rgba(59,130,246,0.12)'],
  ['#F59E0B', 'rgba(245,158,11,0.12)'],
  ['#EC4899', 'rgba(236,72,153,0.12)'],
  ['#8B5CF6', 'rgba(139,92,246,0.12)'],
  ['#14B8A6', 'rgba(20,184,166,0.12)'],
];

function getPalette(id: string): [string, string] {
  const hash = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return PALETTE[hash % PALETTE.length];
}
import { notesApi } from '@/lib/api/documents';
import QuizStatsCard from '@/components/dashboard/QuizStatsCard';
import WeakTopicItem from '@/components/dashboard/WeakTopicItem';
import TaskModal from '@/components/tasks/TaskModal';

type RightTab = 'planning' | 'tasks';

function RightPanelTabs() {
  const [active, setActive] = useState<RightTab>('planning');
  const [planCount, setPlanCount] = useState(0);
  const [taskCount, setTaskCount] = useState(0);

  return (
    <div className="flex flex-col gap-4 h-full overflow-y-auto scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl shrink-0" style={{ backgroundColor: 'var(--bg-card)' }}>
        {(['planning', 'tasks'] as RightTab[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActive(tab)}
            className="flex-1 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors"
            style={{
              backgroundColor: active === tab ? 'var(--bg-input)' : 'transparent',
              color: active === tab ? 'var(--text-1)' : 'var(--text-3)',
            }}
          >
            {tab === 'planning'
              ? `Planning${planCount > 0 ? ` · ${planCount}` : ''}`
              : `Tasks${taskCount > 0 ? ` · ${taskCount}` : ''}`}
          </button>
        ))}
      </div>

      {/* Panel content with slide animation */}
      <div className="flex-1 overflow-y-auto scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
          >
            {active === 'planning'
              ? <PlanningPanel onCountChange={setPlanCount} />
              : <TasksPanel onCountChange={setTaskCount} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function DashboardContent() {
  const { currentUser, dbUser, refreshSubscription } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [welcomeToast, setWelcomeToast] = useState(false);
  const displayName = dbUser?.name ?? currentUser?.displayName ?? currentUser?.email?.split('@')[0] ?? 'there';

  const [topWeakTopics, setTopWeakTopics] = useState<WeakTopic[]>([]);
  const [recentNotes, setRecentNotes] = useState<{ id: string; summary: string | null; document: { id: string; title: string } }[]>([]);
  const [showTaskModal, setShowTaskModal] = useState(false);

  useEffect(() => {
    if (searchParams.get('subscribed') === 'true') {
      refreshSubscription();
      setWelcomeToast(true);
      const url = new URL(window.location.href);
      url.searchParams.delete('subscribed');
      router.replace(url.pathname);
      setTimeout(() => setWelcomeToast(false), 5000);
    }
  }, [searchParams, refreshSubscription, router]);

  useEffect(() => {
    weakTopicsApi.getAll().then(({ data }) => {
      if (data) setTopWeakTopics(data.filter(t => !t.resolved).slice(0, 4));
    }).catch(() => {});
    notesApi.getAll().then(({ data }) => {
      if (data) setRecentNotes(data.slice(0, 10));
    }).catch(() => {});
  }, []);

  return (
    <>
    <div className="flex gap-0 xl:gap-6 min-h-full">

      {/* Main content */}
      <div className="flex-1 min-w-0 p-6">
      {welcomeToast && (
        <div
          className="fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl text-sm font-medium text-white"
          style={{ backgroundColor: '#9747FF', maxWidth: '340px' }}
        >
          <span>🎉</span>
          <span>Welcome to Studymo Pro! Let&apos;s start studying.</span>
          <button onClick={() => setWelcomeToast(false)} className="ml-2 text-white/60 hover:text-white text-base leading-none">×</button>
        </div>
      )}

      <div className="space-y-6">

        {/* Welcome */}
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-1)]">Welcome back, {displayName}</h1>
          <p className="text-[var(--text-2)] mt-1 text-sm">Here&apos;s what&apos;s happening with your studies.</p>
        </div>

        {/* Recent Notes */}
        {recentNotes.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xs font-medium text-[var(--text-2)]">Recent Notes</h2>
              <Link href="/dashboard/notes" className="text-xs font-medium" style={{ color: 'var(--text-2)' }}>View All</Link>
            </div>
            <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' } as React.CSSProperties}>
              {recentNotes.map(note => {
                const [iconColor, iconBg] = getPalette(note.document.id);
                return (
                  <Link
                    key={note.id}
                    href={`/dashboard/library?note=${note.document.id}`}
                    className="shrink-0 flex items-center gap-3 px-4 py-3 rounded-xl transition-colors"
                    style={{ backgroundColor: 'var(--bg-card)', width: 220 }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--bg-card)')}
                  >
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                      style={{ backgroundColor: iconBg }}
                    >
                      <FileText size={16} style={{ color: iconColor }} />
                    </div>
                    <p className="text-body-sm font-medium text-[var(--text-1)] truncate">{note.document.title}</p>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Recommended */}
        <RecommendedSection />

        {/* Planning & Tasks — inline section on non-xl screens */}
        <div className="xl:hidden">
          <h2 className="text-xs font-medium text-[var(--text-2)] mb-3">Planning & Tasks</h2>
          <PlanningTasksSection />
        </div>

        {/* Quiz Stats */}
        <QuizStatsCard />

        {/* Weak Topics */}
        {topWeakTopics.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xs font-medium text-[var(--text-2)]">Weak Topics</h2>
              <Link href="/dashboard/weak-topics" className="text-xs font-medium" style={{ color: 'var(--text-2)' }}>View All</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {topWeakTopics.map(wt => (
                <WeakTopicItem
                  key={wt.id}
                  topic={wt}
                  onResolved={updated => setTopWeakTopics(prev => prev.map(t => t.id === updated.id ? updated : t))}
                />
              ))}
            </div>
          </div>
        )}

      </div>

      </div>{/* end main content */}

      {/* Right side panel — xl+ only */}
      <div className="hidden xl:flex xl:flex-col w-80 shrink-0 py-6 pr-6 gap-4">
        {/* Tab switcher */}
        <RightPanelTabs />
      </div>

    </div>

    {showTaskModal && (
      <TaskModal
        onClose={() => setShowTaskModal(false)}
        onSave={() => setShowTaskModal(false)}
      />
    )}
    </>
  );
}

export default function DashboardPage() {
  return (
    <Suspense>
      <DashboardContent />
    </Suspense>
  );
}
