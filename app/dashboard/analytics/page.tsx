'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  analyticsApi,
  OverviewStats,
  TimeBySubjectData,
  QuizHistoryData,
  StudySessionsData,
  WeakTopicsSummaryData,
} from '@/lib/api/analytics';
import { weakTopicsApi } from '@/lib/api/studyPlan';

// ─── Helpers ────────────────────────────────────────────────────────────────

function fmtMins(mins: number): string {
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function scoreColor(score: number): string {
  if (score >= 80) return '#22C55E';
  if (score >= 60) return '#F59E0B';
  return '#EF4444';
}

function daysAgo(dateStr: string | null): string {
  if (!dateStr) return 'Never';
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  return `${diff} days ago`;
}

function streakMessage(days: number): string {
  if (days === 0) return 'Start studying today to begin your streak';
  if (days < 7) return 'Great start! Keep going';
  if (days < 14) return 'One week strong!';
  if (days < 30) return "You're on fire!";
  return 'Incredible dedication!';
}

// ─── Skeleton ───────────────────────────────────────────────────────────────

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`rounded-lg animate-pulse ${className}`} style={{ backgroundColor: 'var(--bg-input)' }} />;
}

// ─── Section wrapper ────────────────────────────────────────────────────────

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl p-5 ${className}`} style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
      {children}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-sm font-semibold text-[var(--text-1)] mb-4">{children}</h2>;
}

// ─── Progress bar ───────────────────────────────────────────────────────────

function ProgressBar({ pct, color = '#9747FF', height = 6 }: { pct: number; color?: string; height?: number }) {
  return (
    <div className="rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-input)', height }}>
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${Math.min(100, pct)}%`, backgroundColor: color }}
      />
    </div>
  );
}

