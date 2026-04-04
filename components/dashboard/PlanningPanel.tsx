'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { studyPlansApi, StudyPlan, StudyPlanDay } from '@/lib/api/studyPlan';
import PlanCalendar from '@/components/dashboard/PlanCalendar';
import PlanCard from '@/components/dashboard/PlanCard';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';

export default function PlanningPanel({ onCountChange }: { onCountChange?: (n: number) => void }) {
  const router = useRouter();
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
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-[var(--text-2)]">
          {plans.length} plan{plans.length !== 1 ? 's' : ''}
        </span>
        <motion.button
          onClick={() => router.push('/dashboard/study-plan')}
          className="flex items-center justify-center w-7 h-7 rounded-lg transition-colors"
          style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-2)' }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--brand)'; }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'var(--bg-card)'; e.currentTarget.style.color = 'var(--text-2)'; }}
          whileTap={{ scale: 0.82 }}
        >
          <Plus size={14} />
        </motion.button>
      </div>
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
