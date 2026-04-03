import { api } from '@/lib/api';

export interface Tag {
  id: string;
  userId: string;
  name: string;
  color: string;
  createdAt: string;
}

export interface Task {
  id: string;
  userId: string;
  documentId: string | null;
  document: { id: string; title: string; type: string } | null;
  tags: { tagId: string; tag: Tag }[];
  title: string;
  description: string | null;
  completed: boolean;
  completedAt: string | null;
  estimatedMins: number;
  elapsedMins: number;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SessionTaskEntry {
  id: string;
  sessionId: string;
  taskId: string;
  task: Task;
  elapsedMins: number;
  completed: boolean;
  completedAt: string | null;
  order: number;
}

export interface StudySession {
  id: string;
  userId: string;
  mode: 'pomodoro' | 'timeblock';
  status: 'active' | 'completed' | 'abandoned';
  totalMins: number;
  breakMins: number;
  workMins: number;
  startedAt: string;
  endedAt: string | null;
  taskEntries: SessionTaskEntry[];
}

export const tasksApi = {
  getAll: (params?: { completed?: boolean; tagId?: string; documentId?: string }) => {
    const qs = params
      ? new URLSearchParams(
          Object.entries(params)
            .filter(([, v]) => v !== undefined)
            .map(([k, v]) => [k, String(v)])
        ).toString()
      : '';
    return api.get<Task[]>(`/tasks${qs ? `?${qs}` : ''}`);
  },
  create: (data: {
    title: string;
    description?: string;
    estimatedMins?: number;
    dueDate?: string;
    documentId?: string;
    tagId?: string;
  }) => api.post<Task>('/tasks', data),
  update: (id: string, data: Partial<Task & { tagId?: string | null; documentId?: string | null }>) =>
    api.patch<Task>(`/tasks/${id}`, data),
  addTag: (taskId: string, tagId: string) => api.post<Task>(`/tasks/${taskId}/tags`, { tagId }),
  removeTag: (taskId: string, tagId: string) => api.delete<Task>(`/tasks/${taskId}/tags/${tagId}`),
  delete: (id: string) => api.delete<void>(`/tasks/${id}`),
};

export const studySessionsApi = {
  start: (data: {
    mode: 'pomodoro' | 'timeblock';
    taskIds?: string[];
    workMins?: number;
    breakMins?: number;
  }) => api.post<StudySession>('/study-sessions', data),
  getActive: () => api.get<StudySession | null>('/study-sessions/active'),
  saveProgress: (
    id: string,
    data: {
      totalElapsedMins: number;
      taskEntries: { id: string; elapsedMins: number; completed: boolean }[];
    }
  ) => api.patch<StudySession>(`/study-sessions/${id}/progress`, data),
  end: (
    id: string,
    data: {
      totalElapsedMins: number;
      taskEntries: { id: string; elapsedMins: number; completed: boolean }[];
    }
  ) => api.post<StudySession>(`/study-sessions/${id}/end`, data),
  abandon: (id: string) => api.post<StudySession>(`/study-sessions/${id}/abandon`, {}),
  addTask: (id: string, title: string) =>
    api.post<SessionTaskEntry>(`/study-sessions/${id}/add-task`, { title }),
  getAll: () => api.get<StudySession[]>('/study-sessions'),
};