// ─── Main page ──────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const [overview, setOverview] = useState<OverviewStats | null>(null);
  const [timeBySubject, setTimeBySubject] = useState<TimeBySubjectData | null>(null);
  const [quizHistory, setQuizHistory] = useState<QuizHistoryData | null>(null);
  const [studySessions, setStudySessions] = useState<StudySessionsData | null>(null);
  const [weakSummary, setWeakSummary] = useState<WeakTopicsSummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [weakTab, setWeakTab] = useState<'needs' | 'resolved'>('needs');
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      analyticsApi.getOverview(),
      analyticsApi.getTimeBySubject(),
      analyticsApi.getQuizHistory(),
      analyticsApi.getStudySessions(),
      analyticsApi.getWeakTopicsSummary(),
    ]).then(([ov, tbs, qh, ss, wt]) => {
      if (ov.data) setOverview(ov.data);
      if (tbs.data) setTimeBySubject(tbs.data);
      if (qh.data) setQuizHistory(qh.data);
      if (ss.data) setStudySessions(ss.data);
      if (wt.data) setWeakSummary(wt.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  async function handleResolve(topicId: string) {
    setResolvingId(topicId);
    try {
      await weakTopicsApi.resolve(topicId);
      const { data } = await analyticsApi.getWeakTopicsSummary();
      if (data) setWeakSummary(data);
    } catch { /* ignore */ } finally {
      setResolvingId(null);
    }
  }

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-2 space-y-6">
        <div>
          <Skeleton className="h-7 w-32 mb-1" />
          <Skeleton className="h-4 w-48 mt-2" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-40" />)}
      </div>
    );
  }

  // ── Weekly activity setup ─────────────────────────────────────────────────
  const weeks = studySessions?.weeklyMins ?? [];
  const maxWeekMins = Math.max(...weeks.map(w => w.totalMins), 1);
  const MAX_BAR_H = 80;

  // ── Current week label ────────────────────────────────────────────────────
  const todayWeekStart = new Date();
  todayWeekStart.setDate(todayWeekStart.getDate() - todayWeekStart.getDay());
  const todayWeekLabel = todayWeekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <div className="max-w-5xl mx-auto py-2 space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-1)]">Analytics</h1>
        <p className="text-[var(--text-2)] text-sm mt-0.5">Last updated just now</p>
      </div>

      {/* ── Section 1: Overview stats ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { icon: '📄', label: 'Documents Uploaded', value: String(overview?.totalDocuments ?? 0) },
          {
            icon: '⏱', label: 'Time Studied',
            value: fmtMins(overview?.totalMinsStudied ?? 0),
          },
          {
            icon: '🔥', label: 'Current Streak',
            value: `${overview?.currentStreak ?? 0} days`,
          },
          {
            icon: '❓', label: 'Avg Quiz Score',
            value: `${overview?.avgQuizScore ?? 0}%`,
            valueColor: scoreColor(overview?.avgQuizScore ?? 0),
          },
          {
            icon: '✓', label: 'Tasks Completed',
            value: `${overview?.totalTasksCompleted ?? 0} / ${overview?.totalTasksCreated ?? 0}`,
          },
          {
            icon: '⚠', label: 'Weak Topics Remaining',
            value: String((overview?.totalWeakTopics ?? 0) - (overview?.resolvedWeakTopics ?? 0)),
          },
          {
            icon: '🎙️', label: 'Podcasts Generated',
            value: String(overview?.totalPodcastsGenerated ?? 0),
          },
        ].map(stat => (
          <Card key={stat.label}>
            <div className="flex items-start justify-between">
              <div>
                <p
                  className="text-2xl font-bold text-[var(--text-1)] mt-1"
                  style={stat.valueColor ? { color: stat.valueColor } : {}}
                >
                  {stat.value}
                </p>
                <p className="text-xs text-[var(--text-2)] mt-1">{stat.label}</p>
              </div>
              <span className="text-xl">{stat.icon}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* ── Section 2: Streak ──────────────────────────────────────────────── */}
      <Card>
        <div className="flex items-start justify-between gap-6 mb-4">
          <div className="flex items-center gap-3">
            <span className="text-4xl">🔥</span>
            <div>
              <p className="text-3xl font-bold text-[var(--text-1)] leading-none">
                {overview?.currentStreak ?? 0}
                <span className="text-sm font-normal text-[var(--text-2)] ml-1">day streak</span>
              </p>
              <p className="text-xs text-[var(--text-2)] mt-1">
                {streakMessage(overview?.currentStreak ?? 0)}
              </p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs text-[var(--text-2)] mb-0.5">Personal best</p>
            <p className="text-2xl font-bold text-[var(--text-1)]">
              {overview?.longestStreak ?? 0}
              <span className="text-xs font-normal text-[var(--text-2)] ml-1">days</span>
            </p>
          </div>
        </div>
        <ProgressBar
          pct={overview?.longestStreak ? ((overview.currentStreak / overview.longestStreak) * 100) : 0}
        />
        <p className="text-xs text-[var(--text-3)] mt-2">
          Last studied: {daysAgo(overview?.lastStudyDate ?? null)}
        </p>
      </Card>

      {/* ── Section 3: Quiz performance ────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Overall quiz stats */}
        <Card>
          <SectionTitle>Quiz Performance</SectionTitle>
          <div className="flex items-end gap-2 mb-4">
            <span
              className="text-4xl font-bold"
              style={{ color: scoreColor(overview?.avgQuizScore ?? 0) }}
            >
              {overview?.avgQuizScore ?? 0}%
            </span>
            <span className="text-[var(--text-2)] text-sm mb-1">average score</span>
          </div>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs text-[var(--text-2)] mb-1">
                <span>Accuracy</span>
                <span>{overview?.avgQuizScore ?? 0}%</span>
              </div>
              <ProgressBar
                pct={overview?.avgQuizScore ?? 0}
                color={scoreColor(overview?.avgQuizScore ?? 0)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-input)' }}>
                <p className="text-lg font-bold text-[var(--text-1)]">{overview?.totalQuizzesTaken ?? 0}</p>
                <p className="text-xs text-[var(--text-2)]">Quizzes taken</p>
              </div>
              <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-input)' }}>
                <p className="text-lg font-bold text-[var(--text-1)]">{overview?.bestQuizScore ?? 0}%</p>
                <p className="text-xs text-[var(--text-2)]">Best score</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Score improvement */}
        <Card>
          <SectionTitle>Score Improvement</SectionTitle>
          {!quizHistory?.byQuiz.length ? (
            <p className="text-sm text-[var(--text-2)] py-6 text-center">
              Take quizzes multiple times to track your improvement
            </p>
          ) : (
            <div className="space-y-3">
              {quizHistory.byQuiz.slice(0, 5).map(q => (
                <div key={q.quizId} className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-[var(--text-1)] truncate">{q.documentTitle}</p>
                    <p className="text-xs text-[var(--text-3)]">{q.attempts} attempt{q.attempts !== 1 ? 's' : ''}</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs shrink-0">
                    <span className="text-[var(--text-2)]">{q.firstScore}%</span>
                    <span className="text-[var(--text-3)]">→</span>
                    <span style={{ color: scoreColor(q.latestScore) }}>{q.latestScore}%</span>
                  </div>
                  <span
                    className="text-xs font-medium px-1.5 py-0.5 rounded shrink-0"
                    style={
                      q.improvement > 0
                        ? { backgroundColor: 'var(--success-subtle)', color: '#22C55E' }
                        : q.improvement < 0
                        ? { backgroundColor: 'var(--danger-subtle)', color: '#EF4444' }
                        : { backgroundColor: 'var(--bg-input)', color: '#6B7280' }
                    }
                  >
                    {q.improvement > 0 ? `+${q.improvement}%` : q.improvement < 0 ? `${q.improvement}%` : 'No change'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* ── Section 4: Time by subject ─────────────────────────────────────── */}
      <Card>
        <SectionTitle>Time by Subject</SectionTitle>
        {!timeBySubject?.bySubject.length && !timeBySubject?.untagged.totalMins ? (
          <p className="text-sm text-[var(--text-2)] text-center py-6">
            Create subject tags and assign them to tasks to see your time breakdown
          </p>
        ) : (
          <div className="space-y-3">
            {timeBySubject?.bySubject.map(s => (
              <div key={s.subjectTagId}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.subjectTagColor }} />
                    <span className="text-sm text-[var(--text-1)]">{s.subjectTagName}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-[var(--text-2)]">
                    <span>{fmtMins(s.totalMins)}</span>
                    <span className="w-8 text-right">{s.percentage}%</span>
                  </div>
                </div>
                <ProgressBar pct={s.percentage} color={s.subjectTagColor} height={5} />
              </div>
            ))}
            {(timeBySubject?.untagged.totalMins ?? 0) > 0 && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: '#4B5563' }} />
                    <span className="text-sm text-[var(--text-2)]">Untagged</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-[var(--text-2)]">
                    <span>{fmtMins(timeBySubject!.untagged.totalMins)}</span>
                    <span className="w-8 text-right">{timeBySubject!.untagged.percentage}%</span>
                  </div>
                </div>
                <ProgressBar pct={timeBySubject!.untagged.percentage} color="#4B5563" height={5} />
              </div>
            )}
          </div>
        )}
      </Card>

      {/* ── Section 5: Weekly activity ─────────────────────────────────────── */}
      <Card>
        <SectionTitle>Weekly Activity</SectionTitle>
        {weeks.every(w => w.totalMins === 0) ? (
          <p className="text-sm text-[var(--text-2)] text-center py-6">
            Complete study sessions to see your weekly activity
          </p>
        ) : (
          <div className="flex items-end gap-2 overflow-x-auto pb-1">
            {weeks.map((week, i) => {
              const barH = Math.max(4, Math.round((week.totalMins / maxWeekMins) * MAX_BAR_H));
              const isCurrent = week.weekLabel.startsWith(todayWeekLabel.slice(0, 6));
              return (
                <div key={i} className="flex-1 min-w-[72px] flex flex-col items-center gap-1.5">
                  {/* Bar */}
                  <div
                    className="w-full rounded-lg transition-all duration-500"
                    style={{
                      height: barH,
                      backgroundColor: isCurrent ? '#9747FF' : 'var(--bg-input)',
                      border: isCurrent ? '1px solid #9747FF' : '1px solid var(--border-md)',
                      minHeight: 4,
                    }}
                  />
                  {/* Stats */}
                  <div className="text-center">
                    <p className="text-xs font-medium" style={{ color: isCurrent ? '#9747FF' : '#9CA3AF' }}>
                      {fmtMins(week.totalMins)}
                    </p>
                    <p className="text-xs text-[var(--text-3)]">{week.sessionCount} sess.</p>
                    <p className="text-xs text-[var(--text-3)] mt-0.5" style={{ fontSize: '10px' }}>
                      {week.weekLabel.split(' - ')[0]}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* ── Section 6: Weak topics ─────────────────────────────────────────── */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <SectionTitle>Weak Topics</SectionTitle>
          {(weakSummary?.total ?? 0) > 0 && (
            <span className="text-xs text-[var(--text-2)]">
              {weakSummary!.resolved} / {weakSummary!.total} resolved
            </span>
          )}
        </div>

        {(weakSummary?.total ?? 0) > 0 && (
          <div className="mb-4">
            <div className="flex justify-between text-xs text-[var(--text-2)] mb-1">
              <span>Resolution rate</span>
              <span>{weakSummary!.resolutionRate}%</span>
            </div>
            <ProgressBar pct={weakSummary!.resolutionRate} color="#22C55E" />
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mb-4 p-1 rounded-lg w-fit" style={{ backgroundColor: 'var(--bg-input)' }}>
          {(['needs', 'resolved'] as const).map(t => (
            <button
              key={t}
              onClick={() => setWeakTab(t)}
              className="px-3 py-1 rounded-md text-xs font-medium transition-colors"
              style={weakTab === t ? { backgroundColor: '#9747FF', color: 'white' } : { color: '#9CA3AF' }}
            >
              {t === 'needs' ? 'Needs Review' : 'Resolved'}
            </button>
          ))}
        </div>

        {weakTab === 'needs' && (() => {
          const groups = weakSummary?.byDocument.filter(d => d.topics.some(t => !t.resolved)) ?? [];
          if (!groups.length) {
            return <p className="text-sm text-[var(--text-2)] text-center py-6">No topics need review right now</p>;
          }
          return (
            <div className="space-y-5">
              {groups.map(doc => (
                <div key={doc.documentId}>
                  <p className="text-xs font-semibold text-[var(--text-2)] mb-2 flex items-center gap-1.5">
                    <span>📄</span>{doc.documentTitle}
                  </p>
                  <div className="space-y-2">
                    {doc.topics.filter(t => !t.resolved).map(topic => (
                      <div key={topic.id} className="flex items-center gap-3 p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border)' }}>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-[var(--text-1)] truncate">{topic.topic}</p>
                          <p className="text-xs text-[var(--text-3)] mt-0.5">
                            Last missed: {new Date(topic.lastMissedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span
                          className="text-xs font-medium px-1.5 py-0.5 rounded shrink-0"
                          style={
                            topic.missedCount >= 3
                              ? { backgroundColor: 'var(--danger-subtle)', color: '#EF4444' }
                              : topic.missedCount === 2
                              ? { backgroundColor: 'var(--warning-subtle)', color: '#F59E0B' }
                              : { backgroundColor: 'var(--bg-input)', color: '#9CA3AF' }
                          }
                        >
                          missed {topic.missedCount}×
                        </span>
                        <Link
                          href={`/dashboard/library/${doc.documentId}`}
                          className="text-xs text-purple-400 shrink-0 hover:text-purple-300"
                        >
                          Review
                        </Link>
                        <button
                          onClick={() => handleResolve(topic.id)}
                          disabled={resolvingId === topic.id}
                          className="text-xs shrink-0 px-2 py-1 rounded-lg disabled:opacity-50 hover:opacity-90"
                          style={{ backgroundColor: 'var(--success-subtle)', color: '#22C55E' }}
                        >
                          {resolvingId === topic.id ? '…' : 'Resolve'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          );
        })()}

        {weakTab === 'resolved' && (() => {
          const groups = weakSummary?.byDocument.filter(d => d.topics.some(t => t.resolved)) ?? [];
          if (!groups.length) {
            return <p className="text-sm text-[var(--text-2)] text-center py-6">No resolved topics yet</p>;
          }
          return (
            <div className="space-y-5">
              {groups.map(doc => (
                <div key={doc.documentId}>
                  <p className="text-xs font-semibold text-[var(--text-2)] mb-2 flex items-center gap-1.5">
                    <span>📄</span>{doc.documentTitle}
                  </p>
                  <div className="space-y-2">
                    {doc.topics.filter(t => t.resolved).map(topic => (
                      <div key={topic.id} className="flex items-center gap-3 p-3 rounded-lg opacity-70" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--success-border)' }}>
                        <span className="text-green-400 shrink-0">✓</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-[var(--text-1)] truncate">{topic.topic}</p>
                          <p className="text-xs text-[var(--text-3)] mt-0.5">Resolved</p>
                        </div>
                        <span className="text-xs text-[var(--text-3)] shrink-0">
                          missed {topic.missedCount}×
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          );
        })()}
      </Card>

      {/* ── Section 7: Recent sessions ─────────────────────────────────────── */}
      <Card>
        <SectionTitle>Recent Sessions</SectionTitle>
        {!studySessions?.sessions.length ? (
          <p className="text-sm text-[var(--text-2)] text-center py-6">
            Complete a study session to see your history here
          </p>
        ) : (
          <div className="space-y-2">
            {studySessions.sessions.slice(0, 10).map(s => (
              <div key={s.id} className="flex items-center gap-4 p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border)' }}>
                <span
                  className="text-xs font-medium px-2 py-0.5 rounded shrink-0"
                  style={
                    s.mode === 'pomodoro'
                      ? { backgroundColor: 'var(--danger-subtle)', color: '#EF4444' }
                      : { backgroundColor: '#3B82F620', color: '#60A5FA' }
                  }
                >
                  {s.mode === 'pomodoro' ? 'Pomodoro' : 'Time Block'}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[var(--text-1)]">
                    {new Date(s.startedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    {' at '}
                    {new Date(s.startedAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                  </p>
                  {s.totalTasks > 0 && (
                    <p className="text-xs text-[var(--text-2)]">
                      {s.tasksCompleted} / {s.totalTasks} tasks completed
                    </p>
                  )}
                </div>
                <span className="text-sm font-medium text-[var(--text-1)] shrink-0">
                  {fmtMins(s.totalMins)}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* ── Section 8: Task completion ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Overall task stats */}
        <Card>
          <SectionTitle>Task Completion</SectionTitle>
          <div className="flex items-end gap-2 mb-4">
            <span
              className="text-4xl font-bold"
              style={{ color: scoreColor(overview?.taskCompletionRate ?? 0) }}
            >
              {overview?.taskCompletionRate ?? 0}%
            </span>
            <span className="text-[var(--text-2)] text-sm mb-1">completion rate</span>
          </div>
          <ProgressBar
            pct={overview?.taskCompletionRate ?? 0}
            color={scoreColor(overview?.taskCompletionRate ?? 0)}
          />
          <div className="grid grid-cols-2 gap-3 mt-3">
            <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-input)' }}>
              <p className="text-lg font-bold text-[var(--text-1)]">{overview?.totalTasksCompleted ?? 0}</p>
              <p className="text-xs text-[var(--text-2)]">Completed</p>
            </div>
            <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-input)' }}>
              <p className="text-lg font-bold text-[var(--text-1)]">
                {(overview?.totalTasksCreated ?? 0) - (overview?.totalTasksCompleted ?? 0)}
              </p>
              <p className="text-xs text-[var(--text-2)]">Remaining</p>
            </div>
          </div>
        </Card>

        {/* By subject */}
        <Card>
          <SectionTitle>Tasks by Subject</SectionTitle>
          {!timeBySubject?.bySubject.length ? (
            <p className="text-sm text-[var(--text-2)] text-center py-6">
              Create subject tags to see tasks by subject
            </p>
          ) : (
            <div className="space-y-3">
              {timeBySubject.bySubject.map(s => (
                <div key={s.subjectTagId}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.subjectTagColor }} />
                      <span className="text-xs text-[var(--text-1)]">{s.subjectTagName}</span>
                    </div>
                    <span className="text-xs text-[var(--text-2)]">{s.tasksCompleted} done</span>
                  </div>
                  <ProgressBar
                    pct={s.tasksCompleted > 0 ? 100 : 0}
                    color={s.subjectTagColor}
                    height={4}
                  />
                </div>
              ))}
              {(timeBySubject.untagged.tasksCompleted > 0) && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#4B5563' }} />
                      <span className="text-xs text-[var(--text-2)]">Untagged</span>
                    </div>
                    <span className="text-xs text-[var(--text-2)]">{timeBySubject.untagged.tasksCompleted} done</span>
                  </div>
                  <ProgressBar pct={50} color="#4B5563" height={4} />
                </div>
              )}
            </div>
          )}
        </Card>
      </div>

    </div>
  );
}
