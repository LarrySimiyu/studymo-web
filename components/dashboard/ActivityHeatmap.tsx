'use client';

import { useEffect, useState } from 'react';
import { Flame } from 'lucide-react';
import { analyticsApi, activityApi, ActivityDay } from '@/lib/api/analytics';

interface StreakData { currentStreak: number; longestStreak: number; }
interface Props {
  streak?: StreakData;
  recordVisit?: boolean;
  /** Year the user created their account — used to build the year picker range. */
  joinYear?: number;
}

const LEVEL_COLORS: Record<number, string> = {
  0: 'var(--bg-input)',
  1: '#86efac',
  2: '#4ade80',
  3: '#16a34a',
};

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
// Show Mon / Wed / Fri labels (indices 1, 3, 5 in Sun=0 week)
const DAY_LABELS: Record<number, string> = { 1: 'Mon', 3: 'Wed', 5: 'Fri' };

const CELL = 11;   // px — square side
const GAP  = 2;    // px — gap between cells

function pad2(n: number) { return String(n).padStart(2, '0'); }
function toDs(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

/**
 * Build the 53-week grid for a given year.
 * Returns an array of 53 columns; each column is 7 Date|null entries (Sun=0 … Sat=6).
 * Dates outside the year are null so we render them as empty.
 */
function buildGrid(year: number): { weeks: (Date | null)[][]; monthCols: { month: number; col: number }[] } {
  const jan1 = new Date(year, 0, 1);
  const startOffset = jan1.getDay(); // 0=Sun

  // Start of the grid = Sunday on or before Jan 1
  const gridStart = new Date(jan1);
  gridStart.setDate(gridStart.getDate() - startOffset);

  const weeks: (Date | null)[][] = [];
  const monthCols: { month: number; col: number }[] = [];
  const seenMonths = new Set<number>();

  for (let w = 0; w < 53; w++) {
    const week: (Date | null)[] = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(gridStart);
      date.setDate(gridStart.getDate() + w * 7 + d);
      // Only include dates within the year
      const inYear = date.getFullYear() === year;
      week.push(inYear ? date : null);

      // Track month label column
      if (inYear && date.getDate() === 1 && !seenMonths.has(date.getMonth())) {
        seenMonths.add(date.getMonth());
        monthCols.push({ month: date.getMonth(), col: w });
      }
    }
    // Skip trailing empty weeks
    if (w >= 52 && week.every(c => c === null)) break;
    weeks.push(week);
  }

  return { weeks, monthCols };
}

