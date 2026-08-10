'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { weakTopicsApi, WeakTopic } from '@/lib/api/studyPlan';
import { Button } from '@/components/ui/Button';

interface Props {
  topic: WeakTopic;
  linkToDocument?: boolean;
  onResolved?: (updated: WeakTopic) => void;
}

function severityColor(missedCount: number) {
  if (missedCount >= 5) return { badge: 'var(--danger-subtle)', text: 'var(--danger-ink)' };
  if (missedCount >= 3) return { badge: 'var(--warning-subtle)', text: 'var(--warning-ink)' };
  return { badge: 'var(--bg-input)', text: 'var(--text-3)' };
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
    <div className="rounded-xl bg-[var(--bg-card)] px-4 py-3 transition-colors hover:bg-[var(--bg-hover)]">
      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col gap-4">
        {/* Topic name */}
        <div className="flex items-start justify-between gap-2">
          <p className="text-body-sm text-[var(--text-1)] leading-snug">{current.topic}</p>
          {current.resolved && (
            <span className="shrink-0 rounded-full bg-[var(--success-subtle)] px-2 py-0.5 text-xs font-medium text-[var(--success-ink)]">
              Resolved
            </span>
          )}
        </div>

        {/* Answer block */}
        {answerVisible && current.correctAnswer && (
          <div className="rounded-lg border border-[var(--success-border)] bg-[var(--success-subtle)] px-3 py-2 text-xs font-semibold leading-relaxed text-[var(--success-ink)]">
            {current.correctAnswer}
          </div>
        )}

        {/* Actions + missed count */}
        {!current.resolved && (
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="rounded-full px-2 py-0.5 text-xs font-medium"
              style={{ backgroundColor: colors.badge, color: colors.text }}
            >
              {current.missedCount}× missed
            </span>
            {linkToDocument && current.document?.id && (
              <Button
                variant="secondary"
                size="xs"
                onClick={e => { e.stopPropagation(); router.push(`/dashboard/library/${current.document!.id}`); }}
              >
                View note
              </Button>
            )}
            {!answerVisible && current.correctAnswer && (
              <Button
                variant="warning"
                size="xs"
                onClick={e => { e.stopPropagation(); setAnswerVisible(true); }}
              >
                Show answer
              </Button>
            )}
            {(answerVisible || !current.correctAnswer) && (
              <Button variant="success" size="xs" onClick={handleResolve} disabled={resolving}>
                {resolving ? '…' : 'Resolve'}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
