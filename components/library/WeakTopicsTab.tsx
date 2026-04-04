'use client';

import { Target } from 'lucide-react';
import { WeakTopic } from '@/lib/api/studyPlan';
import WeakTopicItem from '@/components/dashboard/WeakTopicItem';

interface Props {
  topics: WeakTopic[];
  onResolved: (updated: WeakTopic) => void;
}

export default function WeakTopicsTab({ topics, onResolved }: Props) {
  if (topics.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
        <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(245,158,11,0.12)' }}>
          <Target size={24} style={{ color: '#F59E0B' }} />
        </div>
        <div>
          <p className="text-[var(--text-1)] font-semibold">No weak topics yet</p>
          <p className="text-[var(--text-2)] text-sm mt-1">Take a quiz to identify areas that need review</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {topics.map(wt => (
        <WeakTopicItem key={wt.id} topic={wt} onResolved={onResolved} />
      ))}
    </div>
  );
}
