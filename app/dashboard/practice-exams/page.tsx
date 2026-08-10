'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { practiceExamsApi, PracticeExam, ExamContent } from '@/lib/api/organization';
import { documentsApi } from '@/lib/api/documents';
import { ClipboardList, Clock, Star, List, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/dashboard/PageHeader';
import PageShell from '@/components/dashboard/PageShell';
import EmptyState from '@/components/dashboard/EmptyState';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import RowActionsMenu from '@/components/ui/RowActionsMenu';
import { Button } from '@/components/ui/Button';
import DeleteConfirmModal from '@/components/library/DeleteConfirmModal';
import GeneratePracticeExamModal from '@/components/practice-exams/GeneratePracticeExamModal';
import { getPalette } from '@/components/dashboard/PlanCard';

export default function PracticeExamsPage() {
  const router = useRouter();
  const [exams, setExams] = useState<PracticeExam[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [allDocs, setAllDocs] = useState<{ id: string; title: string; status: string }[]>([]);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

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

  const handleGenerate = async (form: { title: string; documentIds: string[]; questionTypes: string[]; durationMinutes: number }) => {
    const { data, error } = await practiceExamsApi.create(form);
    if (error || !data) { alert(error || 'Failed to generate exam'); throw new Error(error ?? 'Failed'); }
    setShowModal(false);
    load();
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    await practiceExamsApi.delete(pendingDelete);
    setDeleting(false);
    setPendingDelete(null);
    load();
  };

  const openModal = () => setShowModal(true);

  return (
    <PageShell
      width="xl"
      header={<PageHeader title="Practice Exams" action={{ label: 'New Exam', onClick: openModal }} />}
    >

      {loading ? (
        <LoadingSpinner size="lg" />
      ) : exams.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          accent="#8B5CF6"
          accentBg="rgba(139,92,246,0.12)"
          title="No Practice Exams"
          description="Simulate real exam conditions and boost your confidence before test day."
          action={{ label: 'Generate Exam', onClick: openModal }}
        />
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
                className="relative flex items-center gap-4 rounded-xl bg-[var(--bg-card)] p-5 transition-colors hover:bg-[var(--bg-hover)]"
              >
                <div
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: iconBg }}
                >
                  <ClipboardList size={26} style={{ color: iconColor }} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-body-sm font-semibold leading-snug text-[var(--text-1)]">{exam.title}</p>

                  <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-[var(--text-3)]">
                    <span className="flex items-center gap-1">
                      <Clock size={11} />
                      {examData.estimatedMinutes ?? '?'} min
                    </span>
                    <span className="flex items-center gap-1">
                      <Star size={11} />
                      {examData.totalPoints ?? '?'} pts
                    </span>
                    {totalQuestions > 0 && (
                      <span className="flex items-center gap-1">
                        <List size={11} />
                        {totalQuestions} questions
                      </span>
                    )}
                  </div>

                  {examDocs.length > 0 && (
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      {examDocs.map(d => (
                        <span
                          key={d.id}
                          className="max-w-[160px] truncate rounded-full bg-[var(--bg-input)] px-2 py-0.5 text-2xs text-[var(--text-3)]"
                        >
                          {d.title}
                        </span>
                      ))}
                    </div>
                  )}

                  <p className="mt-1.5 text-2xs text-[var(--text-3)]">
                    {new Date(exam.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>

                <div className="absolute right-3 top-3">
                  <RowActionsMenu
                    actions={[{ label: 'Delete', icon: Trash2, danger: true, onSelect: () => setPendingDelete(exam.id) }]}
                  />
                </div>

                <Button
                  variant="primary"
                  size="xs"
                  className="shrink-0"
                  onClick={() => router.push(`/dashboard/practice-exams/${exam.id}?start=1`)}
                >
                  Start
                </Button>
              </div>
            );
          })}
        </div>
      )}

      <GeneratePracticeExamModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onGenerate={handleGenerate}
        documents={allDocs}
      />

      <DeleteConfirmModal
        open={!!pendingDelete}
        deleting={deleting}
        title="Delete this exam?"
        description="This action cannot be undone. The exam and any recorded attempts will be permanently deleted."
        onConfirm={confirmDelete}
        onClose={() => setPendingDelete(null)}
      />
    </PageShell>
  );
}
