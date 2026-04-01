import { api } from '@/lib/api';

export interface DocumentTag {
  documentId: string;
  tagId: string;
  tag: {
    id: string;
    name: string;
    color: string | null;
  };
}

export interface Document {
  id: string;
  userId: string;
  title: string;
  type: string;
  fileUrl: string | null;
  videoUrl: string | null;
  status: string;
  transcript: string | null;
  folderId: string | null;
  groupId: string | null;
  folder?: { id: string; name: string; color: string | null } | null;
  tags?: DocumentTag[];
  createdAt: string;
  updatedAt: string;
  notes?: Note[];
  flashcards?: Flashcard[];
  quizzes?: Quiz[];
}

export interface Note {
  id: string;
  userId: string;
  documentId: string;
  content: string;
  summary: string | null;
  keyTerms: string | null;
  isPublic: boolean;
  shareToken: string | null;
  createdAt: string;
  updatedAt: string;
  document?: { title: string };
  tags?: { tagId: string; tag: { id: string; name: string; color: string } }[];
}

export interface Flashcard {
  id: string;
  userId: string;
  documentId: string;
  front: string;
  back: string;
  createdAt: string;
}

export interface Quiz {
  id: string;
  userId: string;
  documentId: string;
  title: string;
  questions: string;
  createdAt: string;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  score: number;
  answers: string;
  createdAt: string;
}

export const documentsApi = {
  uploadFile: (formData: FormData) => api.postForm<Document>('/documents/upload', formData),
  uploadVideo: (data: { url: string; title: string; folderId?: string }) =>
    api.post<Document>('/documents/video', data),
  uploadRecording: (formData: FormData) => api.postForm<Document>('/documents/recording', formData),
  getAll: (params?: { folderId?: string; tagId?: string; search?: string; type?: string; sort?: string }) => {
    const qs = params
      ? new URLSearchParams(
          Object.entries(params)
            .filter(([, v]) => v !== undefined && v !== '')
            .map(([k, v]) => [k, String(v)])
        ).toString()
      : '';
    return api.get<Document[]>(`/documents${qs ? `?${qs}` : ''}`);
  },
  getById: (id: string) => api.get<Document>(`/documents/${id}`),
  rename: (id: string, title: string) => api.patch<Document>(`/documents/${id}/title`, { title }),
  delete: (id: string) => api.delete<void>(`/documents/${id}`),
  setFolder: (id: string, folderId: string | null) =>
    api.patch<Document>(`/documents/${id}/folder`, { folderId }),
  addTag: (id: string, tagId: string) =>
    api.post<Document>(`/documents/${id}/tags`, { tagId }),
  removeTag: (id: string, tagId: string) =>
    api.delete<void>(`/documents/${id}/tags/${tagId}`),
};

export const notesApi = {
  getAll: () => api.get<{ id: string; summary: string | null; document: { id: string; title: string } }[]>('/notes'),
  getByDocument: (documentId: string) => api.get<Note>(`/notes/${documentId}`),
  update: (id: string, content: string) => api.patch<Note>(`/notes/${id}`, { content }),
  share: (id: string) => api.post<{ shareUrl: string; note: Note }>(`/notes/${id}/share`, {}),
  getShared: (shareToken: string) => api.get<Note>(`/notes/shared/${shareToken}`),
};

export const flashcardsApi = {
  getByDocument: (documentId: string) => api.get<Flashcard[]>(`/flashcards/${documentId}`),
  generate: (documentId: string) => api.post<Flashcard[]>(`/flashcards/${documentId}/generate`, {}),
};

export const quizzesApi = {
  getByDocument: (documentId: string) => api.get<Quiz>(`/quizzes/${documentId}`),
  generate: (documentId: string, questionTypes?: string[]) => api.post<Quiz>(`/quizzes/${documentId}/generate`, { questionTypes }),
  submitAttempt: (id: string, score: number, answers: object) =>
    api.post<QuizAttempt>(`/quizzes/${id}/attempt`, { score, answers }),
};

// Document Tags API (for managing the tags themselves)
export const docTagsApi = {
  getAll: () => api.get<{ id: string; name: string; color: string | null }[]>('/tags'),
  create: (data: { name: string; color?: string }) =>
    api.post<{ id: string; name: string; color: string | null }>('/tags', data),
  update: (id: string, data: { name?: string; color?: string }) =>
    api.patch<{ id: string; name: string; color: string | null }>(`/tags/${id}`, data),
  delete: (id: string) => api.delete<void>(`/tags/${id}`),
};
