'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { studyPlansApi, StudyPlan, StudyPlanDay } from '@/lib/api/studyPlan';
import { tasksApi } from '@/lib/api/tasks';
import PlanCalendar from '@/components/dashboard/PlanCalendar';
import PlanCard from '@/components/dashboard/PlanCard';
import TasksPanel from '@/components/tasks/TasksPanel';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus } from 'lucide-react';

type Tab = 'planning' | 'tasks';

export default function PlanningTasksSection() {
  const router = useRouter();
  const [plans, setPlans] = useState<StudyPlan[]>([]);
  const [calendarEntries, setCalendarEntries] = useState<StudyPlanDay[]>([]);
  const [taskCount, setTaskCount] = useState(0);
  const [activeTab, setActiveTab] = useState<Tab>('planning');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      studyPlansApi.getAll(),
      tasksApi.getAll(),
    ]).then(async ([plansRes, tasksRes]) => {
      if (plansRes.data) {
        setPlans(plansRes.data);
        const allEntries = await Promise.all(
          plansRes.data.map(p => studyPlansApi.getById(p.id).then(r => r.data?.dayEntries ?? []))
        );
        setCalendarEntries(allEntries.flat());
      }
      if (tasksRes.data) setTaskCount(tasksRes.data.filter(t => !t.completed).length);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const planCount = plans.length;

  function TabSwitcher() {
    return (
      <div className="flex gap-1 p-1 rounded-xl shrink-0" style={{ backgroundColor: 'var(--bg-card)' }}>
        {(['planning', 'tasks'] as Tab[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="flex-1 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors"
            style={{
              backgroundColor: activeTab === tab ? 'var(--bg-input)' : 'transparent',
              color: activeTab === tab ? 'var(--text-1)' : 'var(--text-3)',
            }}
          >
            {tab === 'planning'
              ? `Planning${planCount > 0 ? ` · ${planCount}` : ''}`
              : `Tasks${taskCount > 0 ? ` · ${taskCount}` : ''}`}
          </button>
        ))}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex gap-6">
        <div className="hidden md:block w-80 shrink-0 h-72 rounded-xl animate-pulse" style={{ backgroundColor: 'var(--bg-card)' }} />
        <div className="flex-1 space-y-2">
          {[1, 2].map(i => <div key={i} className="h-20 rounded-xl animate-pulse" style={{ backgroundColor: 'var(--bg-card)' }} />)}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* md+ — calendar left, tabs right */}
      <div className="hidden md:flex gap-6 items-start">
        {/* Larger calendar */}
        <div className="w-80 shrink-0">
          <PlanCalendar entries={calendarEntries} />
        </div>

        {/* Tabs + content */}
        <div className="flex-1 min-w-0 flex flex-col gap-3">
          <TabSwitcher />
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
            >
              {activeTab === 'planning' ? (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-[var(--text-2)]">
                      {planCount} plan{planCount !== 1 ? 's' : ''}
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
                  {plans.map(plan => (
                    <PlanCard key={plan.id} plan={plan} onCalendarEntries={setCalendarEntries} />
                  ))}
                </div>
              ) : (
                <TasksPanel onCountChange={setTaskCount} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* sm — vertical: calendar, then plan cards, then active tasks */}
      <div className="md:hidden flex flex-col gap-4">
        <PlanCalendar entries={calendarEntries} compact />

        {plans.length > 0 && (
          <div className="flex flex-col gap-2">
            {plans.map(plan => (
              <PlanCard key={plan.id} plan={plan} onCalendarEntries={setCalendarEntries} compact />
            ))}
          </div>
        )}

        <TasksPanel onCountChange={setTaskCount} hideCompleted />
      </div>
    </>
  );
}
