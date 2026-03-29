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
};
