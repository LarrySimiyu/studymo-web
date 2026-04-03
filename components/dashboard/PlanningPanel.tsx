'use client';

import { useEffect, useState } from 'react';
import { studyPlansApi, StudyPlan, StudyPlanDay } from '@/lib/api/studyPlan';
import PlanCalendar from '@/components/dashboard/PlanCalendar';
import PlanCard from '@/components/dashboard/PlanCard';

export default function PlanningPanel({ onCountChange }: { onCountChange?: (n: number) => void }) {
  const [plans, setPlans] = useState<StudyPlan[]>([]);
  const [calendarEntries, setCalendarEntries] = useState<StudyPlanDay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    studyPlansApi.getAll().then(async ({ data }) => {
      if (!data) return;
      setPlans(data);
      onCountChange?.(data.length);
      const allEntries = await Promise.all(
        data.map(plan => studyPlansApi.getById(plan.id).then(r => r.data?.dayEntries ?? []))
      );
      setCalendarEntries(allEntries.flat());
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="h-72 rounded-xl animate-pulse" style={{ backgroundColor: 'var(--bg-card)' }} />
        <div className="h-24 rounded-xl animate-pulse" style={{ backgroundColor: 'var(--bg-card)' }} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <PlanCalendar entries={calendarEntries} compact />
      {plans.map(plan => (
        <PlanCard
          key={plan.id}
          plan={plan}
          onCalendarEntries={setCalendarEntries}
          compact
        />
      ))}
    </div>
  );
}
