export const SHOW_PAYWALL_EVENT = 'app:show-paywall';

/** Raises the paywall from anywhere — upgrade buttons, a free-tier 403, or the
 *  tutor running out of messages. The dashboard layout owns the modal. */
export function showPaywall(trigger?: string): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(SHOW_PAYWALL_EVENT, { detail: { trigger } }));
}

export function onShowPaywall(handler: (trigger: string) => void): () => void {
  const listener = (e: Event) => {
    handler((e as CustomEvent).detail?.trigger ?? 'feature_gate');
  };
  window.addEventListener(SHOW_PAYWALL_EVENT, listener);
  return () => window.removeEventListener(SHOW_PAYWALL_EVENT, listener);
}
