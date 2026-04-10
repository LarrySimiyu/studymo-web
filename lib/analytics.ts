/**
 * Analytics wrapper — single interface for Mixpanel + GA4.
 * All calls are no-ops if keys are not set (safe in dev without .env).
 */

import mixpanel from 'mixpanel-browser';

let mixpanelReady = false;

export function initAnalytics() {
  const token = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN;
  if (!token) return;
  mixpanel.init(token, { persistence: 'localStorage', ignore_dnt: true });
  mixpanelReady = true;
}

// ─── Identity ────────────────────────────────────────────────────────────────

export function identifyUser(userId: string, traits?: Record<string, unknown>) {
  if (mixpanelReady) {
    mixpanel.identify(userId);
    if (traits) mixpanel.people.set(traits);
  }
}

export function aliasUser(userId: string) {
  if (mixpanelReady) mixpanel.alias(userId);
}

export function resetAnalytics() {
  if (mixpanelReady) mixpanel.reset();
}

// ─── Page views ───────────────────────────────────────────────────────────────

export function trackPage(path: string) {
  track('page_viewed', { path });

  // GA4
  if (typeof window !== 'undefined' && 'gtag' in window) {
    (window as unknown as { gtag: (...args: unknown[]) => void }).gtag(
      'event',
      'page_view',
      { page_path: path }
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
  signupStarted: (method: 'google' | 'apple' | 'email') =>
    track('signup_started', { method }),

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
