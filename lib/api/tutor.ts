import { api } from '@/lib/api';

export interface TutorSessionSummary {
  id: string;
  title: string;
  mode: 'helper' | 'tutor' | 'eli5' | 'casual' | 'strict' | 'teach_back';
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
  weakTopicCount: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export const tutorApi = {
  createSession: (data: { noteIds?: string[]; mode: 'helper' | 'tutor' | 'eli5' | 'casual' | 'strict' | 'teach_back' }) =>
    api.post<TutorSession>('/tutor', data),
  getSessions: () => api.get<TutorSessionSummary[]>('/tutor'),
  getSession: (id: string) => api.get<TutorSession>(`/tutor/${id}`),
  updateNotes: (id: string, noteIds: string[]) =>
    api.patch<TutorSession>(`/tutor/${id}/notes`, { noteIds }),
  updateMode: (id: string, mode: 'helper' | 'tutor' | 'eli5' | 'casual' | 'strict' | 'teach_back') =>
    api.patch<TutorSession>(`/tutor/${id}/mode`, { mode }),
  updateTitle: (id: string, title: string) =>
    api.patch<TutorSession>(`/tutor/${id}/title`, { title }),
  deleteSession: (id: string) => api.delete<{ success: boolean }>(`/tutor/${id}`),
  getSuggestions: (id: string) => api.get<{ suggestions: string[] }>(`/tutor/${id}/suggestions`),
};

/**
 * Delete that outlives the page. `keepalive` lets the browser finish the request
 * after unload, which the cached api client can't do — it awaits a fresh token.
 */
export function deleteSessionOnUnload(sessionId: string, token: string): void {
  fetch(`${API_URL}/tutor/${sessionId}`, {
    method: 'DELETE',
    keepalive: true,
    headers: { Authorization: `Bearer ${token}` },
  }).catch(() => {});
}

export interface NoteOffer {
  noteId: string;
  noteTitle: string;
  heading: string;
  content: string;
}

export async function streamTutorChat(
  sessionId: string,
  message: string,
  onDelta: (text: string) => void,
  onDone: () => void,
  token: string,
  onOffer?: (offer: NoteOffer) => void,
  onResolved?: (resolved: { id: string; topic: string }) => void
): Promise<void> {
  const response = await fetch(`${API_URL}/tutor/${sessionId}/chat`, {
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
      let parsed: Record<string, unknown>;
      try { parsed = JSON.parse(line.slice(6)); } catch { continue; }
      if (parsed.error) throw new Error(parsed.error as string);
      if (parsed.delta) onDelta(parsed.delta as string);
      if (parsed.offer && onOffer) onOffer(parsed.offer as NoteOffer);
      if (parsed.resolved && onResolved) onResolved(parsed.resolved as { id: string; topic: string });
      if (parsed.done) onDone();
    }
  }
}
