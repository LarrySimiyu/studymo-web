'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { studyPlansApi, StudyPlan, StudyPlanDay } from '@/lib/api/studyPlan';
import { api } from '@/lib/api';
import { CalendarDays, ChevronDown, ChevronUp, Check, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Document { id: string; title: string }

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

function daysColor(days: number) {
  if (days <= 3) return '#EF4444';
  if (days <= 7) return '#F59E0B';
  return '#22C55E';
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function parsedTopics(day: StudyPlanDay): string[] {
  try { return JSON.parse(day.topics); } catch { return [day.topics]; }
}

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DOW = ['Su','Mo','Tu','We','Th','Fr','Sa'];

// ── Three-dot menu ────────────────────────────────────────────────────────────
function PlanMenu({ onDelete }: { onDelete: () => void }) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function enter() { if (closeTimer.current) clearTimeout(closeTimer.current); setOpen(true); }
  function leave() { closeTimer.current = setTimeout(() => setOpen(false), 150); }

  return (
    <div className="relative shrink-0" onMouseEnter={enter} onMouseLeave={leave}>
      <button
        className="p-1.5 rounded-lg transition-colors"
        style={{ color: 'var(--text-3)' }}
        onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-1)')}
        onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-3)')}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 rounded-xl shadow-xl py-1 min-w-[130px]" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <button
            onClick={() => { setOpen(false); onDelete(); }}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors"
            style={{ backgroundColor: 'transparent', color: '#f87171' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
            </svg>
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

// ── Mini calendar ─────────────────────────────────────────────────────────────
function MiniCalendar({ entries }: { entries: StudyPlanDay[] }) {
  const [calMonth, setCalMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const year = calMonth.getFullYear();
  const month = calMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayStr = new Date().toISOString().split('T')[0];

  const dateMap = new Map<string, StudyPlanDay>();
  entries.forEach(d => dateMap.set(d.date.split('T')[0], d));

  const selectedEntry = selectedDate ? dateMap.get(selectedDate) : null;

  return (
    <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--bg-card)' }}>
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => setCalMonth(m => new Date(m.getFullYear(), m.getMonth() - 1, 1))}
          className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
          style={{ color: 'var(--text-2)' }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-1)'; }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-2)'; }}
        >‹</button>
        <span className="text-sm font-semibold text-[var(--text-1)]">{MONTHS[month]} {year}</span>
        <button
          onClick={() => setCalMonth(m => new Date(m.getFullYear(), m.getMonth() + 1, 1))}
          className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
          style={{ color: 'var(--text-2)' }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-1)'; }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-2)'; }}
        >›</button>
      </div>

      <div className="grid grid-cols-7 mb-1">
        {DOW.map(d => <div key={d} className="text-center text-[10px] text-[var(--text-3)] py-1">{d}</div>)}
      </div>

      <div className="grid grid-cols-7 gap-0.5">
        {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const dayNum = i + 1;
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
          const entry = dateMap.get(dateStr);
          const isToday = dateStr === todayStr;
          const isSelected = selectedDate === dateStr;

          return (
            <button
              key={dayNum}
              onClick={() => entry && setSelectedDate(isSelected ? null : dateStr)}
              className="relative aspect-square rounded-lg flex flex-col items-center justify-center text-[11px] transition-colors"
              style={{
                backgroundColor: isSelected ? 'var(--brand)' : isToday ? 'var(--bg-input)' : 'transparent',
                color: isSelected ? '#fff' : entry ? 'var(--text-1)' : 'var(--text-3)',
                fontWeight: isToday || isSelected ? 600 : 400,
                cursor: entry ? 'pointer' : 'default',
              }}
              onMouseEnter={e => { if (entry && !isSelected) e.currentTarget.style.backgroundColor = 'var(--bg-hover)'; }}
              onMouseLeave={e => { if (entry && !isSelected) e.currentTarget.style.backgroundColor = isToday ? 'var(--bg-input)' : 'transparent'; }}
            >
              {dayNum}
              {entry && !isSelected && (
                <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                  style={{ backgroundColor: entry.completed ? '#22C55E' : 'var(--brand)' }} />
              )}
            </button>
          );
        })}
      </div>

      {/* Selected day detail */}
      {selectedEntry && (
        <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
          <p className="text-xs font-medium text-[var(--text-1)] mb-0.5">{selectedEntry.title}</p>
          <p className="text-[10px] text-[var(--text-3)]">
            {new Date(selectedEntry.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            {selectedEntry.completed && <span className="ml-2 text-[#22C55E]">· Completed</span>}
          </p>
        </div>
      )}

      <div className="flex items-center gap-4 mt-3 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="flex items-center gap-1.5 text-xs text-[var(--text-3)]">
          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--brand)' }} /> Scheduled
        </div>
        <div className="flex items-center gap-1.5 text-xs text-[var(--text-3)]">
          <div className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" /> Completed
        </div>
      </div>
    </div>
  );
}

