'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { analyticsApi, QuizHistoryData } from '@/lib/api/analytics';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function scoreColor(score: number): string {
  if (score >= 80) return '#22C55E';
  if (score >= 60) return '#F59E0B';
  return '#EF4444';
}

// ─── Circular progress ring ───────────────────────────────────────────────────

function Ring({ value, stroke, color, className }: { value: number; stroke: number; color: string; className?: string }) {
  const size = 100;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }} className={className}>
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--bg-input)" strokeWidth={stroke} />
      <motion.circle
        cx={size / 2} cy={size / 2} r={radius}
        fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: circumference - (value / 100) * circumference }}
        transition={{ duration: 1, ease: 'easeOut' }}
      />
    </svg>
  );
}

// ─── Metric tile ──────────────────────────────────────────────────────────────

function MetricRing({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-20 h-20 md:w-32 md:h-32">
        <Ring value={value} stroke={7} color={color} />
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.span
            className="text-sm font-bold leading-none md:text-2xl"
            style={{ color }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {value}%
          </motion.span>
        </div>
      </div>
      <p className="text-xs text-[var(--text-3)] text-center md:text-body-sm">{label}</p>
    </div>
  );
}

function MetricCount({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center justify-center w-20 h-20 md:w-32 md:h-32">
        <motion.span
          className="text-display font-bold md:text-[3.5rem]"
          style={{ color: 'var(--brand)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {value}
        </motion.span>
      </div>
      <p className="text-xs text-[var(--text-3)] text-center md:text-body-sm">{label}</p>
    </div>
  );
}

// ─── Quiz list row ────────────────────────────────────────────────────────────

function QuizRow({ documentTitle, latestScore, attempts, improvement }: {
  documentTitle: string;
  latestScore: number;
  attempts: number;
  improvement: number;
}) {
  const color = scoreColor(latestScore);
  const impColor = improvement > 0 ? '#22C55E' : improvement < 0 ? '#EF4444' : 'var(--text-3)';
  const impBg = improvement > 0 ? 'rgba(34,197,94,0.12)' : improvement < 0 ? 'rgba(239,68,68,0.12)' : 'var(--bg-input)';
  const arrow = improvement > 0 ? '↑' : improvement < 0 ? '↓' : '→';

  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors"
      style={{ backgroundColor: 'var(--bg-card)' }}
      onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
      onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--bg-card)')}
    >
      <div className="relative shrink-0 w-11 h-11">
        <Ring value={latestScore} stroke={4} color={color} />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[10px] font-bold" style={{ color }}>{latestScore}%</span>
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-body-sm font-medium text-[var(--text-1)] truncate">{documentTitle}</p>
        <p className="text-xs text-[var(--text-3)]">{attempts} attempt{attempts !== 1 ? 's' : ''}</p>
      </div>

      {improvement !== 0 && (
        <span
          className="text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 flex items-center gap-0.5"
          style={{ backgroundColor: impBg, color: impColor }}
        >
          {arrow}{Math.abs(improvement)}%
        </span>
      )}
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

interface Props {
  avgScore?: number;
  totalQuizzesTaken?: number;
  bestScore?: number;
  quizHistory?: QuizHistoryData['byQuiz'];
}

export default function QuizStatsCard({ avgScore: avgProp, totalQuizzesTaken: totalProp, bestScore: bestProp, quizHistory: historyProp }: Props) {
  const [avg, setAvg] = useState(avgProp ?? 0);
  const [total, setTotal] = useState(totalProp ?? 0);
  const [best, setBest] = useState(bestProp ?? 0);
  const [history, setHistory] = useState<QuizHistoryData['byQuiz']>(historyProp ?? []);

  useEffect(() => {
    if (avgProp !== undefined) return;
    Promise.all([analyticsApi.getOverview(), analyticsApi.getQuizHistory()])
      .then(([ov, qh]) => {
        if (ov.data) { setAvg(ov.data.avgQuizScore); setTotal(ov.data.totalQuizzesTaken); setBest(ov.data.bestQuizScore); }
        if (qh.data) setHistory(qh.data.byQuiz);
      })
      .catch(() => {});
  }, [avgProp]);

  useEffect(() => { if (avgProp !== undefined) setAvg(avgProp); }, [avgProp]);
  useEffect(() => { if (totalProp !== undefined) setTotal(totalProp); }, [totalProp]);
  useEffect(() => { if (bestProp !== undefined) setBest(bestProp); }, [bestProp]);
  useEffect(() => { if (historyProp !== undefined) setHistory(historyProp); }, [historyProp]);

  return (
    <div>
      <h2 className="text-xs font-medium text-[var(--text-2)] mb-2">Quiz Stats</h2>

      {/* Metrics row */}
      <div
        className="grid grid-cols-3 gap-3 p-5 md:p-8 rounded-xl mb-3"
        style={{ backgroundColor: 'var(--bg-card)' }}
      >
        <MetricRing value={avg} label="Avg Score" color={scoreColor(avg)} />
        <MetricRing value={best} label="Best Score" color="#22C55E" />
        <MetricCount value={total} label="Attempts" />
      </div>

      {/* Quiz list */}
      {history.length > 0 ? (
        <div className="flex flex-col gap-2">
          {history.map(q => (
            <QuizRow
              key={q.quizId}
              documentTitle={q.documentTitle}
              latestScore={q.latestScore}
              attempts={q.attempts}
              improvement={q.improvement}
            />
          ))}
        </div>
      ) : total === 0 ? (
        <p className="text-body-sm text-[var(--text-2)] px-1">Take a quiz to see your stats here.</p>
      ) : null}
    </div>
  );
}
