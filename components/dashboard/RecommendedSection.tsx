'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CalendarDays, Heart, ClipboardList, FileText, Upload, Mic, PenLine, Youtube } from 'lucide-react';
import { documentsApi } from '@/lib/api/documents';
import { practiceExamsApi } from '@/lib/api/organization';
import GeneratePracticeExamModal from '@/components/practice-exams/GeneratePracticeExamModal';
import UploadDialog, { UploadType } from '@/components/upload/UploadDialog';
import CreateStudyPlanModal from '@/components/study-plan/CreateStudyPlanModal';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';


const UPLOAD_OPTIONS: { type: UploadType; icon: React.ReactNode; label: string }[] = [
  { type: 'blank',  icon: <PenLine  size={22} color="#8B5CF6" />,  label: 'New Note'         },
  { type: 'file',   icon: <Upload   size={22} color="#FF6500" />,  label: 'Upload File'      },
  { type: 'record', icon: <Mic      size={22} color="#EC4899" />,  label: 'Record Audio'     },
  { type: 'video',  icon: <Youtube  size={22} color="#3B82F6" />,  label: 'Upload Video URL' },
];

const ICON_BG: Record<UploadType, string> = {
  file:    'rgba(255,101,0,0.12)',
  video:   'rgba(59,130,246,0.12)',
  record:  'rgba(236,72,153,0.12)',
  blank:   'rgba(139,92,246,0.12)',
  webpage: 'rgba(20,184,166,0.12)',
};

