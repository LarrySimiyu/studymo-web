import { api } from '@/lib/api';

export interface StudyPlanDay {
  id: string;
  planId: string;
  dayNumber: number;
  date: string;
  title: string;
  topics: string; // JSON
  documentIds: string; // JSON
  completed: boolean;
  completedAt: string | null;
  createdAt: string;
}

export interface StudyPlan {
  id: string;
  userId: string;
  title: string;
  testDate: string;
  active: boolean;
  documentIds: string; // JSON
  schedule: string; // JSON
  createdAt: string;
  updatedAt: string;
  dayEntries?: StudyPlanDay[];
  daysUntilTest?: number;
}

export interface WeakTopic {
  id: string;
  userId: string;
  documentId: string;
  document?: { id: string; title: string };
  topic: string;
  correctAnswer: string | null;
  missedCount: number;
  lastMissedAt: string;
  resolved: boolean;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StudyStreak {
  id?: string;
  userId?: string;
  currentStreak: number;
  longestStreak: number;
  lastStudyDate: string | null;
}

export interface WeakTopicSummary {
  totalWeakTopics: number;
  byDocument: { documentId: string; documentTitle: string; weakTopicCount: number; topics: string[] }[];
  mostMissed: { topic: string; documentTitle: string; missedCount: number }[];
}

export const studyPlansApi = {
  getAll: () => api.get<StudyPlan[]>('/study-plans'),
  create: (data: { title: string; testDate: string; documentIds: string[] }) =>
    api.post<StudyPlan>('/study-plans', data),
  getById: (id: string) => api.get<StudyPlan>(`/study-plans/${id}`),
  completeDay: (planId: string, dayId: string) =>
    api.patch<StudyPlanDay>(`/study-plans/${planId}/days/${dayId}/complete`, {}),
  incompleteDay: (planId: string, dayId: string) =>
    api.patch<StudyPlanDay>(`/study-plans/${planId}/days/${dayId}/incomplete`, {}),
  delete: (id: string) => api.delete<void>(`/study-plans/${id}`),
};

export const weakTopicsApi = {
  getAll: (params?: { documentId?: string }) => {
    const qs = params?.documentId ? `?documentId=${params.documentId}` : '';
    return api.get<WeakTopic[]>(`/weak-topics${qs}`);
  },
  getSummary: () => api.get<WeakTopicSummary>('/weak-topics/summary'),
  resolve: (id: string) => api.patch<WeakTopic>(`/weak-topics/${id}/resolve`, {}),
};

export const streakApi = {
  get: () => api.get<StudyStreak>('/streak'),
};
