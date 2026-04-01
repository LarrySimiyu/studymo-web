'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { weakTopicsApi, WeakTopic } from '@/lib/api/studyPlan';

interface Props {
  topic: WeakTopic;
  /** If true, shows a "View note" button that navigates to the document */
  linkToDocument?: boolean;
  onResolved?: (updated: WeakTopic) => void;
}

export default function WeakTopicItem({ topic, linkToDocument, onResolved }: Props) {
  const router = useRouter();
  const [current, setCurrent] = useState(topic);
  const [answerVisible, setAnswerVisible] = useState(false);
  const [resolving, setResolving] = useState(false);

  async function handleResolve(e: React.MouseEvent) {
    e.stopPropagation();
    if (resolving || current.resolved) return;
    setResolving(true);
    try {
      const { data } = await weakTopicsApi.resolve(current.id);
      if (data) { setCurrent(data); onResolved?.(data); }
    } finally {
      setResolving(false);
    }
  }

  // Severity-based colors for the missed badge
  const missedBg =
    current.resolved ? 'var(--bg-input)' :
    current.missedCount >= 5 ? 'var(--danger-subtle)' :
    current.missedCount >= 3 ? 'rgba(245,158,11,0.15)' :
    'var(--bg-input)';

  const missedColor =
    current.resolved ? 'var(--text-3)' :
    current.missedCount >= 5 ? '#EF4444' :
    current.missedCount >= 3 ? '#F59E0B' :
    'var(--text-2)';

  const missedBorder =
    current.resolved ? 'var(--border)' :
    current.missedCount >= 5 ? 'var(--danger-border)' :
    current.missedCount >= 3 ? 'rgba(245,158,11,0.35)' :
    'var(--border)';

  return (
    <div
      className="flex flex-col gap-3 p-4 rounded-xl"
      style={{
        backgroundColor: 'var(--bg-card)',
        border: `1px solid ${current.resolved ? 'var(--success-border)' : 'var(--border)'}`,
        opacity: current.resolved ? 0.75 : 1,
      }}
    >
      {/* Missed badge + resolved indicator */}
      <div className="flex items-center gap-2">
        <span
          className="text-xs font-medium px-2 py-0.5 rounded-full"
          style={{ backgroundColor: missedBg, color: missedColor, border: `1px solid ${missedBorder}` }}
        >
          {current.missedCount}× missed
        </span>
        {current.resolved && (
          <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--success-subtle)', color: 'var(--success)', border: '1px solid var(--success-border)' }}>
            Resolved
          </span>
        )}
      </div>

      {/* Topic name */}
      <p className="text-body-sm font-semibold text-[var(--text-1)] leading-snug">{current.topic}</p>

      {/* Date row — only show when resolved */}
      {current.resolved && current.resolvedAt && (
        <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-3)' }}>
          <span style={{ color: 'var(--success)' }}>
            Resolved {new Date(current.resolvedAt).toLocaleDateString()}
          </span>
        </div>
      )}

      {/* Revealed answer */}
      {answerVisible && current.correctAnswer && (
        <div
          className="px-3 py-2.5 rounded-lg text-xs leading-relaxed"
          style={{ backgroundColor: 'var(--success-subtle)', color: 'var(--success)', border: '1px solid var(--success-border)' }}
        >
          <span className="font-semibold">Answer: </span>{current.correctAnswer}
        </div>
      )}

      {/* Action row */}
      <div className="flex items-center gap-2 pt-1" onClick={e => e.stopPropagation()}>
        {/* View note */}
        {linkToDocument && current.document?.id && (
          <button
            onClick={() => router.push(`/dashboard/library?note=${current.document!.id}`)}
            className="text-xs px-2.5 py-1.5 rounded-xl transition-colors hover:opacity-80"
            style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-2)', border: '1px solid var(--border)' }}
          >
            View note
          </button>
        )}

        <div className="flex items-center gap-2 ml-auto">
          {/* Show answer */}
          {!current.resolved && !answerVisible && current.correctAnswer && (
            <button
              onClick={e => { e.stopPropagation(); setAnswerVisible(true); }}
              className="text-xs px-2.5 py-1.5 rounded-xl transition-opacity hover:opacity-80"
              style={{ backgroundColor: 'rgba(245,158,11,0.12)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.35)' }}
            >
              Show answer
            </button>
          )}

          {/* Resolve */}
          {!current.resolved && (answerVisible || !current.correctAnswer) && (
            <button
              onClick={handleResolve}
              disabled={resolving}
              className="text-xs px-2.5 py-1.5 rounded-xl transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: 'var(--success-subtle)', color: 'var(--success)', border: '1px solid var(--success-border)' }}
            >
              {resolving ? '…' : 'Resolve ✓'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