// ── Circular topic progress badge ─────────────────────────────────────────────
function TopicProgressBadge({ done, total }: { done: number; total: number }) {
  const allDone = total > 0 && done === total;
  const size = 40;
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = total > 0 ? done / total : 0;

  if (allDone) {
    return (
      <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(34,197,94,0.15)' }}>
        <Check size={16} color="#22C55E" />
      </div>
    );
  }

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--bg-card)" strokeWidth={strokeWidth} />
        <motion.circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none"
          stroke="var(--brand)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - pct * circumference }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[10px] font-semibold tabular-nums" style={{ color: 'var(--text-2)' }}>
          {done}/{total}
        </span>
      </div>
    </div>
  );
}

// ── Day row ───────────────────────────────────────────────────────────────────
function DayRow({ day, planId, onUpdate }: { day: StudyPlanDay; planId: string; onUpdate: (updated: StudyPlanDay) => void }) {
  const [expanded, setExpanded] = useState(false);
  const [toggling, setToggling] = useState(false);
  const topics = parsedTopics(day);

  const storageKey = `topic-done-${day.id}`;
  const [doneTopics, setDoneTopics] = useState<Set<number>>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? new Set<number>(JSON.parse(saved)) : new Set<number>();
    } catch { return new Set<number>(); }
  });

  const doneCount = doneTopics.size;
  const totalCount = topics.length;
  const allTopicsDone = totalCount > 0 && doneCount === totalCount;

  function toggleTopic(e: React.MouseEvent, i: number) {
    e.stopPropagation();
    setDoneTopics(prev => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i); else next.add(i);
      try { localStorage.setItem(storageKey, JSON.stringify([...next])); } catch {}
      return next;
    });
  }

  async function markComplete() {
    if (day.completed || toggling) return;
    setToggling(true);
    try {
      const res = await studyPlansApi.completeDay(planId, day.id);
      if (res.data) onUpdate(res.data);
    } catch {}
    finally { setToggling(false); }
  }

  // Auto-mark done when all topics are covered
  useEffect(() => {
    if (allTopicsDone && !day.completed) markComplete();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allTopicsDone]);

  return (
    <div className="rounded-lg overflow-hidden" style={{ backgroundColor: 'var(--bg-input)' }}>
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-start gap-3 px-3 py-2.5 text-left transition-colors"
        onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
        onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
      >
        <TopicProgressBadge done={doneCount} total={totalCount} />

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[var(--text-1)]">{day.title}</p>
          <p className="text-xs text-[var(--text-3)] mt-0.5">
            {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </p>
        </div>

        <span
          className="shrink-0 px-2.5 py-1 rounded-lg text-xs font-medium"
          style={day.completed
            ? { backgroundColor: 'rgba(34,197,94,0.15)', color: '#22C55E' }
            : { backgroundColor: 'var(--bg-card)', color: 'var(--text-2)' }
          }
        >
          {toggling ? '…' : day.completed ? 'Done' : 'Mark done'}
        </span>

        <div className="text-[var(--text-3)] shrink-0">
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </button>

      <AnimatePresence initial={false}>
      {expanded && (
        <motion.div
          key="topics"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
          style={{ overflow: 'hidden', borderTop: '1px solid var(--border)' }}
          className="px-3 pb-3 pt-2 space-y-1.5"
        >
          <p className="text-[10px] font-medium uppercase tracking-wide text-[var(--text-3)] mb-2">
            Topics · {doneCount}/{totalCount} done
          </p>
          {topics.map((topic, i) => {
            const isDone = doneTopics.has(i);
            return (
              <button
                key={i}
                onClick={e => toggleTopic(e, i)}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-colors"
                style={{ backgroundColor: isDone ? 'rgba(34,197,94,0.08)' : 'var(--bg-card)' }}
                onMouseEnter={e => { if (!isDone) e.currentTarget.style.backgroundColor = 'var(--bg-hover)'; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = isDone ? 'rgba(34,197,94,0.08)' : 'var(--bg-card)'; }}
              >
                <div
                  className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: isDone ? 'rgba(34,197,94,0.2)' : 'var(--bg-input)' }}
                >
                  {isDone && <Check size={9} color="#22C55E" />}
                </div>
                <span className="relative text-xs" style={{ color: isDone ? 'var(--text-3)' : 'var(--text-1)' }}>
                  {topic}
                  <motion.span
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-px block"
                    style={{ backgroundColor: 'var(--text-3)' }}
                    initial={{ width: '0%' }}
                    animate={{ width: isDone ? '100%' : '0%' }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                  />
                </span>
              </button>
            );
          })}
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
}

// ── Plan accordion card ───────────────────────────────────────────────────────
function PlanCard({
  plan,
  onDelete,
  onCalendarEntries,
}: {
  plan: StudyPlan;
  onDelete: () => void;
  onCalendarEntries: (entries: StudyPlanDay[]) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [loadedEntries, setLoadedEntries] = useState<StudyPlanDay[] | null>(plan.dayEntries ?? null);
  const [loadingEntries, setLoadingEntries] = useState(false);
  const [iconColor, iconBg] = getPalette(plan.id);

  const entries = loadedEntries ?? [];
  const done = entries.filter(d => d.completed).length;
  const pct = entries.length > 0 ? Math.round((done / entries.length) * 100) : 0;
  const days = plan.daysUntilTest ?? 0;

  async function handleExpand() {
    const next = !expanded;
    setExpanded(next);
    if (next && !loadedEntries) {
      setLoadingEntries(true);
      const { data } = await studyPlansApi.getById(plan.id);
      const fetched = data?.dayEntries ?? [];
      setLoadedEntries(fetched);
      onCalendarEntries(fetched);
      setLoadingEntries(false);
    } else if (next && loadedEntries) {
      onCalendarEntries(loadedEntries);
    }
  }

  function updateDay(updated: StudyPlanDay) {
    setLoadedEntries(prev => prev?.map(d => d.id === updated.id ? updated : d) ?? prev);
  }

  return (
    <div className="rounded-xl overflow-hidden" style={{ backgroundColor: 'var(--bg-card)' }}>
      {/* Card header */}
      <div
        className="flex items-center gap-3 p-4 cursor-pointer transition-colors"
        onClick={handleExpand}
        onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
        onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
      >
        <div className="w-11 h-11 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: iconBg }}>
          <CalendarDays size={20} style={{ color: iconColor }} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-[var(--text-1)] font-bold truncate">{plan.title}</p>
            {days >= 0 && (
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full shrink-0" style={{ backgroundColor: `${daysColor(days)}20`, color: daysColor(days) }}>
                {days === 0 ? 'Today!' : `${days}d left`}
              </span>
            )}
          </div>
          <p className="text-xs text-[var(--text-3)] mb-2">
            Test: {formatDate(plan.testDate)} · {done}/{entries.length} days done
          </p>
          {/* Progress bar */}
          <div className="h-1 rounded-full" style={{ backgroundColor: 'var(--bg-input)' }}>
            <div className="h-1 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: iconColor }} />
          </div>
        </div>

        <div className="shrink-0" onClick={e => e.stopPropagation()}>
          <PlanMenu onDelete={onDelete} />
        </div>
      </div>

      {/* Expanded: day list */}
      <AnimatePresence initial={false}>
      {expanded && (
        <motion.div
          key="days"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
          style={{ overflow: 'hidden', borderTop: '1px solid var(--border)' }}
          className="px-4 pb-4 pt-1 space-y-2"
        >
          {loadingEntries ? (
            <div className="flex justify-center py-6">
              <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--brand)', borderTopColor: 'transparent' }} />
            </div>
          ) : entries.length === 0 ? (
            <p className="text-xs text-[var(--text-3)] py-4 text-center">No days in this plan.</p>
          ) : (
            <div className="space-y-1.5 mt-2">
              {entries.map(day => (
                <DayRow key={day.id} day={day} planId={plan.id} onUpdate={updateDay} />
              ))}
            </div>
          )}
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function StudyPlanPage() {
  const [plans, setPlans] = useState<StudyPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [calendarEntries, setCalendarEntries] = useState<StudyPlanDay[]>([]);
  const [form, setForm] = useState({ title: '', testDate: '', documentIds: [] as string[] });

  useEffect(() => {
    Promise.all([
      studyPlansApi.getAll(),
      api.get<Document[]>('/documents'),
    ]).then(([p, d]) => {
      if (p.data) setPlans(p.data);
      if (d.data) setDocuments(d.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  async function handleCreate() {
    if (!form.title.trim() || !form.testDate || form.documentIds.length === 0) return;
    setCreating(true);
    try {
      const { data: plan, error } = await studyPlansApi.create(form);
      if (error || !plan) throw new Error(error ?? 'Failed');
      setPlans(prev => [plan, ...prev]);
      setShowCreate(false);
      setForm({ title: '', testDate: '', documentIds: [] });
    } catch {}
    finally { setCreating(false); }
  }

  async function handleDelete(id: string) {
    await studyPlansApi.delete(id).catch(() => {});
    setPlans(prev => prev.filter(p => p.id !== id));
  }

  function toggleDoc(id: string) {
    setForm(f => ({
      ...f,
      documentIds: f.documentIds.includes(id) ? f.documentIds.filter(d => d !== id) : [...f.documentIds, id],
    }));
  }

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateStr = minDate.toISOString().split('T')[0];

  return (
    <div className="max-w-4xl mx-auto py-2">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-1)]">Study Plans</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white hover:opacity-90 transition-opacity"
          style={{ background: 'linear-gradient(135deg, #FF6500, #FF9A3C)' }}
        >
          <Plus size={13} /> New Plan
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map(i => <div key={i} className="h-24 rounded-xl animate-pulse" style={{ backgroundColor: 'var(--bg-card)' }} />)}
        </div>
      ) : plans.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center rounded-xl" style={{ backgroundColor: 'var(--bg-card)' }}>
          <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: 'var(--bg-input)' }}>
            <CalendarDays size={28} style={{ color: 'var(--text-3)' }} />
          </div>
          <h2 className="text-base font-semibold text-[var(--text-1)] mb-1">No study plans yet</h2>
          <p className="text-[var(--text-2)] text-sm mb-6 max-w-xs">Create a plan by selecting your study materials and test date. AI will build a day-by-day schedule.</p>
          <button
            onClick={() => setShowCreate(true)}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white hover:opacity-90 transition-opacity"
            style={{ background: 'linear-gradient(135deg, #FF6500, #FF9A3C)' }}
          >
            Create Study Plan
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Left: sticky calendar */}
          <div className="md:col-span-2">
            <div className="sticky top-4">
              <MiniCalendar entries={calendarEntries} />
            </div>
          </div>

          {/* Right: plan accordions */}
          <div className="md:col-span-3 space-y-3">
            {plans.map(plan => (
              <PlanCard
                key={plan.id}
                plan={plan}
                onDelete={() => handleDelete(plan.id)}
                onCalendarEntries={setCalendarEntries}
              />
            ))}
          </div>
        </div>
      )}

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}>
          <div className="w-full max-w-lg rounded-2xl p-6" style={{ backgroundColor: 'var(--bg-card)' }}>
            <h2 className="text-base font-semibold text-[var(--text-1)] mb-5">Create Study Plan</h2>

            {creating ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin mb-4" style={{ borderColor: 'var(--brand)', borderTopColor: 'transparent' }} />
                <p className="text-[var(--text-1)] font-medium text-sm">Generating your plan…</p>
                <p className="text-[var(--text-2)] text-xs mt-1">AI is creating a day-by-day schedule</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium mb-1.5 text-[var(--text-2)]">Plan title</label>
                  <input
                    value={form.title}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    placeholder="e.g., Biology Midterm Prep"
                    className="w-full px-3 py-2.5 rounded-lg text-sm text-[var(--text-1)] placeholder-[var(--text-3)] outline-none"
                    style={{ backgroundColor: 'var(--bg-input)' }}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1.5 text-[var(--text-2)]">Test date</label>
                  <input
                    type="date"
                    value={form.testDate}
                    min={minDateStr}
                    onChange={e => setForm(f => ({ ...f, testDate: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-lg text-sm text-[var(--text-1)] outline-none"
                    style={{ backgroundColor: 'var(--bg-input)', colorScheme: 'dark' } as React.CSSProperties}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium mb-2 text-[var(--text-2)]">
                    Study materials
                    {form.documentIds.length > 0 && (
                      <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px]" style={{ backgroundColor: 'rgba(255,101,0,0.12)', color: 'var(--brand)' }}>
                        {form.documentIds.length} selected
                      </span>
                    )}
                  </label>
                  {documents.length === 0 ? (
                    <p className="text-xs text-[var(--text-2)] py-2">No notes found. Upload notes in your Library first.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {documents.map(doc => {
                        const sel = form.documentIds.includes(doc.id);
                        return (
                          <button
                            key={doc.id}
                            onClick={() => toggleDoc(doc.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-colors"
                            style={sel ? {
                              backgroundColor: 'rgba(255,101,0,0.12)',
                              color: 'var(--brand)',
                            } : {
                              backgroundColor: 'var(--bg-input)',
                              color: 'var(--text-2)',
                            }}
                            onMouseEnter={e => { if (!sel) e.currentTarget.style.backgroundColor = 'var(--bg-hover)'; }}
                            onMouseLeave={e => { if (!sel) e.currentTarget.style.backgroundColor = 'var(--bg-input)'; }}
                          >
                            {sel && <Check size={10} />}
                            <span className="max-w-[160px] truncate">{doc.title}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-1">
                  <button
                    onClick={() => { setShowCreate(false); setForm({ title: '', testDate: '', documentIds: [] }); }}
                    className="flex-1 py-2.5 rounded-xl text-xs font-medium transition-colors"
                    style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-2)' }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--bg-input)')}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreate}
                    disabled={!form.title.trim() || !form.testDate || form.documentIds.length === 0}
                    className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ background: 'linear-gradient(135deg, #FF6500, #FF9A3C)' }}
                  >
                    Generate Plan
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
