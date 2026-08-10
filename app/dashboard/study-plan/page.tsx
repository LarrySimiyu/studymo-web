'use client';

import { useEffect, useState } from 'react';
import { studyPlansApi, StudyPlan, StudyPlanDay } from '@/lib/api/studyPlan';
import { CalendarDays } from 'lucide-react';
import { PageHeader } from '@/components/dashboard/PageHeader';
import PageShell from '@/components/dashboard/PageShell';
import EmptyState from '@/components/dashboard/EmptyState';
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
    <PageShell
      width="xl"
      header={<PageHeader title="Study Plans" action={{ label: 'New Plan', onClick: () => setShowCreate(true) }} />}
    >

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map(i => <div key={i} className="h-24 rounded-xl animate-pulse" style={{ backgroundColor: 'var(--bg-card)' }} />)}
        </div>
      ) : plans.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          accent="#14B8A6"
          accentBg="rgba(20,184,166,0.12)"
          title="No study plans yet"
          description="Create a plan by selecting your study materials and test date. AI will build a day-by-day schedule."
          action={{ label: 'Create Study Plan', onClick: () => setShowCreate(true) }}
        />
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
    </PageShell>
  );
}
