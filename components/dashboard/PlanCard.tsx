'use client';

import { useEffect, useState } from 'react';
import { studyPlansApi, StudyPlan, StudyPlanDay } from '@/lib/api/studyPlan';
import { CalendarDays, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const PALETTE: [string, string][] = [
  ['#FF6500', 'rgba(255,101,0,0.12)'],
  ['#22C55E', 'rgba(34,197,94,0.12)'],
  ['#3B82F6', 'rgba(59,130,246,0.12)'],
  ['#F59E0B', 'rgba(245,158,11,0.12)'],
  ['#EC4899', 'rgba(236,72,153,0.12)'],
  ['#8B5CF6', 'rgba(139,92,246,0.12)'],
  ['#14B8A6', 'rgba(20,184,166,0.12)'],
];

export function getPalette(id: string): [string, string] {
  const hash = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return PALETTE[hash % PALETTE.length];
}

export function daysColor(days: number) {
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
        <Check size={20} strokeWidth={3} color="white" />
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
        <span className="text-[10px] font-semibold tabular-nums text-[var(--text-1)]">
          {done}/{total}
        </span>
      </div>
    </div>
  );
}

// ── Day row ───────────────────────────────────────────────────────────────────
export function DayRow({ day, planId, onUpdate, compact }: { day: StudyPlanDay; planId: string; onUpdate: (updated: StudyPlanDay) => void; compact?: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const [toggling, setToggling] = useState(false);
  const topics = parsedTopics(day);

  const [doneTopics, setDoneTopics] = useState<Set<number>>(() => {
    try {
      return day.completedTopics ? new Set<number>(JSON.parse(day.completedTopics)) : new Set<number>();
    } catch { return new Set<number>(); }
  });

  useEffect(() => {
    if (!day.completedTopics) setDoneTopics(new Set());
  }, [day.completedTopics]);

  const doneCount = doneTopics.size;
  const totalCount = topics.length;
  const allTopicsDone = totalCount > 0 && doneCount === totalCount;

  function toggleTopic(e: React.MouseEvent, i: number) {
    e.stopPropagation();
    setDoneTopics(prev => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i); else next.add(i);
      studyPlansApi.saveTopics(planId, day.id, [...next]).catch(() => {});
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
          <p className={`${compact ? 'text-[10px]' : 'text-xs'} font-medium text-[var(--text-1)]`}>{day.title}</p>
          <p className={`${compact ? 'text-[9px]' : 'text-[10px]'} mt-0.5 text-[var(--text-2)]`}>
            {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </p>
        </div>
        <div className="text-[var(--text-1)] shrink-0">
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
            <p className="text-[10px] font-medium tracking-wide text-[var(--text-3)] mb-2">
              Topics
            </p>
            {topics.map((topic, i) => {
              const isDone = doneTopics.has(i);
              return (
                <button
                  key={i}
                  onClick={e => toggleTopic(e, i)}
                  className={`w-full flex items-center gap-2.5 ${compact ? 'px-2 py-1.5' : 'px-2.5 py-2'} rounded-lg text-left transition-colors`}
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
                  <span
                    className={`${compact ? 'text-[10px]' : 'text-xs'} transition-all duration-300`}
                    style={{
                      color: isDone ? 'var(--text-3)' : 'var(--text-1)',
                      textDecoration: isDone ? 'line-through' : 'none',
                      textDecorationColor: 'var(--text-3)',
                      textDecorationThickness: '0.3px',
                    }}
                  >
                    {topic}
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
export default function PlanCard({
  plan,
  onCalendarEntries,
  compact,
}: {
  plan: StudyPlan;
  onCalendarEntries: (entries: StudyPlanDay[]) => void;
  compact?: boolean;
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
      <div
        className={`flex flex-col ${compact ? 'gap-2 p-3' : 'gap-3 p-4'} cursor-pointer transition-colors`}
        onClick={handleExpand}
        onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
        onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
      >
        {/* Top row: icon, title/date, pill+chevron */}
        <div className="flex items-start gap-3">
          <div className={`${compact ? 'w-8 h-8' : 'w-11 h-11'} rounded-full flex items-center justify-center shrink-0`} style={{ backgroundColor: iconBg }}>
            <CalendarDays size={compact ? 14 : 20} style={{ color: iconColor }} />
          </div>

          <div className="flex-1 min-w-0">
            <p className={`text-[var(--text-1)] font-bold truncate ${compact ? 'text-xs' : ''}`}>{plan.title}</p>
            <span className={`${compact ? 'text-[10px]' : 'text-xs'} font-medium text-[var(--text-2)]`}>{formatDate(plan.testDate)}</span>
          </div>

          <div className="shrink-0 flex items-center gap-1.5">
            {days >= 0 && (
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: `${daysColor(days)}20`, color: daysColor(days) }}>
                {days === 0 ? 'Today!' : `${days}d Left`}
              </span>
            )}
            <span className="text-[var(--text-1)]">
              {expanded ? <ChevronUp size={compact ? 14 : 18} /> : <ChevronDown size={compact ? 14 : 18} />}
            </span>
          </div>
        </div>

        {/* Full-width progress bar */}
        <div className="flex items-center gap-2">
          <div className={`flex-1 ${compact ? 'h-1.5' : 'h-2'} rounded-full overflow-hidden`} style={{ backgroundColor: 'var(--bg-input)' }}>
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: iconColor }}
              initial={{ width: '0%' }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </div>
          <span className={`${compact ? 'text-xs' : 'text-sm'} font-bold tabular-nums shrink-0`} style={{ color: 'var(--text-1)' }}>
            {done}/{entries.length}
          </span>
        </div>
      </div>

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
                  <DayRow key={day.id} day={day} planId={plan.id} onUpdate={updateDay} compact={compact} />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
