import { api } from '@/lib/api';

export interface TutorSessionSummary {
  id: string;
  title: string;
  mode: 'helper' | 'tutor';
  noteIds: string[];
  messageCount: number;
  lastMessage: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TutorNoteMeta {
  id: string;
  summary: string | null;
  document: { id: string; title: string };
}

export interface TutorMessage {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export interface TutorSession extends TutorSessionSummary {
  messages: TutorMessage[];
  notes: TutorNoteMeta[];
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export const tutorApi = {
  createSession: (data: { noteIds?: string[]; mode: 'helper' | 'tutor' }) =>
    api.post<TutorSession>('/tutor/sessions', data),
  getSessions: () => api.get<TutorSessionSummary[]>('/tutor/sessions'),
  getSession: (id: string) => api.get<TutorSession>(`/tutor/sessions/${id}`),
  updateNotes: (id: string, noteIds: string[]) =>
    api.patch<TutorSession>(`/tutor/sessions/${id}/notes`, { noteIds }),
  updateMode: (id: string, mode: 'helper' | 'tutor') =>
    api.patch<TutorSession>(`/tutor/sessions/${id}/mode`, { mode }),
  updateTitle: (id: string, title: string) =>
    api.patch<TutorSession>(`/tutor/sessions/${id}/title`, { title }),
  deleteSession: (id: string) => api.delete<{ success: boolean }>(`/tutor/sessions/${id}`),
};

export async function streamTutorChat(
  sessionId: string,
  message: string,
  onDelta: (text: string) => void,
  onDone: () => void,
  token: string
): Promise<void> {
  const response = await fetch(`${API_URL}/tutor/sessions/${sessionId}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ message }),
  });

  if (!response.ok || !response.body) throw new Error('Stream failed');

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';
    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      try {
        const data = JSON.parse(line.slice(6));
        if (data.delta) onDelta(data.delta);
        if (data.done) onDone();
      } catch {
        // ignore
      }
    }
  }
}
