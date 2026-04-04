'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Layers, ArrowBigLeft, ArrowBigRight, ArrowLeft, Star } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { documentsApi, flashcardsApi, Document, Flashcard } from '@/lib/api/documents';
import { PageHeader } from '@/components/dashboard/PageHeader';
import ProgressBar from '@/components/ui/ProgressBar';

const PALETTE: [string, string][] = [
  ['#FF6500', 'rgba(255,101,0,0.12)'],
  ['#22C55E', 'rgba(34,197,94,0.12)'],
  ['#3B82F6', 'rgba(59,130,246,0.12)'],
  ['#F59E0B', 'rgba(245,158,11,0.12)'],
  ['#EC4899', 'rgba(236,72,153,0.12)'],
  ['#8B5CF6', 'rgba(139,92,246,0.12)'],
  ['#14B8A6', 'rgba(20,184,166,0.12)'],
];

function getPalette(id: string): [string, string] {
  const hash = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return PALETTE[hash % PALETTE.length];
}

interface DeckEntry {
  document: Document;
  count: number;
}

function FlipCard({ cards, index, onPrev, onNext, onRestart, onExit }: {
  cards: Flashcard[];
  index: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
  onRestart: () => void;
  onExit: () => void;
}) {
  const total = cards.length;
  const [flipped, setFlipped] = useState(false);
  const [slideClass, setSlideClass] = useState('');
  const [displayIndex, setDisplayIndex] = useState(index);
  const animating = useRef(false);

  useEffect(() => {
    if (index === displayIndex) return;
    if (animating.current) return;
    animating.current = true;
    const goingNext = index > displayIndex;
    setSlideClass(goingNext ? 'slide-out-left' : 'slide-out-right');
    setTimeout(() => {
      setDisplayIndex(index);
      setFlipped(false);
      setSlideClass(goingNext ? 'slide-in-right' : 'slide-in-left');
      setTimeout(() => {
        setSlideClass('');
        animating.current = false;
      }, 300);
    }, 250);
  }, [index]);

  const card = cards[displayIndex];

  return (
    <>
      <style>{`
        .slide-out-left  { animation: slideOutLeft  0.25s ease forwards; }
        .slide-out-right { animation: slideOutRight 0.25s ease forwards; }
        .slide-in-right  { animation: slideInRight  0.3s ease forwards; }
        .slide-in-left   { animation: slideInLeft   0.3s ease forwards; }
        @keyframes slideOutLeft  { to { opacity: 0; transform: translateX(-60px) rotateY(0deg); } }
        @keyframes slideOutRight { to { opacity: 0; transform: translateX(60px)  rotateY(0deg); } }
        @keyframes slideInRight  { from { opacity: 0; transform: translateX(60px);  } to { opacity: 1; transform: translateX(0); } }
        @keyframes slideInLeft   { from { opacity: 0; transform: translateX(-60px); } to { opacity: 1; transform: translateX(0); } }
      `}</style>

      <div className="flex flex-col items-center gap-8 w-full max-w-xl">
        <ProgressBar index={displayIndex} total={total} />

        <div
          className={`w-full cursor-pointer select-none ${slideClass}`}
          style={{ perspective: '1000px' }}
          onClick={() => !animating.current && setFlipped(f => !f)}
        >
          <div
            className="relative w-full rounded-2xl transition-transform duration-500"
            style={{
              height: 300,
              transformStyle: 'preserve-3d',
              transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            }}
          >
            <div
              className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center p-8 text-center"
              style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', backgroundColor: 'var(--bg-card)' }}
            >
              <p className="text-2xl font-bold text-[var(--text-1)] mb-5">Question</p>
              <p className="text-[var(--text-1)] text-base leading-relaxed">{card.front}</p>
              <p className="text-[10px] text-[var(--text-3)] mt-6">tap to flip</p>
            </div>

            <div
              className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center p-8 text-center"
              style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)', backgroundColor: 'var(--brand-subtle)' }}
            >
              <p className="text-2xl font-bold mb-5" style={{ color: 'var(--brand)' }}>Answer</p>
              <p className="text-[var(--text-1)] text-base leading-relaxed">{card.back}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-3 w-full">
          <div className="flex items-center gap-3 w-full">
            <button
              onClick={onPrev}
              disabled={index === 0}
              className="flex-1 py-2.5 rounded-xl flex items-center justify-center transition-opacity disabled:opacity-30"
              style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-2)' }}
            >
              <ArrowBigLeft size={22} />
            </button>
            <button
              onClick={() => {
                if (index === total - 1) { onRestart(); return; }
                if (!animating.current) setFlipped(f => !f);
              }}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-1.5"
              style={index === total - 1
                ? { background: 'linear-gradient(135deg, #FF6500, #FF9A3C)', color: '#fff' }
                : flipped
                  ? { backgroundColor: 'var(--bg-card)', color: 'var(--text-2)' }
                  : { background: 'linear-gradient(135deg, #FF6500, #FF9A3C)', color: '#fff' }
              }
            >
              {index === total - 1
                ? <><Star size={13} fill="white" stroke="none" />Start Over</>
                : flipped ? 'Show Question' : <><Star size={13} fill="white" stroke="none" />Reveal Answer</>
              }
            </button>
            <button
              onClick={onNext}
              disabled={index === total - 1}
              className="flex-1 py-2.5 rounded-xl flex items-center justify-center transition-opacity disabled:opacity-30"
              style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-2)' }}
            >
              <ArrowBigRight size={22} />
            </button>
          </div>
          <button onClick={onExit} className="text-xs transition-colors" style={{ color: 'var(--text-3)' }}>
            Return to flashcards
          </button>
        </div>
      </div>
    </>
  );
}

