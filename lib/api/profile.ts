import { api } from '@/lib/api';
import type { OnboardingData } from '@/lib/onboarding';

export interface UserProfile {
  id: string;
  userId: string;
  gradeLevel: string | null;
  learningStyle: string | null;
  mainGoal: string | null;
  struggles: string | null;
  hoursPerWeek: number | null;
  gpa: number | null;
  goalGpa: number | null;
  onboardingComplete: boolean;
  createdAt: string;
  updatedAt: string;
}

export const profileApi = {
  sync: (data: OnboardingData) => api.post<UserProfile>('/profile/sync', data),
  get: () => api.get<UserProfile | null>('/profile'),
  update: (data: Partial<OnboardingData>) => api.patch<UserProfile>('/profile', data),
};