export default function ActivityHeatmap({ streak: streakProp, recordVisit = false, joinYear }: Props) {
  const now = new Date();
  const currentYear = now.getFullYear();
  const minYear = joinYear ?? currentYear;

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [days, setDays] = useState<ActivityDay[]>([]);
  const [streak, setStreak] = useState<StreakData>(streakProp ?? { currentStreak: 0, longestStreak: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (streakProp) setStreak(streakProp);
  }, [streakProp]);

  useEffect(() => {
    setLoading(true);
    async function load() {
      let todayLevel = 0;

      // Ping FIRST so the DB write lands before we fetch the heatmap
      if (recordVisit && selectedYear === currentYear) {
        const { data } = await activityApi.ping().catch(() => ({ data: null }));
        if (data) {
          setStreak(data);
          todayLevel = 1; // we know at minimum the visit was recorded
        }
      }

      const { data } = await analyticsApi.getActivityHeatmap(selectedYear).catch(() => ({ data: null }));
      if (data) {
        // Ensure today is always green after a visit ping (guards against any timezone edge cases)
        if (todayLevel > 0) {
          const td = toDs(now);
          const existing = data.find(d => d.date === td);
          if (!existing) {
            data.push({ date: td, level: todayLevel as ActivityDay['level'] });
          }
        }
        setDays(data);
      }
      setLoading(false);
    }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedYear]);

  const levelMap = new Map<string, number>();
  for (const d of days) levelMap.set(d.date, d.level);

  const todayDs = toDs(now);
  const { weeks, monthCols } = buildGrid(selectedYear);

  // Build year list: currentYear down to joinYear
  const years: number[] = [];
  for (let y = currentYear; y >= minYear; y--) years.push(y);
  // Always show at least 3 options if joinYear is recent
  while (years.length < 3) years.push(years[years.length - 1] - 1);

  const gridWidth = weeks.length * (CELL + GAP) - GAP;
  const dayLabelWidth = 28;

  return (
    <div
      className="rounded-xl p-4"
      style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
    >
      <div className="flex items-start gap-4">

        {/* ── Streak panel ────────────────────────────────────────────── */}
        <div
          className="shrink-0 flex flex-col gap-3 pr-4"
          style={{ borderRight: '1px solid var(--border)', minWidth: 90 }}
        >
          <div>
            <div className="flex items-center gap-1 mb-0.5">
              <Flame size={18} className="shrink-0 text-[var(--brand-ink)]" />
              <span className="text-heading text-[var(--text-1)] leading-none">
                {streak.currentStreak}
              </span>
            </div>
            <p className="text-xs text-[var(--text-3)]">day streak</p>
          </div>

          <div>
            <p className="text-sm font-bold text-[var(--text-1)]">{streak.longestStreak}</p>
            <p className="text-xs text-[var(--text-3)]">best streak</p>
          </div>

          <div className="flex flex-col gap-1.5 mt-1">
            {[1, 2, 3].map(lvl => (
              <div key={lvl} className="flex items-center gap-1.5">
                <div
                  className="w-2.5 h-2.5 shrink-0"
                  style={{ backgroundColor: LEVEL_COLORS[lvl], borderRadius: 2 }}
                />
                <span className="text-2xs text-[var(--text-3)]">
                  {lvl === 1 ? 'Visited' : lvl === 2 ? 'Uploaded' : 'Studied'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Heatmap grid ─────────────────────────────────────────────── */}
        <div className="flex-1 min-w-0 overflow-x-auto">
          <div style={{ minWidth: dayLabelWidth + gridWidth }}>

            {/* Month labels row */}
            <div
              className="flex mb-1"
              style={{ marginLeft: dayLabelWidth, position: 'relative', height: 16 }}
            >
              {monthCols.map(({ month, col }) => (
                <span
                  key={month}
                  className="absolute text-2xs text-[var(--text-2)] font-medium"
                  style={{ left: col * (CELL + GAP) }}
                >
                  {MONTH_NAMES[month]}
                </span>
              ))}
            </div>

            {/* Grid rows (day of week) */}
            <div className="flex flex-col" style={{ gap: GAP }}>
              {Array.from({ length: 7 }, (_, dayIdx) => (
                <div key={dayIdx} className="flex items-center" style={{ gap: GAP }}>
                  {/* Day label */}
                  <div
                    className="text-2xs text-[var(--text-3)] text-right shrink-0"
                    style={{ width: dayLabelWidth - GAP }}
                  >
                    {DAY_LABELS[dayIdx] ?? ''}
                  </div>

                  {/* Cells */}
                  {weeks.map((week, wi) => {
                    const date = week[dayIdx];
                    if (!date) {
                      return (
                        <div
                          key={wi}
                          className="shrink-0"
                          style={{ width: CELL, height: CELL, borderRadius: 2 }}
                        />
                      );
                    }
                    const ds = toDs(date);
                    const isFuture = ds > todayDs;
                    const isToday = ds === todayDs;
                    const level = isFuture ? 0 : (levelMap.get(ds) ?? 0);

                    return (
                      <div
                        key={wi}
                        title={`${MONTH_NAMES[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`}
                        className="shrink-0 transition-opacity hover:opacity-70 cursor-default"
                        style={{
                          width: CELL,
                          height: CELL,
                          borderRadius: 2,
                          backgroundColor: LEVEL_COLORS[level],
                          border: isToday ? `1.5px solid var(--brand)` : '1px solid transparent',
                          opacity: isFuture ? 0.3 : 1,
                        }}
                      />
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Loading shimmer overlay */}
            {loading && (
              <div
                className="absolute inset-0 rounded-lg animate-pulse"
                style={{ backgroundColor: 'var(--bg-input)', opacity: 0.3 }}
              />
            )}
          </div>
        </div>

        {/* ── Year picker ──────────────────────────────────────────────── */}
        <div className="shrink-0 flex flex-col gap-0.5" style={{ minWidth: 44 }}>
          {years.map(y => (
            <button
              key={y}
              onClick={() => setSelectedYear(y)}
              className="text-xs font-medium px-2 py-1 rounded-md text-left transition-colors"
              style={
                y === selectedYear
                  ? { backgroundColor: 'var(--brand)', color: 'white' }
                  : { color: 'var(--text-2)', backgroundColor: 'transparent' }
              }
            >
              {y}
            </button>
          ))}
        </div>

      </div>
    </div>
  );
}