export default function FlashcardsPage() {
  const [decks, setDecks] = useState<DeckEntry[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (activeDeck) {
    const { doc, cards } = activeDeck;
    return (
      <div className="max-w-2xl mx-auto py-4 px-4 sm:px-6">
        <div className="mb-8">
          <button
            onClick={() => setActiveDeck(null)}
            className="text-[var(--text-2)] hover:text-[var(--text-1)] transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
        </div>

        <FlipCard
          cards={cards}
          index={cardIndex}
          total={cards.length}
          onPrev={() => setCardIndex(i => Math.max(0, i - 1))}
          onNext={() => setCardIndex(i => Math.min(cards.length - 1, i + 1))}
          onRestart={() => setCardIndex(0)}
          onExit={() => setActiveDeck(null)}
        />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <PageHeader title="Flashcards" action={{ label: 'New Flashcard', href: '/dashboard/library' }} />

      {loading || deckLoading ? (
        <LoadingSpinner size="lg" />
      ) : decks.length === 0 ? (
        <div className="flex items-center gap-6 p-8 rounded-2xl" style={{ backgroundColor: 'var(--bg-card)' }}>
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(59,130,246,0.12)' }}>
            <Layers size={40} style={{ color: '#3B82F6' }} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[var(--text-1)]">No Flashcards</h3>
            <p className="text-sm mt-1" style={{ color: 'var(--text-3)' }}>Memorize key concepts faster with spaced repetition.</p>
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
          {decks.map(({ document: doc, count }) => {
            const [iconColor, iconBg] = getPalette(doc.id);
            return (
              <button
                key={doc.id}
                onClick={() => openDeck(doc)}
                className="p-5 rounded-xl transition-colors text-left"
                style={{ backgroundColor: 'var(--bg-card)' }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--bg-card)')}
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
                      <p className="text-3xl font-bold text-[var(--text-1)] leading-none">{count}</p>
                      <p className="text-3xl font-bold text-[var(--text-1)] leading-none">Cards</p>
                    </div>
                    <p className="text-xs text-[var(--text-3)] truncate mt-1">{doc.title}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
