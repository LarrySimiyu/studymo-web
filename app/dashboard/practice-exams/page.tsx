'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { practiceExamsApi, PracticeExam, ExamContent } from '@/lib/api/organization';
import { documentsApi } from '@/lib/api/documents';
import { ClipboardList } from 'lucide-react';
import { PageHeader } from '@/components/dashboard/PageHeader';

const PALETTE: [string, string][] = [
  ['#FF6500', 'rgba(255,101,0,0.12)'],
  ['#22C55E', 'rgba(34,197,94,0.12)'],
  ['#3B82F6', 'rgba(59,130,246,0.12)'],
  ['#F59E0B', 'rgba(245,158,11,0.12)'],
  ['#EC4899', 'rgba(236,72,153,0.12)'],
  ['#8B5CF6', 'rgba(139,92,246,0.12)'],
  ['#14B8A6', 'rgba(20,184,166,0.12)'],
];

function getPalette(id: string): [string, string] {
  const hash = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return PALETTE[hash % PALETTE.length];
}

function ExamMenu({ onDelete }: { onDelete: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleMouseEnter() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  }
  function handleMouseLeave() {
    closeTimer.current = setTimeout(() => setOpen(false), 150);
  }

  return (
    <div className="relative shrink-0" ref={ref} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <button
        className="p-1.5 rounded-lg transition-colors"
        style={{ color: 'var(--text-3)' }}
        onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-1)')}
        onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-3)')}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" />
        </svg>
      </button>
      {open && (
        <div
          className="absolute right-0 top-full mt-1 z-[9999] rounded-xl shadow-xl py-1 min-w-[120px]"
          style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          <button
            onClick={() => { setOpen(false); onDelete(); }}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors"
            style={{ backgroundColor: 'transparent', color: '#f87171' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
            </svg>
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

const QUESTION_TYPES = [
  { value: 'multiple_choice', label: 'Multiple Choice' },
  { value: 'short_answer', label: 'Short Answer' },
  { value: 'true_false', label: 'True / False' },
];

const DURATIONS = [
  { value: 10, label: '10 min', sub: 'Quick review' },
  { value: 25, label: '25 min', sub: 'Standard' },
  { value: 45, label: '45 min', sub: 'In-depth' },
  { value: 60, label: '1 hour', sub: 'Full exam' },
];

export default function PracticeExamsPage() {
  const router = useRouter();
  const [exams, setExams] = useState<PracticeExam[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [examTitle, setExamTitle] = useState('');
  const [examDocIds, setExamDocIds] = useState<string[]>([]);
  const [questionTypes, setQuestionTypes] = useState<string[]>(['multiple_choice', 'short_answer']);
  const [durationMinutes, setDurationMinutes] = useState<number>(25);
  const [generating, setGenerating] = useState(false);
  const [allDocs, setAllDocs] = useState<{ id: string; title: string; status: string }[]>([]);

  const load = useCallback(async () => {
    const [examsRes, docsRes] = await Promise.all([
      practiceExamsApi.getAll(),
      documentsApi.getAll(),
    ]);
    if (examsRes.data) setExams(examsRes.data);
    if (docsRes.data) setAllDocs(docsRes.data.map(d => ({ id: d.id, title: d.title, status: d.status })));
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggleType = (t: string) =>
    setQuestionTypes(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);

  const handleGenerate = async () => {
    if (!examTitle.trim() || !examDocIds.length || !questionTypes.length || generating) return;
    setGenerating(true);
    const { data, error } = await practiceExamsApi.create({
      title: examTitle.trim(),
      documentIds: examDocIds,
      questionTypes,
      durationMinutes,
    });
    setGenerating(false);
    if (error || !data) { alert(error || 'Failed to generate exam'); return; }
    setShowModal(false);
    router.push(`/dashboard/practice-exams/${data.id}`);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this exam?')) return;
    await practiceExamsApi.delete(id);
    load();
  };

  const openModal = () => {
    setExamTitle('');
    setExamDocIds([]);
    setQuestionTypes(['multiple_choice', 'short_answer']);
    setDurationMinutes(25);
    setShowModal(true);
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <PageHeader
        title="Practice Exams"
        action={{ label: 'New Exam', onClick: openModal }}
      />

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--brand)', borderTopColor: 'transparent' }} />
        </div>
      ) : exams.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">📝</div>
          <p className="text-[var(--text-2)] mb-2">No practice exams yet</p>
          <p className="text-[var(--text-3)] text-sm mb-6">Generate an exam from your notes</p>
          <button
            onClick={openModal}
            className="px-5 py-2.5 rounded-xl text-sm font-medium text-white hover:opacity-90 transition-opacity"
            style={{ background: 'linear-gradient(135deg, #FF6500, #FF9A3C)' }}
          >
            Generate Your First Exam
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {exams.map(exam => {
            let examData: Partial<ExamContent> = {};
            try { examData = typeof exam.questions === 'string' ? JSON.parse(exam.questions) : exam.questions as ExamContent; } catch { examData = {}; }
            let docIds: string[] = [];
            try { docIds = JSON.parse(exam.documentIds); } catch { docIds = []; }
            const examDocs = (exam.documents ?? []).length > 0
              ? exam.documents!
              : allDocs.filter(d => docIds.includes(d.id));

            const [iconColor, iconBg] = getPalette(exam.id);
            const totalQuestions = (examData as ExamContent).sections?.reduce((s, sec) => s + (sec.questions?.length ?? 0), 0) ?? 0;

            return (
              <div
                key={exam.id}
                className="relative flex items-center gap-4 p-5 rounded-xl transition-colors"
                style={{ backgroundColor: 'var(--bg-card)' }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--bg-card)')}
              >
                {/* Icon */}
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: iconBg }}
                >
                  <ClipboardList size={26} style={{ color: iconColor }} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-[var(--text-1)] font-bold text-sm leading-snug">{exam.title}</p>

                  {/* Stats row */}
                  <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                    <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-3)' }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                      {examData.estimatedMinutes ?? '?'} min
                    </span>
                    <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-3)' }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                      {examData.totalPoints ?? '?'} pts
                    </span>
                    {totalQuestions > 0 && (
                      <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-3)' }}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                        {totalQuestions} questions
                      </span>
                    )}
                  </div>

                  {/* Source note pills */}
                  {examDocs.length > 0 && (
                    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                      {examDocs.map(d => (
                        <span
                          key={d.id}
                          className="text-[10px] px-2 py-0.5 rounded-full truncate max-w-[160px]"
                          style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-3)' }}
                        >
                          {d.title}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Date */}
                  <p className="text-[10px] mt-1.5" style={{ color: 'var(--text-3)' }}>
                    {new Date(exam.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>

                {/* Three-dot menu — top right */}
                <div className="absolute top-3 right-3">
                  <ExamMenu onDelete={() => handleDelete(exam.id)} />
                </div>

                {/* Start button */}
                <div className="shrink-0">
                  <button
                    onClick={() => router.push(`/dashboard/practice-exams/${exam.id}?start=1`)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-white hover:opacity-90 transition-opacity"
                    style={{ background: 'linear-gradient(135deg, #FF6500, #FF9A3C)' }}
                  >
                    Start
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}>
          <div className="rounded-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto" style={{ backgroundColor: 'var(--bg-card)' }}>
            <div className="flex justify-between mb-5">
              <h3 className="font-semibold text-[var(--text-1)]">Generate Practice Exam</h3>
              <button onClick={() => setShowModal(false)} className="text-[var(--text-2)] hover:text-[var(--text-1)] text-xl leading-none">×</button>
            </div>
            <div className="space-y-5">
              <div>
                <label className="text-xs text-[var(--text-2)] mb-1 block">Exam Title *</label>
                <input
                  value={examTitle}
                  onChange={e => setExamTitle(e.target.value)}
                  placeholder="e.g. Midterm Practice Exam"
                  className="w-full rounded-lg px-3 py-2 text-sm text-[var(--text-1)] outline-none"
                  style={{ backgroundColor: 'var(--bg-input)' }}
                />
              </div>

              <div>
                <label className="text-xs text-[var(--text-2)] mb-2 block">Question Types *</label>
                <div className="flex flex-wrap gap-2">
                  {QUESTION_TYPES.map(({ value, label }) => {
                    const active = questionTypes.includes(value);
                    return (
                      <button
                        key={value}
                        onClick={() => toggleType(value)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                        style={{
                          backgroundColor: active ? 'var(--brand)' : 'var(--bg-input)',
                          color: active ? '#fff' : 'var(--text-3)',
                        }}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-xs text-[var(--text-2)] mb-2 block">Exam Duration *</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {DURATIONS.map(({ value, label, sub }) => {
                    const active = durationMinutes === value;
                    return (
                      <button
                        key={value}
                        onClick={() => setDurationMinutes(value)}
                        className="p-2 rounded-lg text-center transition-all"
                        style={{ backgroundColor: active ? 'rgba(255,101,0,0.15)' : 'var(--bg-input)' }}
                      >
                        <p className="text-xs font-medium" style={{ color: active ? 'var(--brand)' : 'var(--text-2)' }}>{label}</p>
                        <p className="text-xs mt-0.5" style={{ color: active ? 'var(--brand)' : 'var(--text-3)' }}>{sub}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-xs text-[var(--text-2)] mb-1 block">Select Notes *</label>
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {allDocs.filter(d => d.status === 'complete').map(d => (
                    <label
                      key={d.id}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer transition-colors"
                      style={{ backgroundColor: 'var(--bg-input)' }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--bg-input)')}
                    >
                      <input
                        type="checkbox"
                        checked={examDocIds.includes(d.id)}
                        onChange={e => setExamDocIds(prev => e.target.checked ? [...prev, d.id] : prev.filter(x => x !== d.id))}
                        className="accent-[#FF6500]"
                      />
                      <span className="text-sm text-[var(--text-2)] truncate">{d.title}</span>
                    </label>
                  ))}
                  {allDocs.filter(d => d.status === 'complete').length === 0 && (
                    <p className="text-[var(--text-3)] text-sm px-3">No completed notes found.</p>
                  )}
                </div>
              </div>

              {generating && (
                <div className="flex items-center gap-3 text-[var(--text-2)] text-sm py-1">
                  <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--brand)', borderTopColor: 'transparent' }} />
                  Generating… this may take a minute
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2 rounded-lg text-[var(--text-2)] text-sm transition-colors"
                style={{ backgroundColor: 'var(--bg-input)' }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--bg-input)')}
              >
                Cancel
              </button>
              <button
                onClick={handleGenerate}
                disabled={generating || !examTitle.trim() || !examDocIds.length || !questionTypes.length}
                className="flex-1 py-2 rounded-lg text-white text-sm disabled:opacity-40 hover:opacity-90 transition-opacity"
                style={{ background: 'linear-gradient(135deg, #FF6500, #FF9A3C)' }}
              >
                {generating ? 'Generating…' : 'Generate Exam'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
