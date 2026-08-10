'use client';

import { useState } from 'react';
import { Layers } from 'lucide-react';
import { Flashcard } from '@/lib/api/documents';
import FlipCard from '@/components/flashcards/FlipCard';
import { Button } from '@/components/ui/Button';
import UsageCounter from '@/components/dashboard/UsageCounter';

interface Props {
  flashcards: Flashcard[];
  onGenerate: () => Promise<void>;
}

export default function FlashcardsTab({ flashcards, onGenerate }: Props) {
  const [cardIndex, setCardIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  if (flashcards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
        <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(255,101,0,0.12)' }}>
          <Layers size={24} style={{ color: '#FF6500' }} />
        </div>
        <div>
          <p className="text-[var(--text-1)] font-semibold">Generate Flashcards</p>
          <p className="text-[var(--text-2)] text-sm mt-1 max-w-xs">Create a set of flashcards from your notes to help you memorize key concepts.</p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={async () => { setLoading(true); await onGenerate(); setLoading(false); }}
          disabled={loading}
        >
          {loading && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
          {loading ? 'Generating…' : 'Generate Flashcards'}
        </Button>
        <UsageCounter limitKey="flashcardDecks" className="-mt-2" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <FlipCard
        cards={flashcards}
        index={cardIndex}
        onPrev={() => setCardIndex(i => Math.max(0, i - 1))}
        onNext={() => setCardIndex(i => Math.min(flashcards.length - 1, i + 1))}
        onRestart={() => setCardIndex(0)}
      />
    </div>
  );
}
