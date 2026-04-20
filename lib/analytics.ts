import mixpanel from 'mixpanel-browser';

let mixpanelReady = false;

export function initAnalytics() {
  const token = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN;
  if (!token) return;
  mixpanel.init(token, { persistence: 'localStorage' });
  mixpanelReady = true;
}

// ─── Identity ────────────────────────────────────────────────────────────────

export function identifyUser(userId: string, traits?: Record<string, unknown>, isNew = false) {
  if (!mixpanelReady) return;
  mixpanel.identify(userId);
  if (traits && Object.keys(traits).length) {
    const profile: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(traits)) {
      if (k === 'email') profile.$email = v;
      else if (k === 'name') profile.$name = v;
      else profile[k] = v;
    }
    mixpanel.people.set(profile);
  }
  if (isNew) mixpanel.people.set_once({ $created: new Date().toISOString() });
}

export function setSuperProperties(props: Record<string, unknown>) {
  if (mixpanelReady) mixpanel.register(props);
}

export function updateProfile(props: Record<string, unknown>) {
  if (mixpanelReady) mixpanel.people.set(props);
}

export function aliasUser(userId: string) {
  if (mixpanelReady) mixpanel.alias(userId);
}

export function resetAnalytics() {
  if (mixpanelReady) mixpanel.reset();
}

// ─── Page views ───────────────────────────────────────────────────────────────

function pageEventName(path: string): string {
  if (path === '/') return 'landing_viewed';
  if (path === '/dashboard') return 'dashboard_viewed';
  if (path === '/dashboard/library') return 'library_viewed';
  if (path.startsWith('/dashboard/library/')) return 'document_viewed';
  if (path === '/dashboard/flashcards') return 'flashcards_page_viewed';
  if (path === '/dashboard/quizzes') return 'quizzes_viewed';
  if (path === '/dashboard/practice-exams') return 'practice_exams_viewed';
  if (path.startsWith('/dashboard/practice-exams/')) return 'practice_exam_viewed';
  if (path === '/dashboard/study-plan') return 'study_plans_viewed';
  if (path.startsWith('/dashboard/study-plan/')) return 'study_plan_viewed';
  if (path === '/dashboard/tasks') return 'tasks_viewed';
  if (path === '/dashboard/tutor') return 'tutor_viewed';
  if (path === '/dashboard/analytics') return 'analytics_viewed';
  if (path === '/dashboard/podcasts') return 'podcasts_viewed';
  if (path === '/dashboard/weak-topics') return 'weak_topics_viewed';
  if (path === '/dashboard/settings/billing') return 'billing_viewed';
  if (path === '/dashboard/settings') return 'settings_viewed';
  if (path === '/onboarding') return 'onboarding_viewed';
  if (path === '/sign-up') return 'sign_up_viewed';
  if (path === '/pricing') return 'pricing_viewed';
  return 'page_viewed';
}

export function trackPage(path: string) {
  track(pageEventName(path), { path });

  const gaParams: Record<string, string> = { page_path: path };
  if (path.startsWith('/landing/')) {
    const segment = path.split('/')[2];
    if (segment) gaParams.page_segment = segment;
  }

  if (typeof window !== 'undefined' && 'gtag' in window) {
    (window as unknown as { gtag: (...args: unknown[]) => void }).gtag(
      'event',
      'page_view',
      gaParams
    );
  }
}

// ─── Event tracking ───────────────────────────────────────────────────────────

export function track(event: string, props?: Record<string, unknown>) {
  if (mixpanelReady) mixpanel.track(event, props);
}

// ─── Typed event helpers ─────────────────────────────────────────────────────

export const analytics = {
  // Auth
  signupCompleted: (method: 'google' | 'apple' | 'email') =>
    track('signup_completed', { method }),

  loginCompleted: (method: 'google' | 'apple' | 'email') =>
    track('login_completed', { method }),

  onboardingCompleted: () =>
    track('onboarding_completed'),

  // Uploads — type matches UploadType: 'blank' | 'file' | 'record' | 'video' | 'webpage'
  uploadStarted: (type: 'blank' | 'file' | 'record' | 'video' | 'webpage') =>
    track('upload_started', { type }),

  uploadCompleted: (type: 'blank' | 'file' | 'record' | 'video' | 'webpage') =>
    track('upload_completed', { type }),

  uploadFailed: (type: 'blank' | 'file' | 'record' | 'video' | 'webpage', reason?: string) =>
    track('upload_failed', { type, reason }),

  // Feature usage
  flashcardsGenerated: (documentId: string) =>
    track('flashcards_generated', { document_id: documentId }),

  flashcardsViewed: (documentId: string, cardCount: number) =>
    track('flashcards_viewed', { document_id: documentId, card_count: cardCount }),

  quizGenerated: (documentId: string) =>
    track('quiz_generated', { document_id: documentId }),

  quizCompleted: (documentId: string, score: number, questionCount: number) =>
    track('quiz_completed', { document_id: documentId, score, question_count: questionCount }),

  podcastGenerated: (documentId: string, lengthMins: number, voice: string) =>
    track('podcast_generated', { document_id: documentId, length_mins: lengthMins, voice }),

  podcastPlayed: (documentId: string) =>
    track('podcast_played', { document_id: documentId }),

  studyPlanCreated: (documentCount: number) =>
    track('study_plan_created', { document_count: documentCount }),

  tutorMessageSent: (hasDocumentContext: boolean) =>
    track('tutor_message_sent', { has_document_context: hasDocumentContext }),

  noteEdited: (documentId: string) =>
    track('note_edited', { document_id: documentId }),

  noteShared: (documentId: string) =>
    track('note_shared', { document_id: documentId }),

  // Conversion
  paywallSeen: (trigger: 'upload_limit' | 'first_visit' | 'feature_gate') =>
    track('paywall_seen', { trigger }),

  subscriptionStarted: (plan: string) =>
    track('subscription_started', { plan }),
};
