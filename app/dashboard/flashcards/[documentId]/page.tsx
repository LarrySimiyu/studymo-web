'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import FlipCard from '@/components/flashcards/FlipCard';
import { documentsApi, flashcardsApi, Document, Flashcard } from '@/lib/api/documents';
import PageShell from '@/components/dashboard/PageShell';
import { Button } from '@/components/ui/Button';

export default function FlashcardDeckPage({ params }: { params: { documentId: string } }) {
  const router = useRouter();
  const [doc, setDoc] = useState<Document | null>(null);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setLoading(true);
    setIndex(0);
    Promise.all([
      documentsApi.getById(params.documentId),
      flashcardsApi.getByDocument(params.documentId),
    ]).then(([{ data: document }, { data: deck }]) => {
      setDoc(document ?? null);
      setCards(deck ?? []);
      setLoading(false);
    });
  }, [params.documentId]);

  const exit = () => router.push('/dashboard/flashcards');

  return (
    <PageShell width="sm" center>
      <div className="flex items-center gap-3 mb-6 sm:mb-8">
        <Button variant="ghost" size="icon-sm" onClick={exit} aria-label="Back to flashcards" className="shrink-0">
          <ArrowLeft size={18} />
        </Button>
        {doc && (
          <h1 className="text-body-sm sm:text-body font-semibold text-[var(--text-1)] truncate">
            {doc.title}
          </h1>
        )}
      </div>

      {loading ? (
        <LoadingSpinner size="lg" />
      ) : cards.length === 0 ? (
        <p className="text-body-sm text-[var(--text-3)] text-center py-16">
          This deck has no cards yet.
        </p>
      ) : (
        <div className="flex justify-center">
          <FlipCard
            cards={cards}
            index={index}
            onPrev={() => setIndex(i => Math.max(0, i - 1))}
            onNext={() => setIndex(i => Math.min(cards.length - 1, i + 1))}
            onRestart={() => setIndex(0)}
            onExit={exit}
          />
        </div>
      )}
    </PageShell>
  );
}
