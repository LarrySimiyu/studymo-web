import { api } from '@/lib/api';

export interface Podcast {
  id: string;
  userId: string;
  documentId: string;
  document?: { id: string; title: string };
  title: string;
  lengthMins: number;
  voice: string;
  status: string; // 'generating' | 'complete' | 'failed'
  audioUrl: string | null;
  script: string | null;
  durationSecs: number | null;
  createdAt: string;
  updatedAt: string;
}

export const PODCAST_VOICES = [
  { id: 'alloy',   name: 'Alloy',   description: 'Neutral and balanced',      gender: 'Neutral' },
  { id: 'echo',    name: 'Echo',    description: 'Warm and conversational',    gender: 'Male'    },
  { id: 'fable',   name: 'Fable',   description: 'Expressive and dynamic',     gender: 'Male'    },
  { id: 'onyx',    name: 'Onyx',    description: 'Deep and authoritative',     gender: 'Male'    },
  { id: 'nova',    name: 'Nova',    description: 'Energetic and friendly',     gender: 'Female'  },
  { id: 'shimmer', name: 'Shimmer', description: 'Clear and professional',     gender: 'Female'  },
] as const;

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4001';

export const podcastsApi = {
  create: (data: { documentId: string; lengthMins: 5 | 10 | 15; voice: string }) =>
    api.post<Podcast>('/podcasts', data),
  getAll: () => api.get<Podcast[]>('/podcasts'),
  getByDocument: (documentId: string) => api.get<Podcast[]>(`/podcasts/document/${documentId}`),
  getById: (id: string) => api.get<Podcast>(`/podcasts/${id}`),
  delete: (id: string) => api.delete<{ success: boolean }>(`/podcasts/${id}`),
  // Voice preview returns audio directly — use fetch with auth token
  getVoicePreviewUrl: (voice: string) => `${API_URL}/podcasts/voice-preview/${voice}`,
};
