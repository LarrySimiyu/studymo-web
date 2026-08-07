'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { FileText, X } from 'lucide-react';
import RecommendedSection from '@/components/dashboard/RecommendedSection';
import PlanningPanel from '@/components/dashboard/PlanningPanel';
import TasksPanel from '@/components/tasks/TasksPanel';
import PlanningTasksSection from '@/components/dashboard/PlanningTasksSection';
import { useAuth } from '@/hooks/useAuth';
import { AnimatePresence, motion } from 'framer-motion';
import { weakTopicsApi, WeakTopic } from '@/lib/api/studyPlan';
import SegmentedTabs from '@/components/ui/SegmentedTabs';

import { notesApi } from '@/lib/api/documents';
import QuizStatsCard from '@/components/dashboard/QuizStatsCard';
import WeakTopicItem from '@/components/dashboard/WeakTopicItem';
import TaskModal from '@/components/tasks/TaskModal';
import { getPalette } from '@/components/dashboard/PlanCard';
import { SectionHeading } from '@/components/dashboard/PageHeader';
import { Button } from '@/components/ui/Button';

type RightTab = 'planning' | 'tasks';

function RightPanelTabs() {
  const [active, setActive] = useState<RightTab>('planning');
  const [planCount, setPlanCount] = useState(0);
  const [taskCount, setTaskCount] = useState(0);

  return (
    <div className="flex flex-col gap-4 h-full overflow-y-auto scrollbar-hide px-4 sm:px-6 py-4 sm:py-6" style={{ scrollbarWidth: 'none' }}>
      {/* Tabs */}
      <SegmentedTabs
        fill
        className="shrink-0"
        active={active}
        onChange={setActive}
        segments={[
          { value: 'planning' as RightTab, label: `Planning${planCount > 0 ? ` · ${planCount}` : ''}` },
          { value: 'tasks' as RightTab, label: `Tasks${taskCount > 0 ? ` · ${taskCount}` : ''}` },
        ]}
      />

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
      <div className="min-w-0 flex-1 px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
      {welcomeToast && (
        <div
          className="fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl text-sm font-medium text-white"
          style={{ backgroundColor: 'var(--brand)', maxWidth: '340px' }}
        >
          <span>Welcome to Studymo Pro. Let&apos;s start studying.</span>
          <button
            onClick={() => setWelcomeToast(false)}
            aria-label="Dismiss"
            className="ml-2 text-white/60 transition-colors hover:text-white"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <div className="space-y-6">

        {/* Welcome */}
        <div>
          <h1 className="text-heading-sm md:text-heading text-[var(--text-1)]">Welcome back, {displayName}</h1>
          <p className="mt-1 text-body-sm text-[var(--text-2)]">Here&apos;s what&apos;s happening with your studies.</p>
        </div>

        {/* Recent Notes */}
        {recentNotes.length > 0 && (
          <div>
            <SectionHeading
              action={
                <Button variant="link" size="link" asChild>
                  <Link href="/dashboard/library">View All</Link>
                </Button>
              }
            >
              Recent Notes
            </SectionHeading>
            <div className="flex gap-3 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [scrollbar-width:none] sm:[&::-webkit-scrollbar]:block sm:[scrollbar-width:thin]">
              {recentNotes.map(note => {
                const [iconColor, iconBg] = getPalette(note.document.id);
                return (
                  <Link
                    key={note.id}
                    href={`/dashboard/library/${note.document.id}`}
                    className="flex shrink-0 items-center gap-3 rounded-xl bg-[var(--bg-card)] px-4 py-3 transition-colors hover:bg-[var(--bg-hover)]"
                    style={{ width: 220 }}
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
          <SectionHeading>Planning &amp; Tasks</SectionHeading>
          <PlanningTasksSection />
        </div>

        {/* Quiz Stats */}
        <QuizStatsCard />

        {/* Weak Topics */}
        {topWeakTopics.length > 0 && (
          <div>
            <SectionHeading
              action={
                <Button variant="link" size="link" asChild>
                  <Link href="/dashboard/weak-topics">View All</Link>
                </Button>
              }
            >
              Weak Topics
            </SectionHeading>
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

    <TaskModal
      open={showTaskModal}
      onClose={() => setShowTaskModal(false)}
      onSave={() => setShowTaskModal(false)}
    />
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
