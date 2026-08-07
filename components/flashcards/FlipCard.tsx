'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowBigLeft, ArrowBigRight, Star } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Flashcard } from '@/lib/api/documents';
import ProgressBar from '@/components/ui/ProgressBar';

interface Props {
  cards: Flashcard[];
  index: number;
  onPrev: () => void;
  onNext: () => void;
  onRestart: () => void;
  onExit?: () => void;
}

export default function FlipCard({ cards, index, onPrev, onNext, onRestart, onExit }: Props) {
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
      setTimeout(() => { setSlideClass(''); animating.current = false; }, 300);
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
        @keyframes slideOutLeft  { to { opacity: 0; transform: translateX(-60px); } }
        @keyframes slideOutRight { to { opacity: 0; transform: translateX(60px); } }
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
            style={{ height: 280, transformStyle: 'preserve-3d', transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
          >
            <div
              className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center p-8 text-center"
              style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', backgroundColor: 'var(--bg-card)' }}
            >
              <p className="text-heading-sm font-bold text-[var(--text-1)] mb-4">Question</p>
              <p className="text-[var(--text-1)] text-body leading-relaxed">{card.front}</p>
              <p className="text-2xs text-[var(--text-3)] mt-5">tap to flip</p>
            </div>
            <div
              className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center p-8 text-center"
              style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)', backgroundColor: 'var(--brand-subtle)' }}
            >
              <p className="text-heading-sm font-bold mb-4" style={{ color: 'var(--brand)' }}>Answer</p>
              <p className="text-[var(--text-1)] text-body leading-relaxed">{card.back}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-3 w-full">
          <div className="flex items-center gap-3 w-full">
            <Button
              variant="secondary"
              size="lg"
              onClick={onPrev}
              disabled={index === 0}
              aria-label="Previous card"
              className="flex-1 disabled:opacity-30"
            >
              <ArrowBigLeft size={22} />
            </Button>
            <Button
              variant={index === total - 1 || !flipped ? 'primary' : 'secondary'}
              size="lg"
              onClick={() => { if (index === total - 1) { onRestart(); return; } if (!animating.current) setFlipped(f => !f); }}
              className="flex-1"
            >
              {index === total - 1
                ? <><Star size={13} fill="currentColor" stroke="none" />Start Over</>
                : flipped ? 'Show Question' : <><Star size={13} fill="currentColor" stroke="none" />Reveal Answer</>
              }
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={onNext}
              disabled={index === total - 1}
              aria-label="Next card"
              className="flex-1 disabled:opacity-30"
            >
              <ArrowBigRight size={22} />
            </Button>
          </div>
          {onExit && (
            <Button variant="link" size="link" onClick={onExit} className="text-xs text-[var(--text-3)]">
              Return to flashcards
            </Button>
          )}
        </div>
      </div>
    </>
  );
}
