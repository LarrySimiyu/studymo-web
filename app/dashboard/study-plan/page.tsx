'use client';

import { useEffect, useState } from 'react';
import { studyPlansApi, StudyPlan, StudyPlanDay } from '@/lib/api/studyPlan';
import { api } from '@/lib/api';
import { CalendarDays, CalendarIcon, Check } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { PageHeader } from '@/components/dashboard/PageHeader';
import * as Popover from '@radix-ui/react-popover';
import { Button } from '@/components/ui/button';
import PlanCalendar from '@/components/dashboard/PlanCalendar';
import PlanCard from '@/components/dashboard/PlanCard';

interface Document { id: string; title: string }

// ── Main page ─────────────────────────────────────────────────────────────────
export default function StudyPlanPage() {
  const [plans, setPlans] = useState<StudyPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [calendarEntries, setCalendarEntries] = useState<StudyPlanDay[]>([]);
  const [form, setForm] = useState({ title: '', testDate: '', documentIds: [] as string[] });
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  useEffect(() => {
    Promise.all([
      studyPlansApi.getAll(),
      api.get<Document[]>('/documents'),
    ]).then(async ([p, d]) => {
      if (d.data) setDocuments(d.data);
      if (p.data) {
        setPlans(p.data);
        // Fetch entries for all plans so calendar dots show immediately
        const allEntries = await Promise.all(
          p.data.map(plan => studyPlansApi.getById(plan.id).then(r => r.data?.dayEntries ?? []))
        );
        setCalendarEntries(allEntries.flat());
      }
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
          {/* Calendar — full width at all breakpoints */}
          <div className="w-full">
            <PlanCalendar entries={calendarEntries} />
          </div>

          {/* Plan accordions */}
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

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}>
          <div className="w-full max-w-md rounded-2xl p-5 sm:p-6 max-h-[90vh] overflow-y-auto" style={{ backgroundColor: 'var(--bg-card)' }}>
<h2 className="text-lg font-bold text-[var(--text-1)] mb-1">New Study Plan</h2>
            <p className="text-xs text-[var(--text-3)] mb-5">AI will generate a day-by-day schedule for you.</p>

            {creating ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin mb-4" style={{ borderColor: 'var(--brand)', borderTopColor: 'transparent' }} />
                <p className="text-[var(--text-1)] font-medium text-sm">Generating your plan…</p>
                <p className="text-[var(--text-2)] text-xs mt-1">This may take a few seconds</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-xs font-medium mb-1.5 text-[var(--text-1)]">Plan Title</label>
                  <Input
                    value={form.title}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    placeholder="e.g., Biology Midterm Prep"
                    autoFocus
                  />
                </div>

                {/* Test date — popover calendar */}
                <div>
                  <label className="block text-xs font-medium mb-1.5 text-[var(--text-1)]">Test Date</label>
                  <Popover.Root open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                    <Popover.Trigger asChild>
                      <button
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-left transition-colors"
                        style={{
                          backgroundColor: 'var(--bg-card)',
                          border: '1px solid var(--border-md)',
                          color: form.testDate ? 'var(--text-1)' : 'var(--text-3)',
                        }}
                      >
                        <CalendarIcon size={14} style={{ color: 'var(--text-3)', flexShrink: 0 }} />
                        {form.testDate
                          ? new Date(form.testDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })
                          : 'Pick a date'}
                      </button>
                    </Popover.Trigger>
                    <Popover.Portal>
                      <Popover.Content
                        align="start"
                        sideOffset={6}
                        className="z-[60] rounded-2xl p-4 shadow-2xl"
                        style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-md)', width: 300 }}
                      >
                        <Calendar
                          mode="single"
                          selected={form.testDate ? new Date(form.testDate + 'T00:00:00') : undefined}
                          onSelect={date => {
                            if (date) {
                              const iso = date.toLocaleDateString('en-CA');
                              setForm(f => ({ ...f, testDate: iso }));
                            }
                            setDatePickerOpen(false);
                          }}
                          disabled={{ before: minDate }}
                        />
                      </Popover.Content>
                    </Popover.Portal>
                  </Popover.Root>
                </div>

                {/* Study materials */}
                <div>
                  <label className="block text-xs font-medium mb-2 text-[var(--text-1)]">
                    Study Materials
                    {form.documentIds.length > 0 && (
                      <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px]" style={{ backgroundColor: 'rgba(255,101,0,0.12)', color: 'var(--brand)' }}>
                        {form.documentIds.length} selected
                      </span>
                    )}
                  </label>
                  {documents.length === 0 ? (
                    <p className="text-xs text-[var(--text-2)] py-2">No notes found. Upload notes in your Library first.</p>
                  ) : (
                    <div className="flex flex-col gap-1 max-h-44 overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin', scrollbarColor: 'var(--border-md) transparent' }}>
                      {documents.map(doc => {
                        const sel = form.documentIds.includes(doc.id);
                        return (
                          <button
                            key={doc.id}
                            onClick={() => toggleDoc(doc.id)}
                            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs text-left transition-colors w-full"
                            style={sel ? {
                              backgroundColor: '#ffffff',
                              color: '#000000',
                            } : {
                              backgroundColor: 'var(--bg-input)',
                              color: 'var(--text-2)',
                            }}
                            onMouseEnter={e => { if (!sel) e.currentTarget.style.backgroundColor = 'var(--bg-hover)'; }}
                            onMouseLeave={e => { if (!sel) e.currentTarget.style.backgroundColor = 'var(--bg-input)'; }}
                          >
                            <div
                              className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                              style={{ backgroundColor: sel ? 'rgba(0,0,0,0.12)' : 'var(--bg-card)' }}
                            >
                              {sel && <Check size={9} color="#000000" />}
                            </div>
                            <span className="truncate">{doc.title}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* CTA */}
                <div className="flex flex-col items-center gap-2 pt-1">
                  <Button
                    variant="brand"
                    size="lg"
                    onClick={handleCreate}
                    disabled={!form.title.trim() || !form.testDate || form.documentIds.length === 0}
                    className="w-full"
                  >
                    Generate Plan
                  </Button>
                  <button
                    onClick={() => { setShowCreate(false); setForm({ title: '', testDate: '', documentIds: [] }); }}
                    className="text-xs transition-opacity hover:opacity-60"
                    style={{ color: 'var(--text-3)' }}
                  >
                    Cancel
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
