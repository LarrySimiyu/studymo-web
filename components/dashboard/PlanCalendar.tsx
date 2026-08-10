'use client';

import { useState } from 'react';
import { StudyPlanDay } from '@/lib/api/studyPlan';
import { Calendar } from '@/components/ui/calendar';

export default function PlanCalendar({ entries, compact }: { entries: StudyPlanDay[]; compact?: boolean }) {
  const [selected, setSelected] = useState<Date | undefined>();

  const dateMap = new Map<string, StudyPlanDay>();
  entries.forEach(d => dateMap.set(d.date.split('T')[0], d));

  const scheduledDates = new Set(
    entries.filter(d => !d.completed).map(d => d.date.split('T')[0])
  );
  const completedDates = new Set(
    entries.filter(d => d.completed).map(d => d.date.split('T')[0])
  );

  const selectedStr = selected?.toISOString().split('T')[0];
  const selectedEntry = selectedStr ? dateMap.get(selectedStr) : null;

  return (
    <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--bg-card)' }}>
      <Calendar
        mode="single"
        selected={selected}
        onSelect={setSelected}
        scheduledDates={scheduledDates}
        completedDates={completedDates}
        compact={compact}
      />

      {selectedEntry && (
        <div className="mt-2 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
          <p className="text-xs font-medium text-[var(--text-1)]">{selectedEntry.title}</p>
          <p className="text-2xs text-[var(--text-3)] mt-0.5">
            {new Date(selectedEntry.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            {selectedEntry.completed && <span className="ml-2" style={{ color: 'var(--success-ink)' }}>· Completed</span>}
          </p>
        </div>
      )}

      <div className="flex items-center gap-4 mt-3 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-3)' }}>
          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--brand)' }} /> Scheduled
        </div>
        <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-3)' }}>
          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#22C55E' }} /> Completed
        </div>
      </div>
    </div>
  );
}
