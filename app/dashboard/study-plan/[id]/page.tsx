'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { studyPlansApi, StudyPlan, StudyPlanDay } from '@/lib/api/studyPlan';
import { ArrowLeft, ChevronLeft, ChevronRight, CalendarDays, List, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import PageShell from '@/components/dashboard/PageShell';
import { cn } from '@/lib/utils';

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
      <PageShell width="lg" center>
        <div className="mb-4 h-8 w-64 animate-pulse rounded-lg bg-[var(--bg-card)]" />
        <div className="h-96 animate-pulse rounded-xl bg-[var(--bg-card)]" />
      </PageShell>
    );
  }

  if (!plan) {
    return (
      <PageShell width="lg" center className="py-20 text-center">
        <p className="text-body-sm text-[var(--text-2)]">Plan not found.</p>
      </PageShell>
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
    <PageShell width="lg" center>
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="link"
          size="link"
          className="mb-3 text-xs"
          onClick={() => router.push('/dashboard/study-plan')}
        >
          <ArrowLeft size={12} />
          Back to plans
        </Button>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="truncate text-heading-sm md:text-heading text-[var(--text-1)]">{plan.title}</h1>
            <p className="mt-0.5 text-body-sm text-[var(--text-2)]">
              Test date: {new Date(plan.testDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              {days >= 0 && <span className="ml-2 font-medium" style={{ color: days <= 3 ? 'var(--danger-ink)' : days <= 7 ? 'var(--warning-ink)' : 'var(--success-ink)' }}>({days === 0 ? 'Today!' : `${days} days left`})</span>}
            </p>
          </div>
          <Button variant="danger" size="xs" className="shrink-0" onClick={handleDelete}>
            Delete Plan
          </Button>
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
            aria-selected={view === v}
            className={cn(
              'flex items-center gap-1.5 rounded-md px-4 py-1.5 text-body-sm font-medium capitalize transition-colors',
              view === v
                ? 'bg-[var(--bg-card)] text-[var(--text-1)] shadow-[var(--shadow-card)]'
                : 'text-[var(--text-3)] hover:text-[var(--text-1)]'
            )}
          >
            {v === 'calendar' ? <><CalendarDays size={13} />Calendar</> : <><List size={13} />List</>}
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
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Previous month"
                  onClick={() => setCalMonth(m => new Date(m.getFullYear(), m.getMonth() - 1, 1))}
                >
                  <ChevronLeft size={16} />
                </Button>
                <span className="text-body-sm font-semibold text-[var(--text-1)]">{MONTHS[month]} {year}</span>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Next month"
                  onClick={() => setCalMonth(m => new Date(m.getFullYear(), m.getMonth() + 1, 1))}
                >
                  <ChevronRight size={16} />
                </Button>
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
                      className={`relative aspect-square rounded-lg flex flex-col items-center justify-center text-xs transition-colors ${entry ? 'cursor-pointer hover:bg-[var(--bg-hover)]' : 'cursor-default'}`}
                      style={{
                        backgroundColor: isSelected ? 'var(--brand)' : isToday ? 'var(--bg-input)' : 'transparent',
                        color: isSelected ? 'white' : entry ? 'var(--text-1)' : 'var(--text-3)',
                      }}
                    >
                      {dayNum}
                      {entry && (
                        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full" style={{ backgroundColor: entry.completed ? 'var(--success-ink)' : isSelected ? 'white' : 'var(--brand)' }} />
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
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--success)' }} /> Completed
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
                      style={{ backgroundColor: day.completed ? 'var(--success-subtle)' : 'var(--bg-input)', color: day.completed ? 'var(--success-ink)' : 'var(--brand-ink)' }}
                    >
                      {day.dayNumber}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--text-1)] truncate">{day.title}</p>
                      <p className="text-xs text-[var(--text-2)]">{new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                    </div>
                    {day.completed && (
                      <span className="flex shrink-0 items-center gap-1 text-xs text-[var(--success-ink)]">
                        <Check size={12} />Done
                      </span>
                    )}
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
                  <h3 className="text-body-lg font-semibold text-[var(--text-1)]">{selectedDay.title}</h3>
                </div>
                <Button
                  variant={selectedDay.completed ? 'success' : 'primary'}
                  size="xs"
                  className="shrink-0"
                  onClick={() => toggleDay(selectedDay)}
                  disabled={toggling === selectedDay.id}
                >
                  {toggling === selectedDay.id
                    ? '…'
                    : selectedDay.completed
                      ? <><Check size={12} />Completed</>
                      : 'Mark Complete'}
                </Button>
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
    </PageShell>
  );
}
