'use client';

import { useEffect, useState } from 'react';
import { studyPlansApi, StudyPlan, StudyPlanDay } from '@/lib/api/studyPlan';
import { CalendarDays } from 'lucide-react';
import { PageHeader } from '@/components/dashboard/PageHeader';
import PlanCalendar from '@/components/dashboard/PlanCalendar';
import PlanCard from '@/components/dashboard/PlanCard';
import CreateStudyPlanModal from '@/components/study-plan/CreateStudyPlanModal';

export default function StudyPlanPage() {
  const [plans, setPlans] = useState<StudyPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [calendarEntries, setCalendarEntries] = useState<StudyPlanDay[]>([]);

  useEffect(() => {
    studyPlansApi.getAll().then(async ({ data }) => {
      if (data) {
        setPlans(data);
        const allEntries = await Promise.all(
          data.map(plan => studyPlansApi.getById(plan.id).then(r => r.data?.dayEntries ?? []))
        );
        setCalendarEntries(allEntries.flat());
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  async function handleDelete(id: string) {
    await studyPlansApi.delete(id).catch(() => {});
    setPlans(prev => prev.filter(p => p.id !== id));
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-6">
      <PageHeader
        title="Study Plans"
        action={{ label: 'New Plan', onClick: () => setShowCreate(true) }}
      />

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
        <div className="flex flex-col gap-4">
          <div className="w-full">
            <PlanCalendar entries={calendarEntries} />
          </div>
          <div className="space-y-3">
            {plans.map(plan => (
              <PlanCard
                key={plan.id}
                plan={plan}
                onCalendarEntries={setCalendarEntries}
              />
            ))}
          </div>
        </div>
      )}

      <CreateStudyPlanModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={plan => setPlans(prev => [plan, ...prev])}
      />
    </div>
  );
}
