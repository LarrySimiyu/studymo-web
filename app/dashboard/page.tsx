'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { weakTopicsApi, WeakTopic } from '@/lib/api/studyPlan';
import { notesApi } from '@/lib/api/documents';
import UnifiedCalendar from '@/components/dashboard/UnifiedCalendar';
import QuizScoreCard from '@/components/dashboard/QuizScoreCard';
import WeakTopicItem from '@/components/dashboard/WeakTopicItem';
import TaskModal from '@/components/tasks/TaskModal';

export default function DashboardPage() {
  const { currentUser, dbUser, refreshSubscription } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [welcomeToast, setWelcomeToast] = useState(false);
  const displayName = dbUser?.name ?? currentUser?.displayName ?? currentUser?.email?.split('@')[0] ?? 'there';

  const [topWeakTopics, setTopWeakTopics] = useState<WeakTopic[]>([]);
  const [recentNotes, setRecentNotes] = useState<{ id: string; summary: string | null; document: { id: string; title: string } }[]>([]);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskModalDueDate, setTaskModalDueDate] = useState('');

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
      if (data) setTopWeakTopics(data.filter(t => !t.resolved).slice(0, 6));
    }).catch(() => {});
    notesApi.getAll().then(({ data }) => {
      if (data) setRecentNotes(data.slice(0, 10));
    }).catch(() => {});
  }, []);

  return (
    <>
    <div className="flex flex-col lg:flex-row gap-6 items-start py-2">
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

      {/* Left column: scrollable content */}
      <div className="flex-1 min-w-0 space-y-6">

        {/* Welcome */}
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-1)]">Welcome back, {displayName}</h1>
          <p className="text-[var(--text-2)] mt-1 text-sm">Here&apos;s what&apos;s happening with your studies.</p>
        </div>

        {/* Recent Notes */}
        {recentNotes.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xs font-semibold text-[var(--text-1)]">Recent Notes</h2>
              <Link href="/dashboard/notes" className="text-xs" style={{ color: 'var(--text-1)' }}>View All</Link>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' } as React.CSSProperties}>
              {recentNotes.map(note => (
                <Link
                  key={note.id}
                  href={`/dashboard/library?note=${note.document.id}`}
                  className="shrink-0 flex flex-col gap-1 px-3 py-2.5 rounded-xl hover:border-purple-500/50 transition-colors"
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    width: 160,
                  }}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs">📄</span>
                    <p className="text-xs font-medium text-[var(--text-1)] truncate">{note.document.title}</p>
                  </div>
                  {note.summary && (
                    <p className="text-[10px] text-[var(--text-3)] leading-tight line-clamp-2">{note.summary}</p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Recommended */}
        <div className="rounded-xl p-5" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <h2 className="text-sm font-semibold text-[var(--text-1)] mb-4">Recommended For You</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { icon: '📅', title: 'Create a Study Plan', desc: 'Set a test date and get a day-by-day schedule', href: '/dashboard/study-plan' },
              { icon: '❓', title: 'Take a Quiz', desc: 'Test your knowledge and track weak topics', href: '/dashboard/quizzes' },
              { icon: '📋', title: 'Practice Exam', desc: 'Simulate the real exam experience', href: '/dashboard/practice-exams' },
            ].map(item => (
              <Link
                key={item.href}
                href={item.href}
                className="p-4 rounded-lg hover:bg-black/5 transition-colors group"
                style={{ border: '1px solid var(--border)' }}
              >
                <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lg mb-2 group-hover:scale-110 transition-transform" style={{ backgroundColor: 'var(--bg-input)' }}>
                  {item.icon}
                </div>
                <p className="text-sm font-medium text-[var(--text-1)]">{item.title}</p>
                <p className="text-xs text-[var(--text-2)] mt-0.5">{item.desc}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Quiz Score */}
        <QuizScoreCard />

        {/* Weak Topics */}
        {topWeakTopics.length > 0 && (
          <div className="rounded-xl p-5" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-[var(--text-1)]">Weak Topics</h2>
              <Link href="/dashboard/weak-topics" className="text-xs" style={{ color: 'var(--text-1)' }}>View All</Link>
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

      {/* Right column: sticky calendar */}
      <div className="w-full lg:w-[360px] shrink-0 lg:sticky lg:top-0">
        <UnifiedCalendar onAddTask={date => { setTaskModalDueDate(date); setShowTaskModal(true); }} />
      </div>

    </div>

    {showTaskModal && (
      <TaskModal
        defaultDueDate={taskModalDueDate}
        onClose={() => setShowTaskModal(false)}
        onSave={() => setShowTaskModal(false)}
      />
    )}
    </>
  );
}
