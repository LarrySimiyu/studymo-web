'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { analyticsApi, QuizHistoryData } from '@/lib/api/analytics';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function scoreColor(score: number): string {
  if (score >= 80) return '#16a34a';
  if (score >= 60) return '#d97706';
  return '#dc2626';
}

function scoreBg(score: number): string {
  if (score >= 80) return 'var(--success-subtle)';
  if (score >= 60) return 'var(--warning-subtle)';
  return 'var(--danger-subtle)';
}

// ─── Small ring (per-quiz) ────────────────────────────────────────────────────

function SmallRing({ value, size = 40 }: { value: number; size?: number }) {
  const radius = (size - 6) / 2;
  const circumference = 2 * Math.PI * radius;
  const color = scoreColor(value);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
      {/* Track */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="var(--bg-input)"
        strokeWidth={5}
      />
      {/* Fill */}
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={5}
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: circumference - (value / 100) * circumference }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />
    </svg>
  );
}

// ─── Large ring (average) ─────────────────────────────────────────────────────

function LargeRing({ value }: { value: number }) {
  const size = 140;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const color = scoreColor(value);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ transform: 'rotate(-90deg)' }}
      >
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--bg-input)"
          strokeWidth={strokeWidth}
        />
        {/* Fill */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - (value / 100) * circumference }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
      </svg>
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="text-3xl font-bold leading-none"
          style={{ color }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {value}%
        </motion.span>
        <span className="text-xs text-[var(--text-3)] mt-0.5">avg score</span>
      </div>
    </div>
  );
}

// ─── Quiz row (collapsible list item) ────────────────────────────────────────

interface QuizRowProps {
  documentTitle: string;
  latestScore: number;
  attempts: number;
  improvement: number;
}

function QuizRow({ documentTitle, latestScore, attempts, improvement }: QuizRowProps) {
  const color = scoreColor(latestScore);
  const impColor = improvement > 0 ? '#16a34a' : improvement < 0 ? '#dc2626' : '#6B7280';
  const impBg = improvement > 0 ? 'var(--success-subtle)' : improvement < 0 ? 'var(--danger-subtle)' : 'var(--bg-input)';
  const arrow = improvement > 0 ? '↑' : improvement < 0 ? '↓' : '→';

  return (
    <div
      className="flex items-center gap-3 p-3 rounded-xl"
      style={{ border: '1px solid var(--border)', backgroundColor: 'var(--bg-page)' }}
    >
      {/* Small ring */}
      <div className="relative shrink-0">
        <SmallRing value={latestScore} size={44} />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[10px] font-bold" style={{ color }}>{latestScore}%</span>
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-[var(--text-1)] truncate">{documentTitle}</p>
        <p className="text-xs text-[var(--text-3)]">{attempts} attempt{attempts !== 1 ? 's' : ''}</p>
      </div>

      {/* Improvement badge — only show if score changed */}
      {improvement !== 0 && (
        <span
          className="text-xs font-semibold px-1.5 py-0.5 rounded-full shrink-0 flex items-center gap-0.5"
          style={{ backgroundColor: impBg, color: impColor }}
        >
          <span>{arrow}</span>
          <span>{Math.abs(improvement)}%</span>
        </span>
      )}
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

interface QuizScoreCardProps {
  /** Pass pre-fetched data if the parent already has it (analytics page).
   *  If omitted the component fetches its own data (home page). */
  avgScore?: number;
  totalQuizzesTaken?: number;
  bestScore?: number;
  quizHistory?: QuizHistoryData['byQuiz'];
}

export default function QuizScoreCard({
  avgScore: avgScoreProp,
  totalQuizzesTaken: totalProp,
  bestScore: bestProp,
  quizHistory: historyProp,
}: QuizScoreCardProps) {
  const [avgScore, setAvgScore] = useState(avgScoreProp ?? 0);
  const [total, setTotal] = useState(totalProp ?? 0);
  const [best, setBest] = useState(bestProp ?? 0);
  const [history, setHistory] = useState<QuizHistoryData['byQuiz']>(historyProp ?? []);

  // Self-fetch when not given props (home page usage)
  useEffect(() => {
    if (avgScoreProp !== undefined) return;
    Promise.all([analyticsApi.getOverview(), analyticsApi.getQuizHistory()])
      .then(([ov, qh]) => {
        if (ov.data) {
          setAvgScore(ov.data.avgQuizScore);
          setTotal(ov.data.totalQuizzesTaken);
          setBest(ov.data.bestQuizScore);
        }
        if (qh.data) setHistory(qh.data.byQuiz);
      })
      .catch(() => { });
  }, [avgScoreProp]);

  // Sync when props update
  useEffect(() => { if (avgScoreProp !== undefined) setAvgScore(avgScoreProp); }, [avgScoreProp]);
  useEffect(() => { if (totalProp !== undefined) setTotal(totalProp); }, [totalProp]);
  useEffect(() => { if (bestProp !== undefined) setBest(bestProp); }, [bestProp]);
  useEffect(() => { if (historyProp !== undefined) setHistory(historyProp); }, [historyProp]);

  const hasHistory = history.length > 0;

  return (
    <div
      className="rounded-xl p-5"
      style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
    >
      <h2 className="text-sm font-semibold text-[var(--text-1)] mb-5">Quiz Stats</h2>

      <div className="grid grid-cols-2 gap-5 items-start">
        {/* Left: ring + stats */}
        <div className="flex flex-col gap-3 items-center">
          <LargeRing value={avgScore} />
          <div className="flex flex-col gap-2 w-full">
            <div className="px-3 py-2 rounded-lg" style={{ backgroundColor: 'var(--bg-input)' }}>
              <p className="text-sm font-bold text-[var(--text-1)]">{total}</p>
              <p className="text-[10px] text-[var(--text-2)]">Quizzes taken</p>
            </div>
            <div className="px-3 py-2 rounded-lg" style={{ backgroundColor: scoreBg(best) }}>
              <p className="text-sm font-bold" style={{ color: scoreColor(best) }}>{best}%</p>
              <p className="text-[10px]" style={{ color: scoreColor(best), opacity: 0.8 }}>Best score</p>
            </div>
          </div>
        </div>

        {/* Right: history */}
        <div className="flex flex-col gap-2">
          {hasHistory ? (
            history.map(q => (
              <QuizRow
                key={q.quizId}
                documentTitle={q.documentTitle}
                latestScore={q.latestScore}
                attempts={q.attempts}
                improvement={q.improvement}
              />
            ))
          ) : total === 0 ? (
            <p className="text-sm text-[var(--text-2)] py-1">Take a quiz to see your score here</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
