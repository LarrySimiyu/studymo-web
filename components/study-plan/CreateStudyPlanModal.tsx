'use client';

import { useEffect, useState } from 'react';
import { studyPlansApi, StudyPlan } from '@/lib/api/studyPlan';
import { api } from '@/lib/api';
import { CalendarIcon, Check } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import UsageCounter from '@/components/dashboard/UsageCounter';
import { Calendar } from '@/components/ui/calendar';
import * as Popover from '@radix-ui/react-popover';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface Document { id: string; title: string; status: string }

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: (plan: StudyPlan) => void;
}

export default function CreateStudyPlanModal({ open, onClose, onCreated }: Props) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [form, setForm] = useState({ title: '', testDate: '', documentIds: [] as string[] });
  const [creating, setCreating] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm({ title: '', testDate: '', documentIds: [] });
    setCreating(false);
    api.get<Document[]>('/documents').then(({ data }) => {
      if (data) setDocuments(data.filter(d => d.status === 'complete'));
    }).catch(() => {});
  }, [open]);

  async function handleCreate() {
    if (!form.title.trim() || !form.testDate || form.documentIds.length === 0) return;
    setCreating(true);
    try {
      const { data: plan, error } = await studyPlansApi.create(form);
      if (error || !plan) throw new Error(error ?? 'Failed');
      onCreated(plan);
      onClose();
    } catch {}
    finally { setCreating(false); }
  }

  function toggleDoc(id: string) {
    setForm(f => ({
      ...f,
      documentIds: f.documentIds.includes(id) ? f.documentIds.filter(d => d !== id) : [...f.documentIds, id],
    }));
  }

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 2);

  return (
    <Dialog open={open} onOpenChange={o => { if (!o && !creating) onClose(); }}>
      <DialogContent>
        <DialogHeader className="mb-5 gap-1">
          <DialogTitle className="text-body-lg font-bold">New Study Plan</DialogTitle>
          <DialogDescription className="text-xs text-[var(--text-3)]">
            AI will generate a day-by-day schedule for you.
          </DialogDescription>
        </DialogHeader>

        {creating ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin mb-4" style={{ borderColor: 'var(--brand)', borderTopColor: 'transparent' }} />
            <p className="text-[var(--text-1)] font-medium text-sm">Generating your plan…</p>
            <p className="text-[var(--text-2)] text-xs mt-1">This may take a few seconds</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1.5 text-[var(--text-1)]">Plan Title</label>
              <Input
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="e.g., Biology Midterm Prep"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5 text-[var(--text-1)]">Test Date</label>
              <Popover.Root open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                <Popover.Trigger asChild>
                  <button
                    className={cn(
                      'flex w-full items-center gap-2.5 rounded-xl border border-[var(--border-md)] bg-[var(--bg-card)] px-3 py-2.5 text-left text-body-sm transition-colors hover:border-[var(--brand)]',
                      form.testDate ? 'text-[var(--text-1)]' : 'text-[var(--text-3)]'
                    )}
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

            <div>
              <label className="block text-xs font-medium mb-2 text-[var(--text-1)]">
                Study Materials
                {form.documentIds.length > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-2xs" style={{ backgroundColor: 'rgba(255,101,0,0.12)', color: 'var(--brand)' }}>
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
                          backgroundColor: 'var(--brand-subtle)',
                          color: 'var(--brand-ink)',
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

            <div className="flex flex-col items-center gap-2 pt-1">
              <Button
                variant="primary"
                size="lg"
                onClick={handleCreate}
                disabled={!form.title.trim() || !form.testDate || form.documentIds.length === 0}
                className="w-full"
              >
                Generate Plan
              </Button>
              <UsageCounter limitKey="studyPlans" />
              <Button variant="link" size="link" className="text-xs" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
