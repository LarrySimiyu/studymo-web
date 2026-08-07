'use client';

import { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import { Document, Quiz } from '@/lib/api/documents';
import QuizRunner from '@/components/quiz/QuizRunner';
import { Button } from '@/components/ui/Button';
import UsageCounter from '@/components/dashboard/UsageCounter';

interface Props {
  doc: Document;
  quiz: Quiz | null;
  onGenerate: (types: string[]) => Promise<void>;
}

const ALL_TYPES = [
  { value: 'multiple_choice', label: 'Multiple Choice' },
  { value: 'true_false', label: 'True / False' },
  { value: 'short_answer', label: 'Short Answer' },
];

export default function QuizTab({ doc, quiz, onGenerate }: Props) {
  const [loading, setLoading] = useState(false);
  const [types, setTypes] = useState<string[]>(['multiple_choice']);

  function toggleType(t: string) {
    setTypes(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  }

  if (!quiz) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-5 text-center">
        <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(59,130,246,0.12)' }}>
          <HelpCircle size={24} style={{ color: '#3B82F6' }} />
        </div>
        <div>
          <p className="text-[var(--text-1)] font-semibold">Generate Quiz</p>
          <p className="text-[var(--text-2)] text-sm mt-1 max-w-xs">Select question types then generate a short quiz to test your understanding.</p>
        </div>
        <div className="flex gap-2">
          {ALL_TYPES.map(({ value, label }) => (
            <button key={value} onClick={() => toggleType(value)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-all"
              style={{
                backgroundColor: types.includes(value) ? 'rgba(255,101,0,0.08)' : 'transparent',
                borderColor: types.includes(value) ? 'var(--brand)' : 'var(--border-md)',
                color: types.includes(value) ? 'var(--brand)' : 'var(--text-2)',
              }}>
              {label}
            </button>
          ))}
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={async () => { if (!types.length) return; setLoading(true); await onGenerate(types); setLoading(false); }}
          disabled={loading || !types.length}
        >
          {loading && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
          {loading ? 'Generating…' : 'Generate Quiz'}
        </Button>
        <UsageCounter limitKey="quizzes" className="-mt-3" />
      </div>
    );
  }

  return <QuizRunner document={doc} quiz={quiz} />;
}
