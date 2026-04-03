'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { weakTopicsApi, WeakTopic } from '@/lib/api/studyPlan';

interface Props {
  topic: WeakTopic;
  linkToDocument?: boolean;
  onResolved?: (updated: WeakTopic) => void;
}

function severityColor(missedCount: number) {
  if (missedCount >= 5) return { bar: '#EF4444', badge: 'rgba(239,68,68,0.12)', text: '#EF4444' };
  if (missedCount >= 3) return { bar: '#F59E0B', badge: 'rgba(245,158,11,0.12)', text: '#F59E0B' };
  return { bar: 'var(--text-3)', badge: 'var(--bg-input)', text: 'var(--text-3)' };
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

  const colors = severityColor(current.resolved ? 0 : current.missedCount);

  return (
    <div
      className="flex gap-3 px-4 py-4 rounded-xl transition-colors"
      style={{ backgroundColor: 'var(--bg-card)' }}
      onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
      onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--bg-card)')}
    >
      {/* Severity accent bar */}
      <div
        className="w-1 rounded-full shrink-0 self-stretch"
        style={{ backgroundColor: current.resolved ? 'var(--success)' : colors.bar }}
      />

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col gap-2">
        {/* Top row: topic + missed badge */}
        <div className="flex items-start justify-between gap-2">
          <p className="text-body-sm font-semibold text-[var(--text-1)] leading-snug">{current.topic}</p>
          {current.resolved ? (
            <span className="text-xs font-medium px-2 py-0.5 rounded-full shrink-0" style={{ backgroundColor: 'var(--success-subtle)', color: 'var(--success)' }}>
              Resolved
            </span>
          ) : (
            <span className="text-xs font-medium px-2 py-0.5 rounded-full shrink-0" style={{ backgroundColor: colors.badge, color: colors.text }}>
              {current.missedCount}× missed
            </span>
          )}
        </div>

        {/* Answer block */}
        {answerVisible && current.correctAnswer && (
          <div
            className="px-3 py-2 rounded-lg text-xs font-bold leading-relaxed"
            style={{ backgroundColor: 'var(--success-subtle)', color: 'var(--success)', border: '1px solid var(--success-border)' }}
          >
            {current.correctAnswer}
          </div>
        )}


        {/* Actions */}
        {!current.resolved && (
          <div className="flex items-center gap-2 flex-wrap">
            {linkToDocument && current.document?.id && (
              <button
                onClick={e => { e.stopPropagation(); router.push(`/dashboard/library?note=${current.document!.id}`); }}
                className="text-xs px-2.5 py-1 rounded-lg transition-opacity hover:opacity-80"
                style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-2)' }}
              >
                View note
              </button>
            )}
            {!answerVisible && current.correctAnswer && (
              <button
                onClick={e => { e.stopPropagation(); setAnswerVisible(true); }}
                className="text-xs px-2.5 py-1 rounded-lg transition-opacity hover:opacity-80"
                style={{ backgroundColor: 'rgba(245,158,11,0.12)', color: '#F59E0B' }}
              >
                Show answer
              </button>
            )}
            {(answerVisible || !current.correctAnswer) && (
              <button
                onClick={handleResolve}
                disabled={resolving}
                className="text-xs px-2.5 py-1 rounded-lg transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: 'var(--success-subtle)', color: 'var(--success)' }}
              >
                {resolving ? '…' : 'Resolve'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
