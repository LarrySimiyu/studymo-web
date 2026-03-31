'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { documentsApi, flashcardsApi, Document, Flashcard } from '@/lib/api/documents';

interface DeckEntry {
  document: Document;
  count: number;
}

function FlipCard({ card, index, total, onPrev, onNext }: {
  card: Flashcard;
  index: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  const [flipped, setFlipped] = useState(false);

  // Reset flip when card changes
  useEffect(() => { setFlipped(false); }, [card.id]);

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Card */}
      <div
        className="w-full max-w-xl cursor-pointer select-none"
        style={{ perspective: '1000px' }}
        onClick={() => setFlipped(f => !f)}
      >
        <div
          className="relative w-full rounded-2xl transition-transform duration-500"
          style={{
            height: 280,
            transformStyle: 'preserve-3d',
            transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          {/* Front */}
          <div
            className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center p-8 text-center"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border)',
            }}
          >
            <p className="text-xs text-[var(--text-2)] mb-4 uppercase tracking-wider">Question</p>
            <p className="text-[var(--text-1)] text-base leading-relaxed">{card.front}</p>
            <p className="text-xs text-[var(--text-3)] mt-6">Click to reveal answer</p>
          </div>

          {/* Back */}
          <div
            className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center p-8 text-center"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              backgroundColor: 'var(--brand-subtle)',
              border: '1px solid var(--brand-border)',
            }}
          >
            <p className="text-xs mb-4 uppercase tracking-wider" style={{ color: '#9747FF' }}>Answer</p>
            <p className="text-[var(--text-1)] text-base leading-relaxed">{card.back}</p>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-1">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className="rounded-full transition-all"
            style={{
              width: i === index ? 20 : 6,
              height: 6,
              backgroundColor: i === index ? '#9747FF' : 'var(--bg-input)',
            }}
          />
        ))}
      </div>

      <p className="text-xs text-[var(--text-2)]">{index + 1} / {total}</p>

      {/* Nav */}
      <div className="flex items-center gap-4">
        <button
          onClick={onPrev}
          disabled={index === 0}
          className="px-5 py-2 rounded-xl text-sm font-medium transition-opacity disabled:opacity-30"
          style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-2)' }}
        >
          ← Prev
        </button>
        <button
          onClick={() => setFlipped(f => !f)}
          className="px-5 py-2 rounded-xl text-sm font-medium"
          style={{ backgroundColor: 'var(--bg-input)', color: '#9747FF', border: '1px solid var(--brand-border)' }}
        >
          {flipped ? 'Show Question' : 'Reveal Answer'}
        </button>
        <button
          onClick={onNext}
          disabled={index === total - 1}
          className="px-5 py-2 rounded-xl text-sm font-medium transition-opacity disabled:opacity-30"
          style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-2)' }}
        >
          Next →
        </button>
      </div>
    </div>
  );
}

export default function FlashcardsPage() {
  const [decks, setDecks] = useState<DeckEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Study mode state
  const [activeDeck, setActiveDeck] = useState<{ doc: Document; cards: Flashcard[] } | null>(null);
  const [cardIndex, setCardIndex] = useState(0);
  const [deckLoading, setDeckLoading] = useState(false);

  useEffect(() => {
    documentsApi.getAll().then(async ({ data: docs }) => {
      if (!docs) { setLoading(false); return; }
      const completed = docs.filter((d) => d.status === 'complete');
      const results = await Promise.all(
        completed.map(async (doc) => {
          const { data } = await flashcardsApi.getByDocument(doc.id);
          return { document: doc, count: data?.length ?? 0 };
        })
      );
      setDecks(results.filter((d) => d.count > 0));
      setLoading(false);
    });
  }, []);

  async function openDeck(doc: Document) {
    setDeckLoading(true);
    const { data } = await flashcardsApi.getByDocument(doc.id);
    if (data && data.length > 0) {
      setActiveDeck({ doc, cards: data });
      setCardIndex(0);
    }
    setDeckLoading(false);
  }

  // Study mode overlay
  if (activeDeck) {
    const { doc, cards } = activeDeck;
    return (
      <div className="max-w-2xl mx-auto py-4">
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => setActiveDeck(null)}
            className="text-[var(--text-2)] hover:text-[var(--text-1)] transition-colors"
          >
            ← Back
          </button>
          <div>
            <h1 className="text-lg font-bold text-[var(--text-1)]">{doc.title}</h1>
            <p className="text-xs text-[var(--text-2)]">{cards.length} cards</p>
          </div>
        </div>

        <FlipCard
          card={cards[cardIndex]}
          index={cardIndex}
          total={cards.length}
          onPrev={() => setCardIndex(i => Math.max(0, i - 1))}
          onNext={() => setCardIndex(i => Math.min(cards.length - 1, i + 1))}
        />

        {cardIndex === cards.length - 1 && (
          <div className="mt-8 text-center">
            <p className="text-[var(--text-2)] text-sm mb-3">All cards reviewed!</p>
            <button
              onClick={() => setCardIndex(0)}
              className="px-5 py-2 rounded-xl text-sm font-medium text-white"
              style={{ backgroundColor: '#9747FF' }}
            >
              Start Over
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-1)]">Flashcards</h1>
        <Link
          href="/dashboard/library"
          className="text-xs px-3 py-1.5 rounded-lg font-medium hover:opacity-90 transition-opacity"
          style={{ backgroundColor: '#9747FF', color: '#fff' }}
        >
          + Upload Document
        </Link>
      </div>

      {loading || deckLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2" style={{ borderColor: '#9747FF' }} />
        </div>
      ) : decks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="text-4xl mb-4">🗂</div>
          <p className="text-[var(--text-2)] text-sm">No flashcard decks yet. Upload a document to generate flashcards.</p>
          <Link
            href="/dashboard/library"
            className="mt-4 px-4 py-2 rounded-lg text-sm font-medium text-white hover:opacity-90 transition-opacity"
            style={{ backgroundColor: '#9747FF' }}
          >
            Go to Library
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {decks.map(({ document: doc, count }) => (
            <button
              key={doc.id}
              onClick={() => openDeck(doc)}
              className="block p-5 rounded-xl transition-colors hover:border-purple-500/50 text-left"
              style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
                  style={{ backgroundColor: 'var(--bg-input)' }}
                >
                  🗂
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[var(--text-1)] font-medium text-sm truncate">{doc.title}</p>
                  <p className="text-[var(--text-2)] text-xs mt-0.5">{count} cards</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
