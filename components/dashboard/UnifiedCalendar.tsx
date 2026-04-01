'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { studyPlansApi, StudyPlan, StudyPlanDay } from '@/lib/api/studyPlan';
import { tasksApi, Task } from '@/lib/api/tasks';
import { api } from '@/lib/api';

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: string;
  color: string;
}

interface DayData {
  studyDays: { plan: StudyPlan; day: StudyPlanDay }[];
  tasks: Task[];
  events: CalendarEvent[];
}

const DAY_HEADERS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function toDateStr(iso: string): string {
  // Handles both "2025-03-15" and "2025-03-15T00:00:00.000Z"
  return iso.slice(0, 10);
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

// ── Collapsible section ───────────────────────────────────────────────────────

function Section({
  title, count, children, defaultOpen = true,
}: {
  title: string; count: number; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2 py-2 text-left group"
      >
        <svg
          width="10" height="10" viewBox="0 0 10 10" fill="none"
          className="shrink-0 transition-transform duration-150"
          style={{ color: 'var(--text-3)', transform: open ? 'rotate(0deg)' : 'rotate(-90deg)' }}
        >
          <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-3)' }}>
          {title}
        </span>
        {count > 0 && (
          <span
            className="ml-1 text-[10px] font-medium px-1.5 rounded leading-4"
            style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-3)' }}
          >
            {count}
          </span>
        )}
      </button>
      {open && <div className="pb-3">{children}</div>}
    </div>
  );
}

// ── Study plan day row ────────────────────────────────────────────────────────

function StudyDayRow({
  plan, day, onToggle,
}: {
  plan: StudyPlan;
  day: StudyPlanDay;
  onToggle: (planId: string, dayId: string, completed: boolean) => void;
}) {
  const topics: string[] = (() => {
    try { return JSON.parse(day.topics); } catch { return []; }
  })();

  return (
    <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-lg mb-1.5" style={{ backgroundColor: 'var(--bg-page)', border: '1px solid var(--border)' }}>
      <button
        onClick={() => onToggle(plan.id, day.id, day.completed)}
        className="mt-0.5 w-4 h-4 rounded flex items-center justify-center shrink-0 transition-colors"
        style={{
          backgroundColor: day.completed ? '#9747FF' : 'transparent',
          border: day.completed ? 'none' : '2px solid var(--border-md)',
        }}
      >
        {day.completed && (
          <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
            <path d="M1.5 4.5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>
      <div className="flex-1 min-w-0">
        <p className={`text-xs font-medium ${day.completed ? 'line-through' : ''}`} style={{ color: day.completed ? 'var(--text-3)' : 'var(--text-1)' }}>
          {day.title}
        </p>
        <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-3)' }}>
          {plan.title} · Day {day.dayNumber}
        </p>
        {topics.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {topics.slice(0, 3).map((t, i) => (
              <span key={i} className="text-[10px] px-1.5 py-0.5 rounded-md" style={{ backgroundColor: 'var(--brand-subtle)', color: '#9747FF' }}>
                {t}
              </span>
            ))}
            {topics.length > 3 && (
              <span className="text-[10px]" style={{ color: 'var(--text-3)' }}>+{topics.length - 3} more</span>
            )}
          </div>
        )}
      </div>
      <Link
        href={`/dashboard/study-plan/${plan.id}`}
        className="text-[10px] shrink-0 mt-0.5 hover:underline"
        style={{ color: '#9747FF' }}
        onClick={e => e.stopPropagation()}
      >
        View
      </Link>
    </div>
  );
}

// ── Task row ──────────────────────────────────────────────────────────────────

