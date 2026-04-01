import { api } from '@/lib/api';

export interface OverviewStats {
  totalDocuments: number;
  totalNotesGenerated: number;
  totalFlashcardsGenerated: number;
  totalQuizzesTaken: number;
  totalPracticeExamsTaken: number;
  totalMinsStudied: number;
  avgSessionMins: number;
  longestSessionMins: number;
  currentStreak: number;
  longestStreak: number;
  lastStudyDate: string | null;
  avgQuizScore: number;
  bestQuizScore: number;
  totalQuestionsAnswered: number;
  totalQuestionsCorrect: number;
  totalTasksCreated: number;
  totalTasksCompleted: number;
  taskCompletionRate: number;
  totalWeakTopics: number;
  resolvedWeakTopics: number;
  totalStudyPlans: number;
  activePlans: number;
  totalPlanDaysCompleted: number;
  totalPodcastsGenerated: number;
}

export interface TimeBySubjectData {
  bySubject: {
    subjectTagId: string;
    subjectTagName: string;
    subjectTagColor: string;
    totalMins: number;
    percentage: number;
    tasksCompleted: number;
  }[];
  untagged: { totalMins: number; percentage: number; tasksCompleted: number };
}

export interface QuizHistoryData {
  attempts: {
    id: string;
    quizId: string;
    documentTitle: string;
    score: number;
    totalQuestions: number;
    correctAnswers: number;
    takenAt: string;
  }[];
  byQuiz: {
    quizId: string;
    documentTitle: string;
    attempts: number;
    firstScore: number;
    latestScore: number;
    improvement: number;
    bestScore: number;
  }[];
}

export interface StudySessionsData {
  sessions: {
    id: string;
    mode: string;
    totalMins: number;
    tasksCompleted: number;
    totalTasks: number;
    startedAt: string;
    endedAt: string | null;
  }[];
  weeklyMins: {
    weekLabel: string;
    totalMins: number;
    sessionCount: number;
  }[];
}

export interface WeakTopicsSummaryData {
  total: number;
  resolved: number;
  resolutionRate: number;
  byDocument: {
    documentId: string;
    documentTitle: string;
    weakTopicCount: number;
    resolvedCount: number;
    topics: {
      id: string;
      topic: string;
      missedCount: number;
      resolved: boolean;
      lastMissedAt: string;
      correctAnswer: string | null;
      resolvedAt: string | null;
      documentId: string;
      document: { id: string; title: string };
    }[];
  }[];
  mostMissed: { topic: string; documentTitle: string; missedCount: number }[];
}

export const analyticsApi = {
  getOverview: () => api.get<OverviewStats>('/analytics/overview'),
  getTimeBySubject: () => api.get<TimeBySubjectData>('/analytics/time-by-subject'),
  getQuizHistory: () => api.get<QuizHistoryData>('/analytics/quiz-history'),
  getStudySessions: () => api.get<StudySessionsData>('/analytics/study-sessions'),
  getWeakTopicsSummary: () => api.get<WeakTopicsSummaryData>('/analytics/weak-topics-summary'),
  getActivityHeatmap: (year: number, month?: number) =>
    api.get<ActivityDay[]>(month
      ? `/analytics/activity?year=${year}&month=${month}`
      : `/analytics/activity?year=${year}`
    ),
};

/**
 * Activity levels per day:
 *   0 — no activity
 *   1 — signed in / visited (any API call triggers a server-side ping)
 *   2 — uploaded a document
 *   3 — took a quiz, studied flashcards, or chatted with the tutor
 *
 * Streak is now calculated server-side based on consecutive visit days,
 * not quiz attempts. Call activityApi.ping() on dashboard mount to record
 * the visit and keep the streak alive.
 */
export interface ActivityDay {
  date: string; // YYYY-MM-DD
  level: 0 | 1 | 2 | 3;
}

export const activityApi = {
  /** Call once on dashboard mount to record a site visit for streak tracking. */
  ping: () => api.post<{ currentStreak: number; longestStreak: number }>('/activity/ping', {}),
};