export default function RecommendedSection() {
  const router = useRouter();

  // Practice exam modal
  const [showExamModal, setShowExamModal] = useState(false);
  const [examDocs, setExamDocs] = useState<{ id: string; title: string; status: string }[]>([]);

  // Study plan modal
  const [showPlanModal, setShowPlanModal] = useState(false);

  // Upload flow: type picker → upload modal
  const [showTypePicker, setShowTypePicker] = useState(false);
  const [uploadType, setUploadType] = useState<UploadType | null>(null);

  const handlePracticeExamClick = async () => {
    const { data } = await documentsApi.getAll().catch(() => ({ data: null }));
    setExamDocs((data ?? []).map(d => ({ id: d.id, title: d.title, status: d.status })));
    setShowExamModal(true);
  };

  const handleExamGenerate = async (form: { title: string; documentIds: string[]; questionTypes: string[]; durationMinutes: number }) => {
    const { data, error } = await practiceExamsApi.create(form);
    if (error || !data) { alert(error || 'Failed to generate exam'); throw new Error(error ?? 'Failed'); }
    setShowExamModal(false);
    router.push('/dashboard/practice-exams');
  };

  const handleSelectType = (type: UploadType) => {
    setUploadType(type);
    setShowTypePicker(false);
  };

  return (
    <>
      <div>
        <h2 className="text-xs font-medium text-[var(--text-2)] mb-2">For You</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">

          {/* New Note */}
          <button
            onClick={() => setShowTypePicker(true)}
            className="flex items-center gap-3 px-4 py-2 rounded-xl transition-colors md:flex-col md:items-start md:gap-3 md:px-6 md:py-4 text-left w-full bg-[var(--bg-card)] hover:bg-[var(--bg-hover)]"
            style={{ backgroundColor: 'var(--bg-card)' }}
          >
            <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 md:w-14 md:h-14 md:rounded-2xl" style={{ backgroundColor: 'rgba(255,101,0,0.12)' }}>
              <span className="md:hidden"><FileText size={18} color="#FF6500" /></span>
              <span className="hidden md:block"><FileText size={26} color="#FF6500" /></span>
            </div>
            <div className="min-w-0">
              <p className="text-body-sm font-medium text-[var(--text-1)] truncate md:text-body-lg md:font-semibold md:whitespace-normal">New Note</p>
              <p className="text-xs text-[var(--text-3)] truncate md:mt-1 md:whitespace-normal">From any format</p>
            </div>
          </button>

          {/* Study Plan */}
          <button
            onClick={() => setShowPlanModal(true)}
            className="flex items-center gap-3 px-4 py-2 rounded-xl transition-colors md:flex-col md:items-start md:gap-3 md:px-6 md:py-4 text-left w-full bg-[var(--bg-card)] hover:bg-[var(--bg-hover)]"
            style={{ backgroundColor: 'var(--bg-card)' }}
          >
            <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 md:w-14 md:h-14 md:rounded-2xl" style={{ backgroundColor: 'rgba(59,130,246,0.12)' }}>
              <span className="md:hidden"><CalendarDays size={18} color="#3B82F6" /></span>
              <span className="hidden md:block"><CalendarDays size={26} color="#3B82F6" /></span>
            </div>
            <div className="min-w-0">
              <p className="text-body-sm font-medium text-[var(--text-1)] truncate md:text-body-lg md:font-semibold md:whitespace-normal">Create a Study Plan</p>
              <p className="text-xs text-[var(--text-3)] truncate md:mt-1 md:whitespace-normal">AI day-by-day schedule</p>
            </div>
          </button>

          {/* Quiz */}
          <Link
            href="/dashboard/quizzes"
            className="flex items-center gap-3 px-4 py-2 rounded-xl transition-colors md:flex-col md:items-start md:gap-3 md:px-6 md:py-4 bg-[var(--bg-card)] hover:bg-[var(--bg-hover)]"
          >
            <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 md:w-14 md:h-14 md:rounded-2xl" style={{ backgroundColor: 'rgba(236,72,153,0.12)' }}>
              <span className="md:hidden"><Heart size={18} color="#EC4899" fill="#EC4899" /></span>
              <span className="hidden md:block"><Heart size={26} color="#EC4899" fill="#EC4899" /></span>
            </div>
            <div className="min-w-0">
              <p className="text-body-sm font-medium text-[var(--text-1)] truncate md:text-body-lg md:font-semibold md:whitespace-normal">Take a Quiz</p>
              <p className="text-xs text-[var(--text-3)] truncate md:mt-1 md:whitespace-normal">Test and track weak spots</p>
            </div>
          </Link>

          {/* Practice Exam */}
          <button
            onClick={handlePracticeExamClick}
            className="flex items-center gap-3 px-4 py-2 rounded-xl transition-colors md:flex-col md:items-start md:gap-3 md:px-6 md:py-4 text-left w-full bg-[var(--bg-card)] hover:bg-[var(--bg-hover)]"
          >
            <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 md:w-14 md:h-14 md:rounded-2xl" style={{ backgroundColor: 'rgba(139,92,246,0.12)' }}>
              <span className="md:hidden"><ClipboardList size={18} color="#8B5CF6" /></span>
              <span className="hidden md:block"><ClipboardList size={26} color="#8B5CF6" /></span>
            </div>
            <div className="min-w-0">
              <p className="text-body-sm font-medium text-[var(--text-1)] truncate md:text-body-lg md:font-semibold md:whitespace-normal">Practice Exam</p>
              <p className="text-xs text-[var(--text-3)] truncate md:mt-1 md:whitespace-normal">Full timed simulation</p>
            </div>
          </button>

        </div>
      </div>

      {/* Type picker */}
      <Dialog open={showTypePicker} onOpenChange={o => !o && setShowTypePicker(false)}>
        <DialogContent size="sm" showClose>
          <DialogHeader className="mb-5">
            <DialogTitle>New Note</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            {UPLOAD_OPTIONS.map(({ type, icon, label }) => (
              <button
                key={type}
                onClick={() => handleSelectType(type)}
                className="flex flex-col items-start gap-3 rounded-xl p-4 text-left transition-colors bg-[var(--bg-input)] hover:bg-[var(--bg-hover)]"
                style={{ backgroundColor: 'var(--bg-input)' }}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: ICON_BG[type] }}>
                  {icon}
                </div>
                <p className="text-body-sm font-medium text-[var(--text-1)]">{label}</p>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {uploadType && (
        <UploadDialog
          type={uploadType}
          onClose={() => setUploadType(null)}
          onSuccess={() => {
            setUploadType(null);
            router.push('/dashboard/library');
          }}
        />
      )}

      {/* Practice exam modal */}
      <GeneratePracticeExamModal
        open={showExamModal}
        onClose={() => setShowExamModal(false)}
        onGenerate={handleExamGenerate}
        documents={examDocs}
      />

      {/* Study plan modal */}
      <CreateStudyPlanModal
        open={showPlanModal}
        onClose={() => setShowPlanModal(false)}
        onCreated={() => { setShowPlanModal(false); router.push('/dashboard/study-plan'); }}
      />
    </>
  );
}
