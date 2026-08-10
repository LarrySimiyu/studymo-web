'use client';

import { useEffect, useState } from 'react';
import { getPalette } from '@/components/dashboard/PlanCard';
import { studyPlansApi, StudyPlan, StudyPlanDay } from '@/lib/api/studyPlan';
import { Calendar } from '@/components/ui/calendar';
import { CalendarDays, Check } from 'lucide-react';
import Link from 'next/link';


interface EntryWithPlan extends StudyPlanDay {
  planTitle: string;
  planId: string;
  planColor: string;
  planColorBg: string;
}

export default function StudyPlanSidePanel() {
  const [allEntries, setAllEntries] = useState<EntryWithPlan[]>([]);
  const [selected, setSelected] = useState<Date | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    studyPlansApi.getAll().then(async ({ data: plans }) => {
      if (!plans) return;
      const fetched = await Promise.all(
        plans.map(plan =>
          studyPlansApi.getById(plan.id).then(r => {
            const [color, colorBg] = getPalette(plan.id);
            return (r.data?.dayEntries ?? []).map(d => ({
              ...d,
              planTitle: plan.title,
              planId: plan.id,
              planColor: color,
              planColorBg: colorBg,
            }));
          })
        )
      );
      setAllEntries(fetched.flat());
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const scheduledDates = new Set(
    allEntries.filter(d => !d.completed).map(d => d.date.split('T')[0])
  );
  const completedDates = new Set(
    allEntries.filter(d => d.completed).map(d => d.date.split('T')[0])
  );

  // Entries for selected date
  const selectedStr = selected?.toISOString().split('T')[0];
  const selectedEntries = selectedStr
    ? allEntries.filter(d => d.date.split('T')[0] === selectedStr)
    : [];

  // Upcoming entries (today + future, not completed), sorted by date, max 5
  const today = new Date().toISOString().split('T')[0];
  const upcoming = allEntries
    .filter(d => !d.completed && d.date.split('T')[0] >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 6);

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Calendar card */}
      <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--bg-card)' }}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-medium text-[var(--text-2)]">Study Calendar</h2>
          <Link href="/dashboard/study-plan" className="text-xs font-medium transition-opacity hover:opacity-70" style={{ color: 'var(--text-2)' }}>
            View All
          </Link>
        </div>

        <Calendar
          mode="single"
          selected={selected}
          onSelect={setSelected}
          scheduledDates={scheduledDates}
          completedDates={completedDates}
        />

        {/* Selected day detail */}
        {selectedEntries.length > 0 && (
          <div className="mt-2 pt-3 space-y-2" style={{ borderTop: '1px solid var(--border)' }}>
            {selectedEntries.map(entry => (
              <div key={entry.id} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: entry.planColor }} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-[var(--text-1)] truncate">{entry.title}</p>
                  <p className="text-2xs text-[var(--text-3)]">{entry.planTitle}</p>
                </div>
                {entry.completed && <Check size={12} color="#22C55E" />}
              </div>
            ))}
          </div>
        )}

        {/* Legend */}
        <div className="flex items-center gap-4 mt-3 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
          <div className="flex items-center gap-1.5 text-2xs" style={{ color: 'var(--text-3)' }}>
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--brand)' }} /> Scheduled
          </div>
          <div className="flex items-center gap-1.5 text-2xs" style={{ color: 'var(--text-3)' }}>
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#22C55E' }} /> Completed
          </div>
        </div>
      </div>

      {/* Upcoming sessions */}
      <div>
        <h2 className="text-xs font-medium text-[var(--text-2)] mb-2">Upcoming Sessions</h2>

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-14 rounded-xl animate-pulse" style={{ backgroundColor: 'var(--bg-card)' }} />
            ))}
          </div>
        ) : upcoming.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-6 rounded-xl text-center"
            style={{ backgroundColor: 'var(--bg-card)' }}
          >
            <CalendarDays size={20} style={{ color: 'var(--text-3)' }} className="mb-2" />
            <p className="text-xs text-[var(--text-3)]">No upcoming sessions</p>
            <Link href="/dashboard/study-plan" className="text-xs mt-1 transition-opacity hover:opacity-70" style={{ color: 'var(--brand)' }}>
              Create a plan
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {upcoming.map(entry => {
              const date = new Date(entry.date + 'T00:00:00');
              const isToday = entry.date.split('T')[0] === today;
              return (
                <div
                  key={entry.id}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors bg-[var(--bg-card)] hover:bg-[var(--bg-hover)]"
                >
                  {/* Date badge */}
                  <div
                    className="w-10 h-10 rounded-lg flex flex-col items-center justify-center shrink-0"
                    style={{ backgroundColor: entry.planColorBg }}
                  >
                    <span className="text-2xs font-semibold uppercase leading-none" style={{ color: entry.planColor }}>
                      {date.toLocaleDateString('en-US', { month: 'short' })}
                    </span>
                    <span className="text-sm font-bold leading-tight" style={{ color: entry.planColor }}>
                      {date.getDate()}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-[var(--text-1)] truncate">{entry.title}</p>
                    <p className="text-2xs text-[var(--text-3)] truncate">{entry.planTitle}</p>
                  </div>

                  {/* Today badge */}
                  {isToday && (
                    <span className="text-2xs font-semibold px-1.5 py-0.5 rounded-full shrink-0" style={{ backgroundColor: 'rgba(255,101,0,0.12)', color: 'var(--brand)' }}>
                      Today
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
