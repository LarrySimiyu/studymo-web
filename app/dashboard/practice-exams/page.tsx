'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { practiceExamsApi, PracticeExam, ExamContent } from '@/lib/api/organization';
import { documentsApi } from '@/lib/api/documents';

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
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-1)]">Practice Exams</h1>
          <p className="text-[var(--text-2)] text-sm mt-1">{exams.length} exam{exams.length !== 1 ? 's' : ''} generated</p>
        </div>
        <button onClick={openModal}
          className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-[#9747FF] hover:bg-[#8535ee] transition-colors">
          New Exam
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#9747FF] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : exams.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">📝</div>
          <p className="text-[var(--text-2)] mb-2">No practice exams yet</p>
          <p className="text-[var(--text-3)] text-sm mb-6">Generate an exam from your study documents</p>
          <button onClick={openModal}
            className="px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-[#9747FF] hover:bg-[#8535ee]">
            Generate Your First Exam
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {exams.map(exam => {
            let examData: Partial<ExamContent> = {};
            try { examData = typeof exam.questions === 'string' ? JSON.parse(exam.questions) : exam.questions as ExamContent; } catch { examData = {}; }
            let docIds: string[] = [];
            try { docIds = JSON.parse(exam.documentIds); } catch { docIds = []; }
            const examDocs = (exam.documents ?? []).length > 0
              ? exam.documents!
              : allDocs.filter(d => docIds.includes(d.id));

            return (
              <div key={exam.id} className="flex items-center gap-4 p-4 rounded-xl"
                style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <div className="flex-1 min-w-0">
                  <p className="text-[var(--text-1)] font-medium text-sm">{exam.title}</p>
                  <p className="text-[var(--text-3)] text-xs mt-0.5">
                    ~{examData.estimatedMinutes ?? '?'} min · {examData.totalPoints ?? '?'} pts
                  </p>
                  {examDocs.length > 0 && (
                    <p className="text-[var(--text-3)] text-xs mt-0.5 truncate">
                      {examDocs.map(d => d.title).join(', ')}
                    </p>
                  )}
                  <p className="text-[var(--text-3)] text-xs mt-0.5">{new Date(exam.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => router.push(`/dashboard/practice-exams/${exam.id}`)}
                    className="px-3 py-1.5 rounded-lg text-xs text-[#9747FF] border border-[#9747FF]/30 hover:bg-[#9747FF]/10 transition-colors">
                    Open
                  </button>
                  <button onClick={() => handleDelete(exam.id)}
                    className="px-3 py-1.5 rounded-lg text-xs text-red-400 border border-red-400/20 hover:bg-red-400/10 transition-colors">
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}>
          <div className="border border-black/10 rounded-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto" style={{ backgroundColor: 'var(--bg-card)' }}>
            <div className="flex justify-between mb-5">
              <h3 className="font-semibold text-[var(--text-1)]">Generate Practice Exam</h3>
              <button onClick={() => setShowModal(false)} className="text-[var(--text-2)] hover:text-[var(--text-1)] text-xl leading-none">×</button>
            </div>
            <div className="space-y-5">
              <div>
                <label className="text-xs text-[var(--text-2)] mb-1 block">Exam Title *</label>
                <input value={examTitle} onChange={e => setExamTitle(e.target.value)}
                  placeholder="e.g. Midterm Practice Exam"
                  className="w-full border rounded-lg px-3 py-2 text-sm text-[var(--text-1)] outline-none focus:border-[#9747FF]/50"
                  style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border)' }} />
              </div>

              <div>
                <label className="text-xs text-[var(--text-2)] mb-2 block">Question Types *</label>
                <div className="flex flex-wrap gap-2">
                  {QUESTION_TYPES.map(({ value, label }) => (
                    <button key={value} onClick={() => toggleType(value)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-all"
                      style={{
                        backgroundColor: questionTypes.includes(value) ? 'var(--brand-subtle)' : 'transparent',
                        borderColor: questionTypes.includes(value) ? '#9747FF' : 'var(--border-md)',
                        color: questionTypes.includes(value) ? 'var(--text-1)' : 'var(--text-3)',
                      }}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-[var(--text-2)] mb-2 block">Exam Duration *</label>
                <div className="grid grid-cols-4 gap-2">
                  {DURATIONS.map(({ value, label, sub }) => (
                    <button key={value} onClick={() => setDurationMinutes(value)}
                      className="p-2 rounded-lg border text-center transition-all"
                      style={{
                        backgroundColor: durationMinutes === value ? 'var(--brand-subtle)' : 'transparent',
                        borderColor: durationMinutes === value ? '#9747FF' : 'var(--border-md)',
                      }}>
                      <p className="text-xs font-medium" style={{ color: durationMinutes === value ? 'var(--text-1)' : 'var(--text-2)' }}>{label}</p>
                      <p className="text-xs mt-0.5" style={{ color: durationMinutes === value ? '#9747FF' : 'var(--text-3)' }}>{sub}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-[var(--text-2)] mb-1 block">Select Documents *</label>
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {allDocs.filter(d => d.status === 'complete').map(d => (
                    <label key={d.id} className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-black/5 cursor-pointer">
                      <input type="checkbox" checked={examDocIds.includes(d.id)}
                        onChange={e => setExamDocIds(prev => e.target.checked ? [...prev, d.id] : prev.filter(x => x !== d.id))}
                        className="accent-[#9747FF]" />
                      <span className="text-sm text-[var(--text-2)] truncate">{d.title}</span>
                    </label>
                  ))}
                  {allDocs.filter(d => d.status === 'complete').length === 0 && (
                    <p className="text-[var(--text-3)] text-sm px-3">No completed documents found.</p>
                  )}
                </div>
              </div>

              {generating && (
                <div className="flex items-center gap-3 text-[var(--text-2)] text-sm py-1">
                  <div className="w-4 h-4 border-2 border-[#9747FF] border-t-transparent rounded-full animate-spin" />
                  Generating… this may take a minute
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowModal(false)}
                className="flex-1 py-2 rounded-lg border text-[var(--text-2)] text-sm" style={{ borderColor: 'var(--border)' }}>Cancel</button>
              <button onClick={handleGenerate}
                disabled={generating || !examTitle.trim() || !examDocIds.length || !questionTypes.length}
                className="flex-1 py-2 rounded-lg bg-[#9747FF] text-white text-sm disabled:opacity-40">
                {generating ? 'Generating…' : 'Generate Exam'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
