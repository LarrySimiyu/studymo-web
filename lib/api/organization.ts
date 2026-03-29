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

export interface NoteTag {
  id: string;
  userId: string;
  name: string;
  color: string;
  createdAt: string;
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

export interface ExamQuestion {
  number: number;
  type: 'multiple_choice' | 'short_answer' | 'essay';
  question: string;
  options?: string[];
  correctAnswer?: string;
  explanation?: string;
  rubric?: string;
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
  answerKey: { number: number; answer: string; points: number }[];
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

export const noteTagsApi = {
  getAll: () => api.get<NoteTag[]>('/note-tags'),
  create: (data: { name: string; color: string }) => api.post<NoteTag>('/note-tags', data),
  update: (id: string, data: { name?: string; color?: string }) =>
    api.patch<NoteTag>(`/note-tags/${id}`, data),
  delete: (id: string) => api.delete<void>(`/note-tags/${id}`),
  assign: (tagId: string, noteId: string) =>
    api.post(`/note-tags/${tagId}/assign`, { noteId }),
  unassign: (tagId: string, noteId: string) =>
    api.delete(`/note-tags/${tagId}/assign/${noteId}`),
};

export const practiceExamsApi = {
  getAll: () => api.get<PracticeExam[]>('/practice-exams'),
  create: (data: { title: string; documentIds: string[] }) =>
    api.post<PracticeExam>('/practice-exams', data),
  getById: (id: string) => api.get<PracticeExam>(`/practice-exams/${id}`),
  delete: (id: string) => api.delete<void>(`/practice-exams/${id}`),
};
