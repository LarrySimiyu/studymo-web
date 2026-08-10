'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Layers } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { documentsApi, flashcardsApi, Document } from '@/lib/api/documents';
import { PageHeader } from '@/components/dashboard/PageHeader';
import PageShell from '@/components/dashboard/PageShell';
import EmptyState from '@/components/dashboard/EmptyState';
import { getPalette } from '@/components/dashboard/PlanCard';

interface DeckEntry {
  document: Document;
  count: number;
}

export default function FlashcardsPage() {
  const [decks, setDecks] = useState<DeckEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([documentsApi.getAll(), flashcardsApi.getDecks()]).then(([{ data: docs }, { data: deckCounts }]) => {
      if (!docs || !deckCounts) { setLoading(false); return; }
      const countByDocId = new Map(deckCounts.map(d => [d.documentId, d.count]));
      setDecks(
        docs
          .filter(d => d.status === 'complete' && (countByDocId.get(d.id) ?? 0) > 0)
          .map(d => ({ document: d, count: countByDocId.get(d.id)! }))
      );
      setLoading(false);
    });
  }, []);

  return (
    <PageShell width="xl" header={<PageHeader title="Flashcards" action={{ label: 'New Flashcard', href: '/dashboard/library' }} />}>

      {loading ? (
        <LoadingSpinner size="lg" />
      ) : decks.length === 0 ? (
        <EmptyState
          icon={Layers}
          accent="#3B82F6"
          accentBg="rgba(59,130,246,0.12)"
          title="No Flashcards"
          description="Memorize key concepts faster with spaced repetition."
          action={{ label: 'Go to Notes', href: '/dashboard/library' }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {decks.map(({ document: doc, count }) => {
            const [iconColor, iconBg] = getPalette(doc.id);
            return (
              <Link
                key={doc.id}
                href={`/dashboard/flashcards/${doc.id}`}
                className="block rounded-xl bg-[var(--bg-card)] p-5 text-left transition-colors hover:bg-[var(--bg-hover)]"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: iconBg }}
                  >
                    <Layers size={26} style={{ color: iconColor }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-1.5">
                      <p className="text-title text-[var(--text-1)] leading-none">{count}</p>
                      <p className="text-title text-[var(--text-1)] leading-none">Cards</p>
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
