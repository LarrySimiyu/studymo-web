'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { documentsApi, quizzesApi, Document, Quiz } from '@/lib/api/documents';
import { PageHeader } from '@/components/dashboard/PageHeader';
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
    <div className="max-w-3xl mx-auto p-6">
      <PageHeader title="Quizzes" action={{ label: 'New Quiz', href: '/dashboard/library' }} />

      {loading ? (
        <LoadingSpinner size="lg" />
      ) : decks.length === 0 ? (
        <div className="flex items-center gap-6 p-8 rounded-2xl" style={{ backgroundColor: 'var(--bg-card)' }}>
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(236,72,153,0.12)' }}>
            <Heart size={40} fill="#EC4899" style={{ color: '#EC4899' }} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[var(--text-1)]">No Quizzes</h3>
            <p className="text-sm mt-1" style={{ color: 'var(--text-3)' }}>Test your knowledge and pinpoint weak spots before exam day.</p>
            <Link
              href="/dashboard/library"
              className="mt-4 inline-block px-4 py-2 rounded-xl text-sm font-medium text-white hover:opacity-90 transition-opacity"
              style={{ background: 'linear-gradient(135deg, #FF6500, #FF9A3C)' }}
            >
              Go to Notes
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {decks.map(({ document: doc, quiz }) => {
            const [iconColor, iconBg] = getPalette(doc.id);
            return (
              <Link
                key={doc.id}
                href={`/dashboard/quizzes/${doc.id}`}
                className="p-5 rounded-xl transition-colors text-left block"
                style={{ backgroundColor: 'var(--bg-card)' }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--bg-card)')}
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
                      <p className="text-3xl font-bold text-[var(--text-1)] leading-none">{questionCount(quiz)}</p>
                      <p className="text-3xl font-bold text-[var(--text-1)] leading-none">Questions</p>
                    </div>
                    <p className="text-xs text-[var(--text-3)] truncate mt-1">{doc.title}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
