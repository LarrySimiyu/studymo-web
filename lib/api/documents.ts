import { api } from '@/lib/api';
import { auth } from '@/lib/firebase';
import { emitContentChanged } from '@/lib/contentEvents';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

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
  errorMessage: string | null;
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
  type?: string;
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
  presign: (body: {
    mimeType: string;
    title: string;
    folderId?: string;
    groupId?: string;
    isRecording?: boolean;
    fileSize?: number;
  }) => api.post<{ uploadUrl: string; doc: Document }>('/documents/presign', body),
  triggerProcess: (docId: string) =>
    api.post<{ message: string }>(`/documents/${docId}/process`, {}),
  uploadWebpage: (data: { url: string; title?: string; folderId?: string }) =>
    api.post<Document>('/documents/webpage', data),
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
  // Short-lived signed URL for the original upload, so viewing doesn't rely on
  // the storage bucket being publicly readable.
  getFileUrl: (id: string) => api.get<{ url: string }>(`/documents/${id}/file`),
  delete: (id: string) => api.delete<void>(`/documents/${id}`),
  setFolder: (id: string, folderId: string | null) =>
    api.patch<Document>(`/documents/${id}/folder`, { folderId }),
  addTag: (id: string, tagId: string) =>
    api.post<Document>(`/documents/${id}/tags`, { tagId }),
  removeTag: (id: string, tagId: string) =>
    api.delete<void>(`/documents/${id}/tags/${tagId}`),
};

export const notesApi = {
  createBlank: (title?: string) => api.post<{ documentId: string; noteId: string }>('/notes/blank', { title }),
  getAll: () => api.get<{ id: string; summary: string | null; updatedAt: string; document: { id: string; title: string } }[]>('/notes'),
  getByDocument: (documentId: string) => api.get<Note>(`/notes/${documentId}`),
  update: (id: string, content: string) => api.patch<Note>(`/notes/${id}`, { content }),
  append: (id: string, heading: string, content: string) => api.post<Note>(`/notes/${id}/append`, { heading, content }),
  simplify: (text: string) => api.post<{ options: { label: string; text: string }[] }>('/notes/simplify', { text }),
  share: (id: string) => api.post<{ shareUrl: string; note: Note }>(`/notes/${id}/share`, {}),
  getShared: (shareToken: string) => api.get<Note>(`/notes/shared/${shareToken}`),
};

export const flashcardsApi = {
  getDecks: () => api.get<{ documentId: string; count: number }[]>('/flashcards/decks'),
  getByDocument: (documentId: string) => api.get<Flashcard[]>(`/flashcards/${documentId}`),
  generate: (documentId: string) => api.post<Flashcard[]>(`/flashcards/${documentId}/generate`, {}),
};

export const quizzesApi = {
  getAll: () => api.get<Quiz[]>(`/quizzes`),
  getByDocument: (documentId: string) => api.get<Quiz>(`/quizzes/${documentId}`),
  generate: (documentId: string, questionTypes?: string[]) => api.post<Quiz>(`/quizzes/${documentId}/generate`, { questionTypes }),
  submitAttempt: (id: string, score: number, answers: object) =>
    api.post<QuizAttempt>(`/quizzes/${id}/attempt`, { score, answers }),
};

const STATUS_POLL_INTERVAL_MS = 10_000;

// Watches a document until it reaches complete or failed, via SSE with a polling
// backstop. The stream can die without ever delivering an event — dropped
// connection, server restart — and on its own that leaves the caller waiting
// forever. Polling runs alongside it so the status always lands.
export function watchDocumentStatus(
  docId: string,
  onStatus: (status: 'complete' | 'failed', errorMessage?: string) => void,
): () => void {
  let cancelled = false;
  let settled = false;
  let reader: ReadableStreamDefaultReader<Uint8Array> | null = null;

  const settle = (status: 'complete' | 'failed', errorMessage?: string) => {
    if (settled || cancelled) return;
    settled = true;
    // Processing generates notes, flashcards and a quiz server-side, so this is
    // a content change no client-side mutation ever announces.
    if (status === 'complete') emitContentChanged();
    onStatus(status, errorMessage);
  };

  const authHeader = async (): Promise<Record<string, string> | null> => {
    const user = auth.currentUser;
    if (!user) return null;
    return { Authorization: `Bearer ${await user.getIdToken()}` };
  };

  const watchStream = async () => {
    try {
      const headers = await authHeader();
      if (!headers || cancelled) return;

      const response = await fetch(`${API_URL}/documents/${docId}/status-stream`, { headers });
      if (!response.ok || !response.body || cancelled) return;

      reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done || cancelled) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';
        for (const line of lines) {
          // ": ping" heartbeats keep the connection alive and carry no data
          if (!line.startsWith('data: ')) continue;
          try {
            const data = JSON.parse(line.slice(6)) as { status: string; errorMessage?: string };
            if (data.status === 'complete' || data.status === 'failed') {
              settle(data.status, data.errorMessage);
            }
          } catch {
            // malformed line — ignore
          }
        }
      }
    } catch {
      // connection dropped — polling below covers it
    }
  };

  // Bypasses the shared api client because its GET cache would replay the same
  // `processing` response for the life of the poll.
  const pollUntilSettled = async () => {
    while (!cancelled && !settled) {
      await new Promise((resolve) => setTimeout(resolve, STATUS_POLL_INTERVAL_MS));
      if (cancelled || settled) return;
      try {
        const headers = await authHeader();
        if (!headers) return;
        const res = await fetch(`${API_URL}/documents/${docId}`, { headers });
        if (!res.ok) continue;
        const doc = (await res.json()) as { status: string; errorMessage?: string };
        if (doc.status === 'complete' || doc.status === 'failed') {
          settle(doc.status, doc.errorMessage);
        }
      } catch {
        // transient failure — retry on the next tick
      }
    }
  };

  watchStream();
  pollUntilSettled();

  return () => {
    cancelled = true;
    reader?.cancel().catch(() => {});
  };
}

// Document Tags API (for managing the tags themselves)
export const docTagsApi = {
  getAll: () => api.get<{ id: string; name: string; color: string | null }[]>('/tags'),
  create: (data: { name: string; color?: string }) =>
    api.post<{ id: string; name: string; color: string | null }>('/tags', data),
  update: (id: string, data: { name?: string; color?: string }) =>
    api.patch<{ id: string; name: string; color: string | null }>(`/tags/${id}`, data),
  delete: (id: string) => api.delete<void>(`/tags/${id}`),
};
