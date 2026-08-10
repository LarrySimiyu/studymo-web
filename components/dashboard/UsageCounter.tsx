'use client';

import { useUsage } from '@/hooks/useUsage';
import type { FreeLimitKey } from '@/lib/api/billing';

const NOUNS: Record<FreeLimitKey, string> = {
  uploads: 'uploads',
  notes: 'notes',
  flashcardDecks: 'decks',
  quizzes: 'quizzes',
  practiceExams: 'exams',
  podcasts: 'podcasts',
  studyPlans: 'study plans',
  tasks: 'tasks',
  weakTopics: 'weak topics',
  aiMessages: 'tutor messages',
};

interface Props {
  limitKey: FreeLimitKey;
  className?: string;
}

/** "2 of 2 free quizzes used" — renders nothing for subscribers. */
export default function UsageCounter({ limitKey, className }: Props) {
  const { isFree, used, limit } = useUsage();
  if (!isFree) return null;

  const max = limit(limitKey);
  const spent = Math.min(used(limitKey), max);

  return (
    <p
      className={`text-2xs ${className ?? ''}`}
      style={{ color: spent >= max ? 'var(--brand-ink)' : 'var(--text-3)' }}
    >
      {spent} of {max} free {NOUNS[limitKey]} used
    </p>
  );
}
