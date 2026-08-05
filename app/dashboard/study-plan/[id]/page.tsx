'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { studyPlansApi, StudyPlan, StudyPlanDay } from '@/lib/api/studyPlan';

type ViewMode = 'calendar' | 'list';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS_OF_WEEK = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

export default function StudyPlanDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [plan, setPlan] = useState<StudyPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ViewMode>('calendar');
  const [selectedDay, setSelectedDay] = useState<StudyPlanDay | null>(null);
  const [calMonth, setCalMonth] = useState(new Date());
  const [toggling, setToggling] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const { data: p } = await studyPlansApi.getById(id);
      if (!p) return;
      setPlan(p);
      // Default selected day to today's entry or first incomplete
      const todayStr = new Date().toISOString().split('T')[0];
      const todayEntry = p.dayEntries?.find(d => d.date.startsWith(todayStr));
      const firstIncomplete = p.dayEntries?.find(d => !d.completed);
      setSelectedDay(todayEntry ?? firstIncomplete ?? p.dayEntries?.[0] ?? null);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  async function toggleDay(day: StudyPlanDay) {
    if (!plan) return;
    setToggling(day.id);
    try {
      const res = day.completed
        ? await studyPlansApi.incompleteDay(plan.id, day.id)
        : await studyPlansApi.completeDay(plan.id, day.id);
      const updated = res.data;
      if (!updated) return;
      setPlan(p => p ? { ...p, dayEntries: p.dayEntries?.map(d => d.id === updated.id ? updated : d) } : p);
      if (selectedDay?.id === day.id) setSelectedDay(updated);
    } catch {
      // ignore
    } finally {
      setToggling(null);
    }
  }

  async function handleDelete() {
    if (!plan) return;
    await studyPlansApi.delete(plan.id).catch(() => {});
    router.push('/dashboard/study-plan');
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-2">
        <div className="h-8 w-64 rounded-lg animate-pulse mb-4" style={{ backgroundColor: 'var(--bg-card)' }} />
        <div className="h-96 rounded-xl animate-pulse" style={{ backgroundColor: 'var(--bg-card)' }} />
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="max-w-4xl mx-auto py-2 text-center py-20">
        <p className="text-[var(--text-2)]">Plan not found.</p>
      </div>
    );
  }

  const entries = plan.dayEntries ?? [];
  const done = entries.filter(d => d.completed).length;
  const pct = entries.length > 0 ? Math.round((done / entries.length) * 100) : 0;
  const days = plan.daysUntilTest ?? 0;

  // Build date map for calendar
  const dateMap = new Map<string, StudyPlanDay>();
  entries.forEach(d => dateMap.set(d.date.split('T')[0], d));

  // Calendar helpers
  const year = calMonth.getFullYear();
  const month = calMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  function parsedTopics(day: StudyPlanDay): string[] {
    try { return JSON.parse(day.topics); } catch { return [day.topics]; }
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-6">
      {/* Header */}
      <div className="mb-6">
        <button onClick={() => router.push('/dashboard/study-plan')} className="text-xs text-[var(--text-2)] hover:text-[var(--text-1)] mb-3 flex items-center gap-1">
          ← Back to plans
        </button>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-[var(--text-1)] truncate">{plan.title}</h1>
            <p className="text-[var(--text-2)] text-sm mt-0.5">
              Test date: {new Date(plan.testDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              {days >= 0 && <span className="ml-2 font-medium" style={{ color: days <= 3 ? '#EF4444' : days <= 7 ? '#F59E0B' : '#22C55E' }}>({days === 0 ? 'Today!' : `${days} days left`})</span>}
            </p>
          </div>
          <button
            onClick={handleDelete}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 hover:bg-black/5"
            style={{ color: '#EF4444', border: '1px solid var(--danger-border)' }}
          >
            Delete Plan
          </button>
        </div>

        {/* Progress */}
        <div className="mt-4 p-4 rounded-xl" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[var(--text-2)]">{done} of {entries.length} days completed</span>
            <span className="text-sm font-semibold text-[var(--text-1)]">{pct}%</span>
          </div>
          <div className="h-2 rounded-full" style={{ backgroundColor: 'var(--border)' }}>
            <div className="h-2 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: 'var(--brand)' }} />
          </div>
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex gap-1 mb-5 p-1 rounded-lg w-fit" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        {(['calendar', 'list'] as const).map(v => (
          <button
            key={v}
            onClick={() => setView(v)}
            className="px-4 py-1.5 rounded-md text-sm font-medium transition-colors capitalize"
            style={view === v ? { backgroundColor: 'var(--brand)', color: 'white' } : { color: 'var(--text-2)' }}
          >
            {v === 'calendar' ? '📅 Calendar' : '📋 List'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
        {/* Left: Calendar or List */}
        <div className="md:col-span-3">
          {view === 'calendar' ? (
            <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              {/* Month nav */}
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => setCalMonth(m => new Date(m.getFullYear(), m.getMonth() - 1, 1))}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-2)] hover:text-[var(--text-1)] hover:bg-black/5 transition-colors"
                >
                  ‹
                </button>
                <span className="text-sm font-semibold text-[var(--text-1)]">{MONTHS[month]} {year}</span>
                <button
                  onClick={() => setCalMonth(m => new Date(m.getFullYear(), m.getMonth() + 1, 1))}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-2)] hover:text-[var(--text-1)] hover:bg-black/5 transition-colors"
                >
                  ›
                </button>
              </div>

              {/* Day headers */}
              <div className="grid grid-cols-7 mb-1">
                {DAYS_OF_WEEK.map(d => (
                  <div key={d} className="text-center text-xs text-[var(--text-3)] py-1">{d}</div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-0.5">
                {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const dayNum = i + 1;
                  const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                  const entry = dateMap.get(dateStr);
                  const isToday = dateStr === new Date().toISOString().split('T')[0];
                  const isSelected = selectedDay?.date.startsWith(dateStr);

                  return (
                    <button
                      key={dayNum}
                      onClick={() => entry && setSelectedDay(entry)}
                      className={`relative aspect-square rounded-lg flex flex-col items-center justify-center text-xs transition-colors ${entry ? 'cursor-pointer hover:bg-black/8' : 'cursor-default'}`}
                      style={{
                        backgroundColor: isSelected ? 'var(--brand)' : isToday ? 'var(--bg-input)' : 'transparent',
                        color: isSelected ? 'white' : entry ? 'var(--text-1)' : 'var(--text-3)',
                      }}
                    >
                      {dayNum}
                      {entry && (
                        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full" style={{ backgroundColor: entry.completed ? '#22C55E' : isSelected ? 'white' : 'var(--brand)' }} />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex items-center gap-4 mt-3 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
                <div className="flex items-center gap-1.5 text-xs text-[var(--text-2)]">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--brand)' }} /> Scheduled
                </div>
                <div className="flex items-center gap-1.5 text-xs text-[var(--text-2)]">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#22C55E' }} /> Completed
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {entries.map(day => (
                <button
                  key={day.id}
                  onClick={() => setSelectedDay(day)}
                  className="w-full text-left p-4 rounded-xl transition-colors"
                  style={{
                    backgroundColor: selectedDay?.id === day.id ? 'var(--brand-subtle)' : 'var(--bg-card)',
                    border: `1px solid ${selectedDay?.id === day.id ? 'var(--brand-border)' : 'var(--border)'}`,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold"
                      style={{ backgroundColor: day.completed ? 'var(--success-subtle)' : 'var(--bg-input)', color: day.completed ? '#22C55E' : 'var(--brand)' }}
                    >
                      {day.dayNumber}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--text-1)] truncate">{day.title}</p>
                      <p className="text-xs text-[var(--text-2)]">{new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                    </div>
                    {day.completed && <span className="text-xs text-green-400 shrink-0">✓ Done</span>}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Day Detail */}
        <div className="md:col-span-2">
          {selectedDay ? (
            <div className="rounded-xl p-4 sticky top-4" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <p className="text-xs text-[var(--text-2)] mb-0.5">
                    Day {selectedDay.dayNumber} · {new Date(selectedDay.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                  </p>
                  <h3 className="text-base font-semibold text-[var(--text-1)]">{selectedDay.title}</h3>
                </div>
                <button
                  onClick={() => toggleDay(selectedDay)}
                  disabled={toggling === selectedDay.id}
                  className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
                  style={selectedDay.completed
                    ? { backgroundColor: 'var(--success-subtle)', color: '#22C55E', border: '1px solid var(--success-border)' }
                    : { backgroundColor: 'var(--brand)', color: 'white' }
                  }
                >
                  {toggling === selectedDay.id ? '...' : selectedDay.completed ? '✓ Completed' : 'Mark Complete'}
                </button>
              </div>

              {selectedDay.completedAt && (
                <p className="text-xs text-[var(--text-2)] mb-3">Completed on {new Date(selectedDay.completedAt).toLocaleDateString()}</p>
              )}

              <div>
                <p className="text-xs font-medium text-[var(--text-2)] mb-2">Topics to cover:</p>
                <div className="space-y-1.5">
                  {parsedTopics(selectedDay).map((topic, i) => (
                    <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border)' }}>
                      <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: 'var(--brand)' }} />
                      <span className="text-sm text-[var(--text-1)]">{topic}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl p-4 flex flex-col items-center justify-center py-12 text-center" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <p className="text-sm text-[var(--text-2)]">Select a day to see details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
