'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { streakApi, studyPlansApi, weakTopicsApi, StudyPlan, WeakTopic, StudyStreak } from '@/lib/api/studyPlan';
import { tasksApi, Task } from '@/lib/api/tasks';
import { api } from '@/lib/api';

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: string;
  color: string;
}

// ─── Calendar ───────────────────────────────────────────────────────────────

function MiniCalendar({
  plans,
  events,
  onAddEvent,
  onDeleteEvent,
}: {
  plans: StudyPlan[];
  events: CalendarEvent[];
  onAddEvent: (title: string, date: string, type: string) => Promise<void>;
  onDeleteEvent: (id: string) => Promise<void>;
}) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth()); // 0-indexed
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [addForm, setAddForm] = useState({ title: '', type: 'event' });
  const [adding, setAdding] = useState(false);

  const monthStart = new Date(viewYear, viewMonth, 1);
  const monthEnd = new Date(viewYear, viewMonth + 1, 0);
  const startPad = monthStart.getDay(); // 0=Sun
  const totalDays = monthEnd.getDate();

  function prevMonth() {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  }

  // Collect all events for this month
  const testDates = plans
    .filter(p => {
      const d = new Date(p.testDate);
      return d.getFullYear() === viewYear && d.getMonth() === viewMonth;
    })
    .map(p => ({ day: new Date(p.testDate).getDate(), label: p.title, color: '#EF4444', isTest: true }));

  const calEvents = events
    .filter(e => {
      const d = new Date(e.date);
      return d.getFullYear() === viewYear && d.getMonth() === viewMonth;
    })
    .map(e => ({ day: new Date(e.date).getDate(), label: e.title, color: e.color, isTest: false, id: e.id }));

  const dotsMap = new Map<number, { color: string; label: string; id?: string; isTest?: boolean }[]>();
  for (const t of testDates) {
    dotsMap.set(t.day, [...(dotsMap.get(t.day) ?? []), t]);
  }
  for (const e of calEvents) {
    dotsMap.set(e.day, [...(dotsMap.get(e.day) ?? []), e]);
  }

  const selectedDateStr = selectedDay
    ? `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`
    : null;
  const selectedEvents = selectedDay ? (dotsMap.get(selectedDay) ?? []) : [];

  async function handleAdd() {
    if (!addForm.title.trim() || !selectedDateStr) return;
    setAdding(true);
    await onAddEvent(addForm.title, selectedDateStr, addForm.type);
    setAddForm({ title: '', type: 'event' });
    setAdding(false);
  }

  const monthName = new Date(viewYear, viewMonth, 1).toLocaleString('default', { month: 'long' });

  return (
    <div className="rounded-xl p-5" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-[var(--text-1)]">Calendar</h2>
        <div className="flex items-center gap-2">
          <button onClick={prevMonth} className="text-[var(--text-2)] hover:text-[var(--text-1)] px-1">‹</button>
          <span className="text-xs text-[var(--text-1)] font-medium w-28 text-center">{monthName} {viewYear}</span>
          <button onClick={nextMonth} className="text-[var(--text-2)] hover:text-[var(--text-1)] px-1">›</button>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
          <div key={d} className="text-center text-xs text-[var(--text-3)] py-1">{d}</div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 gap-y-1">
        {Array.from({ length: startPad }).map((_, i) => <div key={`pad-${i}`} />)}
        {Array.from({ length: totalDays }).map((_, i) => {
          const day = i + 1;
          const isToday = day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();
          const dots = dotsMap.get(day) ?? [];
          const isSelected = selectedDay === day;
          return (
            <button
              key={day}
              onClick={() => setSelectedDay(d => d === day ? null : day)}
              className="flex flex-col items-center py-1 rounded-lg transition-colors hover:bg-black/5"
              style={isSelected ? { backgroundColor: 'var(--bg-input)' } : {}}
            >
              <span
                className="text-xs w-6 h-6 flex items-center justify-center rounded-full font-medium"
                style={isToday ? { backgroundColor: '#9747FF', color: 'white' } : { color: isSelected ? '#9747FF' : 'var(--text-2)' }}
              >
                {day}
              </span>
              <div className="flex gap-0.5 mt-0.5 h-1.5">
                {dots.slice(0, 3).map((d, idx) => (
                  <div key={idx} className="w-1 h-1 rounded-full" style={{ backgroundColor: d.color }} />
                ))}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected day panel */}
      {selectedDay !== null && (
        <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
          <p className="text-xs font-semibold text-[var(--text-1)] mb-2">
            {monthName} {selectedDay}, {viewYear}
          </p>
          {selectedEvents.length > 0 && (
            <div className="space-y-1.5 mb-3">
              {selectedEvents.map((e, i) => (
                <div key={i} className="flex items-center justify-between gap-2 text-xs px-2 py-1.5 rounded-lg" style={{ backgroundColor: 'var(--bg-input)' }}>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: e.color }} />
                    <span className="text-[var(--text-1)] truncate">{e.label}</span>
                    {e.isTest && <span className="text-[var(--text-2)]">(test)</span>}
                  </div>
                  {!e.isTest && e.id && (
                    <button
                      onClick={() => onDeleteEvent(e.id!)}
                      className="text-[var(--text-3)] hover:text-red-400 shrink-0"
                    >×</button>
                  )}
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <input
              value={addForm.title}
              onChange={e => setAddForm(f => ({ ...f, title: e.target.value }))}
              onKeyDown={e => { if (e.key === 'Enter') handleAdd(); }}
              placeholder="Add event…"
              className="flex-1 px-2.5 py-1.5 rounded-lg text-xs text-[var(--text-1)] placeholder-[var(--text-3)] outline-none"
              style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border)' }}
            />
            <select
              value={addForm.type}
              onChange={e => setAddForm(f => ({ ...f, type: e.target.value }))}
              className="px-2 py-1.5 rounded-lg text-xs text-[var(--text-1)] outline-none"
              style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border)' }}
            >
              <option value="event">Event</option>
              <option value="test">Test</option>
              <option value="deadline">Deadline</option>
            </select>
            <button
              onClick={handleAdd}
              disabled={!addForm.title.trim() || adding}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-white disabled:opacity-40"
              style={{ backgroundColor: '#9747FF' }}
            >
              +
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Tasks mini widget ───────────────────────────────────────────────────────

function TasksWidget({ tasks, loading }: { tasks: Task[]; loading: boolean }) {
  const incomplete = tasks.filter(t => !t.completed).slice(0, 5);
  return (
    <div className="rounded-xl p-5" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-[var(--text-1)]">Tasks</h2>
        <Link href="/dashboard/tasks" className="text-xs text-purple-400 hover:text-purple-300">View all</Link>
      </div>
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map(i => <div key={i} className="h-9 rounded-lg animate-pulse" style={{ backgroundColor: 'var(--bg-input)' }} />)}
        </div>
      ) : incomplete.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg mb-2" style={{ backgroundColor: 'var(--success-subtle)' }}>✅</div>
          <p className="text-sm text-[var(--text-2)]">All caught up!</p>
          <Link href="/dashboard/tasks" className="text-xs text-purple-400 mt-1 hover:text-purple-300">Add tasks</Link>
        </div>
      ) : (
        <div className="space-y-1.5">
          {incomplete.map(task => (
            <div key={task.id} className="flex items-center gap-2.5 px-3 py-2 rounded-lg" style={{ border: '1px solid var(--border)' }}>
              <div className="w-3.5 h-3.5 rounded-full shrink-0" style={{ border: '2px solid var(--brand-border)' }} />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-[var(--text-1)] truncate">{task.title}</p>
              </div>
              {task.estimatedMins > 0 && (
                <span className="text-xs text-[var(--text-3)] shrink-0">{task.estimatedMins}m</span>
              )}
            </div>
          ))}
          {tasks.filter(t => !t.completed).length > 5 && (
            <Link href="/dashboard/tasks" className="block text-center text-xs text-purple-400 pt-1 hover:text-purple-300">
              +{tasks.filter(t => !t.completed).length - 5} more
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { currentUser, dbUser, refreshSubscription } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [welcomeToast, setWelcomeToast] = useState(false);
  const displayName = dbUser?.name ?? currentUser?.displayName ?? currentUser?.email?.split('@')[0] ?? 'there';

  const [streak, setStreak] = useState<StudyStreak | null>(null);
  const [plans, setPlans] = useState<StudyPlan[]>([]);
  const [topWeakTopics, setTopWeakTopics] = useState<WeakTopic[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [tasksLoading, setTasksLoading] = useState(true);

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
    Promise.all([
      streakApi.get(),
      studyPlansApi.getAll(),
      weakTopicsApi.getAll(),
      api.get<CalendarEvent[]>('/calendar-events'),
    ]).then(([s, p, wt, ce]) => {
      if (s.data) setStreak(s.data);
      if (p.data) setPlans(p.data);
      if (wt.data) setTopWeakTopics(wt.data.slice(0, 3));
      if (ce.data) setCalendarEvents(ce.data);
    }).catch(() => {}).finally(() => setLoading(false));

    tasksApi.getAll({ completed: false }).then(({ data }) => {
      if (data) setTasks(data);
    }).catch(() => {}).finally(() => setTasksLoading(false));
  }, []);

  const addCalendarEvent = useCallback(async (title: string, date: string, type: string) => {
    const colorMap: Record<string, string> = { test: '#EF4444', deadline: '#F59E0B', event: '#9747FF' };
    const { data } = await api.post<CalendarEvent>('/calendar-events', { title, date, type, color: colorMap[type] ?? '#9747FF' });
    if (data) setCalendarEvents(prev => [...prev, data]);
  }, []);

  const deleteCalendarEvent = useCallback(async (id: string) => {
    await api.delete(`/calendar-events/${id}`);
    setCalendarEvents(prev => prev.filter(e => e.id !== id));
  }, []);

  function daysColor(days: number) {
    if (days <= 3) return '#EF4444';
    if (days <= 7) return '#F59E0B';
    return '#22C55E';
  }

  const upcomingPlans = plans
    .filter(p => p.daysUntilTest !== undefined && p.daysUntilTest >= 0)
    .sort((a, b) => (a.daysUntilTest ?? 0) - (b.daysUntilTest ?? 0))
    .slice(0, 3);

  return (
    <div className="max-w-5xl mx-auto py-2 space-y-6">
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
        <h1 className="text-2xl font-bold text-[var(--text-1)]">Welcome back, {displayName}</h1>
        <p className="text-[var(--text-2)] mt-1 text-sm">Here&apos;s what&apos;s happening with your studies.</p>
      </div>

      {/* Streak Banner */}
      <div className="rounded-xl p-5 flex items-center justify-between" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        {loading ? (
          <div className="h-8 w-48 rounded-lg animate-pulse" style={{ backgroundColor: 'var(--bg-input)' }} />
        ) : (
          <>
            <div className="flex items-center gap-4">
              <span className="text-4xl">🔥</span>
              <div>
                <p className="text-3xl font-bold text-[var(--text-1)]">{streak?.currentStreak ?? 0}
                  <span className="text-base font-normal text-[var(--text-2)] ml-1">day streak</span>
                </p>
                <p className="text-xs text-[var(--text-2)] mt-0.5">
                  Personal best: <span className="text-[var(--text-1)]">{streak?.longestStreak ?? 0} days</span>
                  {streak?.lastStudyDate && (
                    <span className="ml-3">Last studied: {new Date(streak.lastStudyDate).toLocaleDateString()}</span>
                  )}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-[var(--text-2)] mb-1">Keep it going!</p>
              <Link
                href="/dashboard/study-plan"
                className="text-xs font-medium px-3 py-1.5 rounded-lg transition-opacity hover:opacity-90"
                style={{ backgroundColor: '#9747FF', color: 'white' }}
              >
                Study Plans
              </Link>
            </div>
          </>
        )}
      </div>

      {/* Calendar + Tasks row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <>
            <div className="h-80 rounded-xl animate-pulse" style={{ backgroundColor: 'var(--bg-card)' }} />
            <div className="h-80 rounded-xl animate-pulse" style={{ backgroundColor: 'var(--bg-card)' }} />
          </>
        ) : (
          <>
            <MiniCalendar
              plans={plans}
              events={calendarEvents}
              onAddEvent={addCalendarEvent}
              onDeleteEvent={deleteCalendarEvent}
            />
            <TasksWidget tasks={tasks} loading={tasksLoading} />
          </>
        )}
      </div>

      {/* Upcoming Tests */}
      {upcomingPlans.length > 0 && (
        <div className="rounded-xl p-5" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-[var(--text-1)]">Upcoming Tests</h2>
            <Link href="/dashboard/study-plan" className="text-xs text-purple-400 hover:text-purple-300">View all</Link>
          </div>
          <div className="space-y-3">
            {upcomingPlans.map(plan => {
              const days = plan.daysUntilTest ?? 0;
              const entries = plan.dayEntries ?? [];
              const done = entries.filter(d => d.completed).length;
              const pct = entries.length > 0 ? Math.round((done / entries.length) * 100) : 0;
              return (
                <Link key={plan.id} href={`/dashboard/study-plan/${plan.id}`} className="block rounded-lg p-3 hover:bg-black/5 transition-colors" style={{ border: '1px solid var(--border)' }}>
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-sm font-medium text-[var(--text-1)] truncate">{plan.title}</p>
                    <span className="text-xs font-semibold ml-2 shrink-0" style={{ color: daysColor(days) }}>
                      {days === 0 ? 'Today!' : `${days}d left`}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full" style={{ backgroundColor: 'var(--border)' }}>
                    <div className="h-1.5 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: '#9747FF' }} />
                  </div>
                  <p className="text-xs text-[var(--text-2)] mt-1">{done}/{entries.length} days completed</p>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Weak Topics */}
      {topWeakTopics.length > 0 && (
        <div className="rounded-xl p-5" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-[var(--text-1)]">
              Weak Topics
              <span className="ml-2 px-1.5 py-0.5 rounded text-xs" style={{ backgroundColor: 'var(--danger-subtle)', color: '#EF4444' }}>
                review
              </span>
            </h2>
            <Link href="/dashboard/weak-topics" className="text-xs text-purple-400 hover:text-purple-300">View all</Link>
          </div>
          <div className="space-y-2">
            {topWeakTopics.map(wt => (
              <div key={wt.id} className="p-3 rounded-lg" style={{ border: '1px solid var(--border)' }}>
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: 'var(--danger-subtle)' }}>
                    <span className="text-sm">⚠️</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[var(--text-1)] truncate">{wt.topic}</p>
                    {wt.correctAnswer && (
                      <p className="text-xs mt-0.5 px-1.5 py-0.5 rounded inline-block" style={{ backgroundColor: 'var(--success-subtle)', color: '#22C55E' }}>
                        ✓ {wt.correctAnswer}
                      </p>
                    )}
                    <p className="text-xs text-[var(--text-2)] mt-0.5">{wt.document?.title ?? 'Unknown document'} · missed {wt.missedCount}×</p>
                  </div>
                </div>
              </div>
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
    </div>
  );
}
