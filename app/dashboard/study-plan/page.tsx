'use client';

import { useEffect, useState } from 'react';
import { studyPlansApi, StudyPlan } from '@/lib/api/studyPlan';
import { api } from '@/lib/api';

interface Document { id: string; title: string }

export default function StudyPlanPage() {
  const [plans, setPlans] = useState<StudyPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);

  const [form, setForm] = useState({ title: '', testDate: '', documentIds: [] as string[] });

  useEffect(() => {
    Promise.all([
      studyPlansApi.getAll(),
      api.get<Document[]>('/documents'),
    ]).then(([p, d]) => {
      if (p.data) setPlans(p.data);
      if (d.data) setDocuments(d.data);
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
    } catch {
      // ignore
    } finally {
      setCreating(false);
    }
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

  function daysColor(days: number) {
    if (days <= 3) return '#EF4444';
    if (days <= 7) return '#F59E0B';
    return '#22C55E';
  }

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateStr = minDate.toISOString().split('T')[0];

  return (
    <div className="max-w-4xl mx-auto py-2">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-1)]">Study Plans</h1>
          <p className="text-[var(--text-2)] text-sm mt-0.5">AI-generated day-by-day schedules for your upcoming tests</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 rounded-xl text-xs font-semibold text-white hover:opacity-90 transition-opacity"
          style={{ background: 'linear-gradient(135deg, #9747FF 0%, #6366f1 100%)' }}
        >
          New Plan
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-28 rounded-xl animate-pulse" style={{ backgroundColor: 'var(--bg-card)' }} />
          ))}
        </div>
      ) : plans.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center rounded-xl" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-4" style={{ backgroundColor: 'var(--bg-input)' }}>📅</div>
          <h2 className="text-lg font-semibold text-[var(--text-1)] mb-1">No study plans yet</h2>
          <p className="text-[var(--text-2)] text-sm mb-6 max-w-xs">Create a plan by selecting your study materials and test date. AI will generate a day-by-day schedule.</p>
          <button
            onClick={() => setShowCreate(true)}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white hover:opacity-90 transition-opacity"
            style={{ background: 'linear-gradient(135deg, #9747FF 0%, #6366f1 100%)' }}
          >
            Create Study Plan
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {plans.map(plan => {
            const days = plan.daysUntilTest ?? 0;
            const entries = plan.dayEntries ?? [];
            const done = entries.filter(d => d.completed).length;
            const pct = entries.length > 0 ? Math.round((done / entries.length) * 100) : 0;
            return (
              <div key={plan.id} className="rounded-xl p-5" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base font-semibold text-[var(--text-1)] truncate">{plan.title}</h3>
                      {days >= 0 && (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full shrink-0" style={{ backgroundColor: `${daysColor(days)}20`, color: daysColor(days) }}>
                          {days === 0 ? 'Today!' : `${days}d left`}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[var(--text-2)] mb-3">
                      Test date: {new Date(plan.testDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      &nbsp;&middot;&nbsp;{entries.length} days &middot; {done} completed
                    </p>
                    <div className="h-1.5 rounded-full" style={{ backgroundColor: 'var(--border)' }}>
                      <div className="h-1.5 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: '#9747FF' }} />
                    </div>
                    <p className="text-xs text-[var(--text-2)] mt-1">{pct}% complete</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <a
                      href={`/dashboard/study-plan/${plan.id}`}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium text-white hover:opacity-90 transition-opacity"
                      style={{ backgroundColor: '#9747FF' }}
                    >
                      View Plan
                    </a>
                    <button
                      onClick={() => handleDelete(plan.id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                      style={{ color: '#EF4444', border: '1px solid var(--danger-border)' }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}>
          <div className="w-full max-w-lg rounded-2xl p-6" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <h2 className="text-lg font-semibold text-[var(--text-1)] mb-5">Create Study Plan</h2>

            {creating ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-12 h-12 rounded-full border-2 border-purple-500 border-t-transparent animate-spin mb-4" />
                <p className="text-[var(--text-1)] font-medium">Generating your plan...</p>
                <p className="text-[var(--text-2)] text-sm mt-1">AI is creating a day-by-day schedule</p>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Title */}
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-2)' }}>Plan title</label>
                  <input
                    value={form.title}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    placeholder="e.g., Biology Midterm Prep"
                    className="w-full px-3 py-2.5 rounded-lg text-xs text-[var(--text-1)] placeholder-[var(--text-3)] outline-none focus-within:ring-1 focus-within:ring-[#9747FF]/50"
                    style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border)' }}
                  />
                </div>

                {/* Test date */}
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-2)' }}>Test date</label>
                  <input
                    type="date"
                    value={form.testDate}
                    min={minDateStr}
                    onChange={e => setForm(f => ({ ...f, testDate: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-lg text-xs text-[var(--text-1)] outline-none"
                    style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border)', colorScheme: 'dark' } as React.CSSProperties}
                  />
                </div>

                {/* Study materials */}
                <div>
                  <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-2)' }}>
                    Study materials
                    {form.documentIds.length > 0 && (
                      <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px]" style={{ backgroundColor: 'var(--brand-subtle)', color: '#9747FF' }}>
                        {form.documentIds.length} selected
                      </span>
                    )}
                  </label>
                  {documents.length === 0 ? (
                    <p className="text-xs py-2" style={{ color: 'var(--text-2)' }}>No notes available. Upload notes in your Library first.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {documents.map(doc => {
                        const selected = form.documentIds.includes(doc.id);
                        return (
                          <button
                            key={doc.id}
                            onClick={() => toggleDoc(doc.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all hover:opacity-90"
                            style={selected ? {
                              backgroundColor: 'var(--brand-subtle)',
                              border: '1px solid var(--brand-border)',
                              color: '#9747FF',
                            } : {
                              backgroundColor: 'var(--bg-input)',
                              border: '1px solid var(--border)',
                              color: 'var(--text-2)',
                            }}
                          >
                            {selected && (
                              <svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M2 6l3 3 5-5" />
                              </svg>
                            )}
                            <span className="max-w-[160px] truncate">{doc.title}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col items-center gap-3 pt-1">
                  <button
                    onClick={handleCreate}
                    disabled={!form.title.trim() || !form.testDate || form.documentIds.length === 0}
                    className="w-full py-2.5 rounded-xl text-xs font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ background: 'linear-gradient(135deg, #9747FF 0%, #6366f1 100%)' }}
                  >
                    Generate Plan
                  </button>
                  <button
                    onClick={() => { setShowCreate(false); setForm({ title: '', testDate: '', documentIds: [] }); }}
                    className="text-xs transition-colors hover:opacity-70"
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
