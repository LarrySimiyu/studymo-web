'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { practiceExamsApi, PracticeExam, ExamContent } from '@/lib/api/organization';
import { documentsApi } from '@/lib/api/documents';

export default function PracticeExamsPage() {
  const router = useRouter();
  const [exams, setExams] = useState<PracticeExam[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [examTitle, setExamTitle] = useState('');
  const [examDocIds, setExamDocIds] = useState<string[]>([]);
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

  const handleGenerate = async () => {
    if (!examTitle.trim() || !examDocIds.length || generating) return;
    setGenerating(true);
    const { data, error } = await practiceExamsApi.create({ title: examTitle.trim(), documentIds: examDocIds });
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

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Practice Exams</h1>
          <p className="text-white/40 text-sm mt-1">{exams.length} exam{exams.length !== 1 ? 's' : ''} generated</p>
        </div>
        <button onClick={() => { setExamTitle(''); setExamDocIds([]); setShowModal(true); }}
          className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-[#9747FF] hover:bg-[#8535ee] transition-colors">
          Generate New Exam
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#9747FF] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : exams.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">📝</div>
          <p className="text-white/50 mb-2">No practice exams yet</p>
          <p className="text-white/30 text-sm mb-6">Generate a comprehensive exam from your study notes</p>
          <button onClick={() => { setExamTitle(''); setExamDocIds([]); setShowModal(true); }}
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
                style={{ backgroundColor: '#1A1A1A', border: '1px solid #2A2A2A' }}>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm">{exam.title}</p>
                  <p className="text-white/30 text-xs mt-0.5">
                    {examData.totalPoints ?? 100} pts · ~{examData.estimatedMinutes ?? 60} min
                  </p>
                  {examDocs.length > 0 && (
                    <p className="text-white/20 text-xs mt-0.5 truncate">
                      From: {examDocs.map(d => d.title).join(', ')}
                    </p>
                  )}
                  <p className="text-white/20 text-xs mt-0.5">{new Date(exam.createdAt).toLocaleDateString()}</p>
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

      {/* Generate Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-[#1A1A1A] border border-white/10 rounded-2xl w-full max-w-md p-6">
            <div className="flex justify-between mb-5">
              <h3 className="font-semibold text-white">Generate Practice Exam</h3>
              <button onClick={() => setShowModal(false)} className="text-white/40 hover:text-white text-xl leading-none">×</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-white/50 mb-1 block">Exam Title *</label>
                <input value={examTitle} onChange={e => setExamTitle(e.target.value)}
                  placeholder="e.g. Midterm Practice Exam"
                  className="w-full bg-[#2A2A2A] border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#9747FF]/50" />
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1 block">Select Documents *</label>
                <div className="space-y-1.5 max-h-52 overflow-y-auto">
                  {allDocs.filter(d => d.status === 'complete').map(d => (
                    <label key={d.id} className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/5 cursor-pointer">
                      <input type="checkbox" checked={examDocIds.includes(d.id)}
                        onChange={e => setExamDocIds(prev => e.target.checked ? [...prev, d.id] : prev.filter(x => x !== d.id))}
                        className="accent-[#9747FF]" />
                      <span className="text-sm text-white/70 truncate">{d.title}</span>
                    </label>
                  ))}
                  {allDocs.filter(d => d.status === 'complete').length === 0 && (
                    <p className="text-white/30 text-sm px-3">No completed documents found.</p>
                  )}
                </div>
              </div>
              {generating && (
                <div className="flex items-center gap-3 text-white/50 text-sm py-1">
                  <div className="w-4 h-4 border-2 border-[#9747FF] border-t-transparent rounded-full animate-spin" />
                  Generating… this may take a minute
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowModal(false)}
                className="flex-1 py-2 rounded-lg border border-white/10 text-white/50 text-sm">Cancel</button>
              <button onClick={handleGenerate}
                disabled={generating || !examTitle.trim() || !examDocIds.length}
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
