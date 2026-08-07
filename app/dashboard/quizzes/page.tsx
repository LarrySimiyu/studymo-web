'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { documentsApi, quizzesApi, Document, Quiz } from '@/lib/api/documents';
import { PageHeader } from '@/components/dashboard/PageHeader';
import PageShell from '@/components/dashboard/PageShell';
import EmptyState from '@/components/dashboard/EmptyState';
import { getPalette } from '@/components/dashboard/PlanCard';

interface DeckEntry {
  document: Document;
  quiz: Quiz;
}

function questionCount(quiz: Quiz): number {
  try { return JSON.parse(quiz.questions).length; } catch { return 0; }
}

export default function QuizzesPage() {
  const [decks, setDecks] = useState<DeckEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([documentsApi.getAll(), quizzesApi.getAll()]).then(([{ data: docs }, { data: quizzes }]) => {
      if (!docs || !quizzes) { setLoading(false); return; }
      const quizByDocId = new Map(quizzes.map(q => [q.documentId, q]));
      setDecks(
        docs
          .filter(d => d.status === 'complete' && quizByDocId.has(d.id))
          .map(d => ({ document: d, quiz: quizByDocId.get(d.id)! }))
      );
      setLoading(false);
    });
  }, []);

  return (
    <PageShell width="xl" header={<PageHeader title="Quizzes" action={{ label: 'New Quiz', href: '/dashboard/library' }} />}>
      {loading ? (
        <LoadingSpinner size="lg" />
      ) : decks.length === 0 ? (
        <EmptyState
          icon={Heart}
          accent="#EC4899"
          accentBg="rgba(236,72,153,0.12)"
          fillIcon
          title="No Quizzes"
          description="Test your knowledge and pinpoint weak spots before exam day."
          action={{ label: 'Go to Notes', href: '/dashboard/library' }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {decks.map(({ document: doc, quiz }) => {
            const [iconColor, iconBg] = getPalette(doc.id);
            return (
              <Link
                key={doc.id}
                href={`/dashboard/quizzes/${doc.id}`}
                className="block rounded-xl bg-[var(--bg-card)] p-5 text-left transition-colors hover:bg-[var(--bg-hover)]"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: iconBg }}
                  >
                    <Heart size={26} style={{ color: iconColor }} fill={iconColor} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-1.5">
                      <p className="text-title text-[var(--text-1)] leading-none">{questionCount(quiz)}</p>
                      <p className="text-title text-[var(--text-1)] leading-none">Questions</p>
                    </div>
                    <p className="text-xs text-[var(--text-3)] truncate mt-1">{doc.title}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </PageShell>
  );
}
