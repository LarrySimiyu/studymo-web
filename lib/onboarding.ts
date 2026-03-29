const ONBOARDING_KEY = 'studymo_onboarding';

export interface OnboardingData {
  gradeLevel: string | null;
  subjects: string[];
  learningStyle: string | null;
  struggles: string[];
  mainGoal: string | null;
  upcomingTest: { subject: string; date: string } | null;
  gpa: number;
  goalGpa: number;
  hoursPerWeek: number;
  completedSteps: number[];
}

export const defaultOnboardingData: OnboardingData = {
  gradeLevel: null,
  subjects: [],
  learningStyle: null,
  struggles: [],
  mainGoal: null,
  upcomingTest: null,
  gpa: 3.2,
  goalGpa: 3.2,
  hoursPerWeek: 10,
  completedSteps: [],
};

export const saveOnboardingData = (data: Partial<OnboardingData>): void => {
  const existing = getOnboardingData();
  if (typeof window !== 'undefined') {
    localStorage.setItem(ONBOARDING_KEY, JSON.stringify({ ...existing, ...data }));
  }
};

export const getOnboardingData = (): OnboardingData => {
  if (typeof window === 'undefined') return defaultOnboardingData;
  const stored = localStorage.getItem(ONBOARDING_KEY);
  if (!stored) return { ...defaultOnboardingData };
  try {
    return { ...defaultOnboardingData, ...JSON.parse(stored) };
  } catch {
    return { ...defaultOnboardingData };
  }
};

export const clearOnboardingData = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(ONBOARDING_KEY);
  }
};
