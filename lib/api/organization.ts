import { api } from '@/lib/api';

export interface Folder {
  id: string;
  userId: string;
  name: string;
  color: string | null;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { documents: number };
  children?: Folder[];
}

export interface PracticeExam {
  id: string;
  userId: string;
  title: string;
  documentIds: string;
  questions: string | ExamContent;
  createdAt: string;
  documents?: { id: string; title: string }[];
}

export interface PracticeExamAttempt {
  id: string;
  userId: string;
  practiceExamId: string;
  score: number;
  earnedPoints: number;
  totalPoints: number;
  answers: string;
  results: string;
  createdAt: string;
}

export interface PracticeExamProgress {
  id: string;
  practiceExamId: string;
  answers: Record<number, string>;
  updatedAt: string;
}

export interface ExamQuestion {
  number: number;
  type: 'multiple_choice' | 'short_answer' | 'true_false';
  question: string;
  options?: string[];
  correctAnswer?: string;
  explanation?: string;
  points: number;
}

export interface ExamSection {
  title: string;
  instructions: string;
  questions: ExamQuestion[];
}

export interface ExamContent {
  sections: ExamSection[];
  totalPoints: number;
  estimatedMinutes: number;
}

export const foldersApi = {
  getAll: () => api.get<Folder[]>('/folders'),
  create: (data: { name: string; color?: string; parentId?: string }) =>
    api.post<Folder>('/folders', data),
  update: (id: string, data: { name?: string; color?: string; parentId?: string | null }) =>
    api.patch<Folder>(`/folders/${id}`, data),
  delete: (id: string) => api.delete<void>(`/folders/${id}`),
  moveDocument: (folderId: string, documentId: string) =>
    api.patch(`/folders/${folderId}/move-document`, { documentId }),
};

export const practiceExamsApi = {
  getAll: () => api.get<PracticeExam[]>('/practice-exams'),
  create: (data: { title: string; documentIds: string[]; questionTypes: string[]; durationMinutes: number }) =>
    api.post<PracticeExam>('/practice-exams', data),
  getById: (id: string) => api.get<PracticeExam>(`/practice-exams/${id}`),
  delete: (id: string) => api.delete<void>(`/practice-exams/${id}`),
  gradeAnswer: (data: { question: string; correctAnswer: string; userAnswer: string }) =>
    api.post<{ correct: boolean; partialCredit: number; feedback: string }>('/practice-exams/grade-answer', data),
  submitAttempt: (id: string, data: {
    score: number;
    earnedPoints: number;
    totalPoints: number;
    answers: Record<number, string>;
    results: Record<number, { correct: boolean; partialCredit: number; feedback: string }>;
  }) => api.post<PracticeExamAttempt>(`/practice-exams/${id}/attempt`, data),
  saveProgress: (id: string, answers: Record<number, string>) =>
    api.put<PracticeExamProgress>(`/practice-exams/${id}/progress`, { answers }),
  getProgress: (id: string) =>
    api.get<PracticeExamProgress | null>(`/practice-exams/${id}/progress`),
  getAttempts: (id: string) =>
    api.get<PracticeExamAttempt[]>(`/practice-exams/${id}/attempts`),
};
