'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ChevronDown, Check } from 'lucide-react';
import { Input } from '@/components/ui/Input';

const QUESTION_TYPES = [
  { value: 'multiple_choice', label: 'Multiple Choice' },
  { value: 'short_answer', label: 'Short Answer' },
  { value: 'true_false', label: 'True / False' },
];

const DURATIONS = [
  { value: 10, label: '10 min', sub: 'Quick' },
  { value: 25, label: '25 min', sub: 'Standard' },
  { value: 45, label: '45 min', sub: 'In-depth' },
  { value: 60, label: '1 hour', sub: 'Full exam' },
];

interface Props {
  open: boolean;
  onClose: () => void;
  onGenerate: (data: {
    title: string;
    documentIds: string[];
    questionTypes: string[];
    durationMinutes: number;
  }) => Promise<void>;
  documents: { id: string; title: string; status: string }[];
}

export default function GeneratePracticeExamModal({ open, onClose, onGenerate, documents }: Props) {
  const [title, setTitle] = useState('');
  const [docIds, setDocIds] = useState<string[]>([]);
  const [questionTypes, setQuestionTypes] = useState<string[]>(['multiple_choice', 'short_answer']);
  const [duration, setDuration] = useState(25);
  const [generating, setGenerating] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);

  const completeDocs = documents.filter(d => d.status === 'complete');

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setTitle('');
      setDocIds([]);
      setQuestionTypes(['multiple_choice', 'short_answer']);
      setDuration(25);
      setGenerating(false);
    }
  }, [open]);

  const toggleType = (t: string) =>
    setQuestionTypes(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);

  const toggleDoc = (id: string) =>
    setDocIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const handleGenerate = async () => {
    if (!title.trim() || !docIds.length || !questionTypes.length || generating) return;
    setGenerating(true);
    try {
      await onGenerate({ title: title.trim(), documentIds: docIds, questionTypes, durationMinutes: duration });
    } catch {
      setGenerating(false);
    }
  };

  const handleOpenChange = (next: boolean) => {
    if (!next && !generating) onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent onInteractOutside={e => { if (generating) e.preventDefault(); }}>
        <DialogHeader className="mb-5">
          <DialogTitle>Generate Practice Exam</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Title */}
          <div>
            <label className="text-xs text-[var(--text-1)] mb-1.5 block">Exam Title</label>
            <Input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Midterm Practice Exam"
            />
          </div>

          {/* Question Types */}
          <div>
            <label className="text-xs text-[var(--text-1)] mb-2 block">Question Types</label>
            <div className="flex flex-wrap gap-2">
              {QUESTION_TYPES.map(({ value, label }) => {
                const active = questionTypes.includes(value);
                return (
                  <button
                    key={value}
                    onClick={() => toggleType(value)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                    style={{
                      backgroundColor: active ? 'var(--brand)' : 'var(--bg-input)',
                      color: active ? '#fff' : 'var(--text-3)',
                    }}
                    onMouseEnter={e => { if (!active) e.currentTarget.style.backgroundColor = 'var(--bg-hover)'; }}
                    onMouseLeave={e => { if (!active) e.currentTarget.style.backgroundColor = 'var(--bg-input)'; }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="text-xs text-[var(--text-1)] mb-2 block">Exam Duration</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {DURATIONS.map(({ value, label, sub }) => {
                const active = duration === value;
                return (
                  <button
                    key={value}
                    onClick={() => setDuration(value)}
                    className="p-2 rounded-lg text-center transition-colors"
                    style={{ backgroundColor: active ? 'rgba(255,101,0,0.15)' : 'var(--bg-input)' }}
                    onMouseEnter={e => { if (!active) e.currentTarget.style.backgroundColor = 'var(--bg-hover)'; }}
                    onMouseLeave={e => { if (!active) e.currentTarget.style.backgroundColor = 'var(--bg-input)'; }}
                  >
                    <p className="text-xs font-medium" style={{ color: active ? '#fff' : 'var(--text-2)' }}>{label}</p>
                    <p className="text-xs mt-0.5" style={{ color: active ? 'rgba(255,255,255,0.7)' : 'var(--text-3)' }}>{sub}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes — simple toggle list */}
          <div>
            <label className="text-xs text-[var(--text-1)] mb-1.5 block">Select Notes</label>
            <button
              onClick={() => setNotesOpen(o => !o)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-colors"
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-md)',
                color: docIds.length ? 'var(--text-1)' : 'var(--text-3)',
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--brand)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-md)')}
            >
              <span>
                {docIds.length === 0 ? 'Select notes…' : `${docIds.length} note${docIds.length !== 1 ? 's' : ''} selected`}
              </span>
              <ChevronDown size={14} style={{ color: 'var(--text-3)', transform: notesOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s', flexShrink: 0 }} />
            </button>
            {notesOpen && (
              <div
                className="mt-1.5 rounded-xl overflow-y-auto"
                style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', maxHeight: 200 }}
              >
                {completeDocs.length === 0 ? (
                  <p className="text-[var(--text-3)] text-sm px-3 py-2">No completed notes found.</p>
                ) : (
                  completeDocs.map(d => {
                    const selected = docIds.includes(d.id);
                    return (
                      <button
                        key={d.id}
                        onClick={() => toggleDoc(d.id)}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left transition-colors"
                        style={{ color: 'var(--text-1)', backgroundColor: 'transparent' }}
                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        <span
                          className="w-4 h-4 rounded shrink-0 flex items-center justify-center transition-colors"
                          style={{
                            backgroundColor: selected ? 'var(--brand)' : 'transparent',
                            border: `1.5px solid ${selected ? 'var(--brand)' : 'var(--border-md)'}`,
                          }}
                        >
                          {selected && <Check size={10} color="#fff" strokeWidth={3} />}
                        </span>
                        <span className="truncate">{d.title}</span>
                      </button>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {generating && (
            <div className="flex items-center gap-3 text-[var(--text-2)] text-sm py-1">
              <div
                className="w-4 h-4 border-2 rounded-full animate-spin"
                style={{ borderColor: 'var(--brand)', borderTopColor: 'transparent' }}
              />
              Generating… this may take a minute
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-col items-center gap-3">
          <button
            onClick={handleGenerate}
            disabled={generating || !title.trim() || !docIds.length || !questionTypes.length}
            className="w-full py-2.5 rounded-xl text-white text-sm font-medium disabled:opacity-40 hover:opacity-90 transition-opacity"
            style={{ background: 'linear-gradient(135deg, #FF6500, #FF9A3C)' }}
          >
            {generating ? 'Generating…' : 'Generate Exam'}
          </button>
          <button
            onClick={() => { if (!generating) onClose(); }}
            disabled={generating}
            className="text-sm transition-colors disabled:opacity-40"
            style={{ color: 'var(--text-3)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-1)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-3)')}
          >
            Cancel
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