function TaskRow({
  task, onToggle,
}: {
  task: Task;
  onToggle: (id: string, completed: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg mb-1.5" style={{ backgroundColor: 'var(--bg-page)', border: '1px solid var(--border)' }}>
      <button
        onClick={() => onToggle(task.id, task.completed)}
        className="w-4 h-4 rounded flex items-center justify-center shrink-0 transition-colors"
        style={{
          backgroundColor: task.completed ? '#16a34a' : 'transparent',
          border: task.completed ? 'none' : '2px solid var(--border-md)',
        }}
      >
        {task.completed && (
          <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
            <path d="M1.5 4.5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>
      <p className={`text-xs flex-1 min-w-0 truncate ${task.completed ? 'line-through' : ''}`} style={{ color: task.completed ? 'var(--text-3)' : 'var(--text-1)' }}>
        {task.title}
      </p>
      {task.estimatedMins > 0 && (
        <span className="text-[10px] shrink-0" style={{ color: 'var(--text-3)' }}>{task.estimatedMins}m</span>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function UnifiedCalendar() {
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [selectedDate, setSelectedDate] = useState(todayStr());

  const [plans, setPlans] = useState<StudyPlan[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Add event form
  const [addForm, setAddForm] = useState({ title: '', type: 'event' });
  const [adding, setAdding] = useState(false);

  const fetchAll = useCallback(async () => {
    const [p, t, e] = await Promise.all([
      studyPlansApi.getAll(),
      tasksApi.getAll(),
      api.get<CalendarEvent[]>('/calendar-events'),
    ]).catch(() => [{ data: null }, { data: null }, { data: null }]) as any;
    if (p?.data) setPlans(p.data);
    if (t?.data) setTasks(t.data);
    if (e?.data) setEvents(e.data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Calendar grid helpers ─────────────────────────────────────────────────

  const monthStart = new Date(viewYear, viewMonth, 1);
  const totalDays = new Date(viewYear, viewMonth + 1, 0).getDate();
  const startPad = monthStart.getDay();
  const monthName = new Date(viewYear, viewMonth, 1).toLocaleString('default', { month: 'long' });
  const today = todayStr();

  function prevMonth() {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  }

  function cellDateStr(day: number): string {
    return `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  // Build indicator maps for dots
  const studyDayDates = new Set<string>();
  for (const plan of plans) {
    for (const day of plan.dayEntries ?? []) {
      studyDayDates.add(toDateStr(day.date));
    }
  }

  const taskDueDates = new Set<string>();
  for (const task of tasks) {
    if (task.dueDate && !task.completed) taskDueDates.add(toDateStr(task.dueDate));
  }

  const eventDateMap = new Map<string, string>(); // date → first event color
  for (const ev of events) {
    const ds = toDateStr(ev.date);
    if (!eventDateMap.has(ds)) eventDateMap.set(ds, ev.color);
  }

  const testDateMap = new Map<string, string>(); // date → plan title
  for (const plan of plans) {
    testDateMap.set(toDateStr(plan.testDate), plan.title);
  }

  // ── Day detail data ───────────────────────────────────────────────────────

  const dayData: DayData = {
    studyDays: plans.flatMap(plan =>
      (plan.dayEntries ?? [])
        .filter(day => toDateStr(day.date) === selectedDate)
        .map(day => ({ plan, day }))
    ),
    tasks: tasks.filter(t => t.dueDate && toDateStr(t.dueDate) === selectedDate),
    events: events.filter(e => toDateStr(e.date) === selectedDate),
  };

  const selectedDisplay = new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  });
  const isToday = selectedDate === today;

  // ── Interaction handlers ──────────────────────────────────────────────────

  async function toggleStudyDay(planId: string, dayId: string, completed: boolean) {
    // Optimistic update
    setPlans(prev => prev.map(p =>
      p.id === planId
        ? { ...p, dayEntries: (p.dayEntries ?? []).map(d => d.id === dayId ? { ...d, completed: !completed } : d) }
        : p
    ));
    try {
      if (completed) await studyPlansApi.incompleteDay(planId, dayId);
      else await studyPlansApi.completeDay(planId, dayId);
    } catch {
      // Revert
      setPlans(prev => prev.map(p =>
        p.id === planId
          ? { ...p, dayEntries: (p.dayEntries ?? []).map(d => d.id === dayId ? { ...d, completed } : d) }
          : p
      ));
    }
  }

  async function toggleTask(taskId: string, completed: boolean) {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed: !completed } : t));
    try {
      await tasksApi.update(taskId, { completed: !completed });
    } catch {
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed } : t));
    }
  }

  async function addEvent() {
    if (!addForm.title.trim()) return;
    setAdding(true);
    const colorMap: Record<string, string> = { test: '#EF4444', deadline: '#F59E0B', event: '#9747FF' };
    const { data } = await api.post<CalendarEvent>('/calendar-events', {
      title: addForm.title,
      date: selectedDate,
      type: addForm.type,
      color: colorMap[addForm.type] ?? '#9747FF',
    });
    if (data) setEvents(prev => [...prev, data]);
    setAddForm({ title: '', type: 'event' });
    setAdding(false);
  }

  async function deleteEvent(id: string) {
    await api.delete(`/calendar-events/${id}`);
    setEvents(prev => prev.filter(e => e.id !== id));
  }

  const totalDayItems = dayData.studyDays.length + dayData.tasks.length + dayData.events.length;

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
    >
      <div className="flex min-h-[320px]">

        {/* ── Left: calendar grid ─────────────────────────────────────────── */}
        <div
          className="shrink-0 p-4"
          style={{ width: 268, borderRight: '1px solid var(--border)' }}
        >
          {/* Month nav */}
          <div className="flex items-center justify-between mb-3">
            <button onClick={prevMonth} className="w-6 h-6 flex items-center justify-center rounded hover:bg-[var(--bg-hover)] transition-colors" style={{ color: 'var(--text-2)' }}>‹</button>
            <span className="text-xs font-semibold" style={{ color: 'var(--text-1)' }}>{monthName} {viewYear}</span>
            <button onClick={nextMonth} className="w-6 h-6 flex items-center justify-center rounded hover:bg-[var(--bg-hover)] transition-colors" style={{ color: 'var(--text-2)' }}>›</button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-1">
            {DAY_HEADERS.map(d => (
              <div key={d} className="text-center text-[10px] py-0.5" style={{ color: 'var(--text-3)' }}>{d}</div>
            ))}
          </div>

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-7 gap-y-1">
              {Array.from({ length: 35 }).map((_, i) => (
                <div key={i} className="h-7 rounded animate-pulse" style={{ backgroundColor: 'var(--bg-input)' }} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-y-0.5">
              {Array.from({ length: startPad }).map((_, i) => <div key={`p${i}`} />)}
              {Array.from({ length: totalDays }).map((_, i) => {
                const day = i + 1;
                const ds = cellDateStr(day);
                const isSelected = ds === selectedDate;
                const isTodayCell = ds === today;
                const hasStudy = studyDayDates.has(ds);
                const hasTask = taskDueDates.has(ds);
                const hasEvent = eventDateMap.has(ds);
                const isTestDate = testDateMap.has(ds);

                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDate(ds)}
                    className="flex flex-col items-center py-0.5 rounded-lg transition-colors hover:bg-[var(--bg-hover)]"
                    style={isSelected ? { backgroundColor: '#9747FF' } : {}}
                  >
                    <span
                      className="text-xs w-6 h-6 flex items-center justify-center rounded-full font-medium"
                      style={
                        isSelected
                          ? { color: '#fff' }
                          : isTodayCell
                          ? { color: '#9747FF', fontWeight: 700 }
                          : { color: 'var(--text-2)' }
                      }
                    >
                      {day}
                    </span>
                    {/* Dots */}
                    <div className="flex gap-0.5 h-1.5 items-center mt-0.5">
                      {hasStudy && <div className="w-1 h-1 rounded-full" style={{ backgroundColor: isSelected ? 'rgba(255,255,255,0.7)' : '#22c55e' }} />}
                      {hasTask && <div className="w-1 h-1 rounded-full" style={{ backgroundColor: isSelected ? 'rgba(255,255,255,0.7)' : '#9747FF' }} />}
                      {hasEvent && !isTestDate && <div className="w-1 h-1 rounded-full" style={{ backgroundColor: isSelected ? 'rgba(255,255,255,0.7)' : (eventDateMap.get(ds) ?? '#9747FF') }} />}
                      {isTestDate && <div className="w-1 h-1 rounded-full" style={{ backgroundColor: isSelected ? 'rgba(255,255,255,0.7)' : '#ef4444' }} />}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Dot legend */}
          <div className="flex items-center gap-3 mt-3 pt-3 flex-wrap" style={{ borderTop: '1px solid var(--border)' }}>
            {[
              { color: '#22c55e', label: 'Study' },
              { color: '#9747FF', label: 'Task' },
              { color: '#ef4444', label: 'Test' },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-[10px]" style={{ color: 'var(--text-3)' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right: day detail ──────────────────────────────────────────── */}
        <div className="flex-1 p-4 overflow-y-auto min-w-0">
          {/* Date header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>{selectedDisplay}</p>
              {isToday && <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ backgroundColor: 'var(--brand-subtle)', color: '#9747FF' }}>Today</span>}
            </div>
            {totalDayItems === 0 && !loading && (
              <span className="text-xs" style={{ color: 'var(--text-3)' }}>Nothing scheduled</span>
            )}
          </div>

          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => <div key={i} className="h-10 rounded-lg animate-pulse" style={{ backgroundColor: 'var(--bg-input)' }} />)}
            </div>
          ) : (
            <div className="space-y-1">

              {/* Study Plan days */}
              {dayData.studyDays.length > 0 && (
                <Section title="Study Plan" count={dayData.studyDays.length}>
                  {dayData.studyDays.map(({ plan, day }) => (
                    <StudyDayRow key={day.id} plan={plan} day={day} onToggle={toggleStudyDay} />
                  ))}
                </Section>
              )}

              {/* Tasks */}
              {dayData.tasks.length > 0 && (
                <Section title="Tasks" count={dayData.tasks.length}>
                  {dayData.tasks.map(task => (
                    <TaskRow key={task.id} task={task} onToggle={toggleTask} />
                  ))}
                </Section>
              )}

              {/* Calendar events */}
              {dayData.events.length > 0 && (
                <Section title="Events" count={dayData.events.length} defaultOpen={true}>
                  <div className="space-y-1.5">
                    {dayData.events.map(ev => (
                      <div key={ev.id} className="flex items-center gap-2.5 px-3 py-2 rounded-lg" style={{ backgroundColor: 'var(--bg-page)', border: '1px solid var(--border)' }}>
                        <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: ev.color }} />
                        <span className="text-xs flex-1 truncate" style={{ color: 'var(--text-1)' }}>{ev.title}</span>
                        <span className="text-[10px] shrink-0" style={{ color: 'var(--text-3)' }}>{ev.type}</span>
                        <button onClick={() => deleteEvent(ev.id)} className="text-[var(--text-3)] hover:text-red-400 shrink-0 text-sm leading-none">×</button>
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              {/* Add event */}
              <div className="pt-2 mt-2" style={{ borderTop: totalDayItems > 0 ? '1px solid var(--border)' : 'none' }}>
                <p className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-3)' }}>Add Event</p>
                <div className="flex gap-2">
                  <input
                    value={addForm.title}
                    onChange={e => setAddForm(f => ({ ...f, title: e.target.value }))}
                    onKeyDown={e => { if (e.key === 'Enter') addEvent(); }}
                    placeholder="Event name…"
                    className="flex-1 px-2.5 py-1.5 rounded-lg text-xs text-[var(--text-1)] placeholder-[var(--text-3)] outline-none min-w-0"
                    style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border)' }}
                  />
                  <select
                    value={addForm.type}
                    onChange={e => setAddForm(f => ({ ...f, type: e.target.value }))}
                    className="px-2 py-1.5 rounded-lg text-xs text-[var(--text-1)] outline-none shrink-0"
                    style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border)' }}
                  >
                    <option value="event">Event</option>
                    <option value="test">Test</option>
                    <option value="deadline">Deadline</option>
                  </select>
                  <button
                    onClick={addEvent}
                    disabled={!addForm.title.trim() || adding}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-white disabled:opacity-40 shrink-0"
                    style={{ backgroundColor: '#9747FF' }}
                  >
                    +
                  </button>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
