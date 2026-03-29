'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { streakApi, studyPlansApi, weakTopicsApi, StudyPlan, WeakTopic, StudyStreak, WeakTopicSummary } from '@/lib/api/studyPlan';

export default function DashboardPage() {
  const { currentUser, dbUser, refreshSubscription } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [welcomeToast, setWelcomeToast] = useState(false);
  const displayName = dbUser?.name ?? currentUser?.displayName ?? currentUser?.email?.split('@')[0] ?? 'there';

  const [streak, setStreak] = useState<StudyStreak | null>(null);
  const [plans, setPlans] = useState<StudyPlan[]>([]);
  const [weakSummary, setWeakSummary] = useState<WeakTopicSummary | null>(null);
  const [topWeakTopics, setTopWeakTopics] = useState<WeakTopic[]>([]);
  const [loading, setLoading] = useState(true);

  // Handle ?subscribed=true return from Stripe checkout
  useEffect(() => {
    if (searchParams.get('subscribed') === 'true') {
      refreshSubscription();
      setWelcomeToast(true);
      // Remove the query param without re-render loop
      const url = new URL(window.location.href);
      url.searchParams.delete('subscribed');
      router.replace(url.pathname);
      setTimeout(() => setWelcomeToast(false), 5000);
    }
  }, [searchParams, refreshSubscription, router]);

  useEffect(() => {
    Promise.all([
      streakApi.get(),
      studyPlansApi.getAll(),
      weakTopicsApi.getSummary(),
      weakTopicsApi.getAll(),
    ]).then(([s, p, ws, wt]) => {
      if (s.data) setStreak(s.data);
      if (p.data) setPlans(p.data);
      if (ws.data) setWeakSummary(ws.data);
      if (wt.data) setTopWeakTopics(wt.data.slice(0, 3));
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];
  const upcomingPlans = plans
    .filter(p => p.daysUntilTest !== undefined && p.daysUntilTest >= 0)
    .sort((a, b) => (a.daysUntilTest ?? 0) - (b.daysUntilTest ?? 0))
    .slice(0, 3);

  const todayDays = plans.flatMap(p =>
    (p.dayEntries ?? []).filter(d => d.date.startsWith(todayStr))
      .map(d => ({ ...d, planTitle: p.title }))
  );

  function daysColor(days: number) {
    if (days <= 3) return '#EF4444';
    if (days <= 7) return '#F59E0B';
    return '#22C55E';
  }

  function completedCount(plan: StudyPlan) {
    const entries = plan.dayEntries ?? [];
    return entries.filter(d => d.completed).length;
  }

  return (
    <div className="max-w-5xl mx-auto py-2 space-y-6">
      {/* Welcome to Pro toast */}
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

      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-white">Welcome back, {displayName}</h1>
        <p className="text-gray-400 mt-1 text-sm">Here&apos;s what&apos;s happening with your studies.</p>
      </div>

      {/* Streak Banner */}
      <div
        className="rounded-xl p-5 flex items-center justify-between"
        style={{ backgroundColor: '#1A1A1A', border: '1px solid #2A2A2A' }}
      >
        {loading ? (
          <div className="h-8 w-48 rounded-lg animate-pulse" style={{ backgroundColor: '#2A2A2A' }} />
        ) : (
          <>
            <div className="flex items-center gap-4">
              <span className="text-4xl">🔥</span>
              <div>
                <p className="text-3xl font-bold text-white">{streak?.currentStreak ?? 0}
                  <span className="text-base font-normal text-gray-400 ml-1">day streak</span>
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Personal best: <span className="text-gray-300">{streak?.longestStreak ?? 0} days</span>
                  {streak?.lastStudyDate && (
                    <span className="ml-3">Last studied: {new Date(streak.lastStudyDate).toLocaleDateString()}</span>
                  )}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 mb-1">Keep it going!</p>
              <Link
                href="/dashboard/study-plan"
                className="text-xs font-medium px-3 py-1.5 rounded-lg transition-opacity hover:opacity-90"
                style={{ backgroundColor: '#9747FF', color: 'white' }}
              >
                View Study Plans
              </Link>
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Upcoming Tests */}
        <div className="rounded-xl p-5" style={{ backgroundColor: '#1A1A1A', border: '1px solid #2A2A2A' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white">Upcoming Tests</h2>
            <Link href="/dashboard/study-plan" className="text-xs text-purple-400 hover:text-purple-300">View all</Link>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[1, 2].map(i => <div key={i} className="h-14 rounded-lg animate-pulse" style={{ backgroundColor: '#2A2A2A' }} />)}
            </div>
          ) : upcomingPlans.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-2" style={{ backgroundColor: '#9747FF20' }}>📅</div>
              <p className="text-sm text-gray-400">No upcoming tests</p>
              <Link href="/dashboard/study-plan" className="text-xs text-purple-400 mt-2 hover:text-purple-300">Create a study plan</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingPlans.map(plan => {
                const days = plan.daysUntilTest ?? 0;
                const entries = plan.dayEntries ?? [];
                const done = completedCount(plan);
                const pct = entries.length > 0 ? Math.round((done / entries.length) * 100) : 0;
                return (
                  <Link key={plan.id} href={`/dashboard/study-plan/${plan.id}`} className="block rounded-lg p-3 hover:bg-white/5 transition-colors" style={{ border: '1px solid #2A2A2A' }}>
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-sm font-medium text-white truncate">{plan.title}</p>
                      <span className="text-xs font-semibold ml-2 shrink-0" style={{ color: daysColor(days) }}>
                        {days === 0 ? 'Today!' : `${days}d left`}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full" style={{ backgroundColor: '#2A2A2A' }}>
                      <div className="h-1.5 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: '#9747FF' }} />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{done}/{entries.length} days completed</p>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Today's Study Tasks */}
        <div className="rounded-xl p-5" style={{ backgroundColor: '#1A1A1A', border: '1px solid #2A2A2A' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white">Today&apos;s Study Tasks</h2>
            <span className="text-xs text-gray-500">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[1, 2].map(i => <div key={i} className="h-14 rounded-lg animate-pulse" style={{ backgroundColor: '#2A2A2A' }} />)}
            </div>
          ) : todayDays.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-2" style={{ backgroundColor: '#9747FF20' }}>✅</div>
              <p className="text-sm text-gray-400">No tasks scheduled for today</p>
              <p className="text-xs text-gray-600 mt-1">Tasks from your study plan will appear here</p>
            </div>
          ) : (
            <div className="space-y-2">
              {todayDays.map(day => (
                <div key={day.id} className="flex items-start gap-3 p-3 rounded-lg" style={{ border: '1px solid #2A2A2A', backgroundColor: day.completed ? '#9747FF10' : 'transparent' }}>
                  <div className="mt-0.5 w-4 h-4 rounded-full shrink-0 flex items-center justify-center" style={{ backgroundColor: day.completed ? '#9747FF' : '#2A2A2A' }}>
                    {day.completed && <span className="text-white text-xs">✓</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{day.title}</p>
                    <p className="text-xs text-gray-500 truncate">{(day as any).planTitle}</p>
                  </div>
                  {!day.completed && (
                    <Link href={`/dashboard/study-plan/${day.planId}`} className="text-xs text-purple-400 shrink-0 hover:text-purple-300">Start</Link>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Weak Topics */}
      {(weakSummary?.totalWeakTopics ?? 0) > 0 && (
        <div className="rounded-xl p-5" style={{ backgroundColor: '#1A1A1A', border: '1px solid #2A2A2A' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white">
              Weak Topics
              <span className="ml-2 px-1.5 py-0.5 rounded text-xs" style={{ backgroundColor: '#EF444420', color: '#EF4444' }}>
                {weakSummary?.totalWeakTopics} to review
              </span>
            </h2>
            <Link href="/dashboard/weak-topics" className="text-xs text-purple-400 hover:text-purple-300">View all</Link>
          </div>
          <div className="space-y-2">
            {topWeakTopics.map(wt => (
              <div key={wt.id} className="flex items-center gap-3 p-3 rounded-lg" style={{ border: '1px solid #2A2A2A' }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: '#EF444420' }}>
                  <span className="text-sm">⚠️</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{wt.topic}</p>
                  <p className="text-xs text-gray-500 truncate">{wt.document?.title ?? 'Unknown document'}</p>
                </div>
                <span className="text-xs text-gray-500 shrink-0">missed {wt.missedCount}×</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommended For You */}
      <div className="rounded-xl p-5" style={{ backgroundColor: '#1A1A1A', border: '1px solid #2A2A2A' }}>
        <h2 className="text-sm font-semibold text-white mb-4">Recommended For You</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { icon: '📅', title: 'Create a Study Plan', desc: 'Set a test date and get a day-by-day schedule', href: '/dashboard/study-plan' },
            { icon: '❓', title: 'Take a Quiz', desc: 'Test your knowledge and track weak topics', href: '/dashboard/quizzes' },
            { icon: '📋', title: 'Practice Exam', desc: 'Simulate the real exam experience', href: '/dashboard/practice-exams' },
          ].map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="p-4 rounded-lg hover:bg-white/5 transition-colors group"
              style={{ border: '1px solid #2A2A2A' }}
            >
              <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lg mb-2 group-hover:scale-110 transition-transform" style={{ backgroundColor: '#9747FF20' }}>
                {item.icon}
              </div>
              <p className="text-sm font-medium text-white">{item.title}</p>
              <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
