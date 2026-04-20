function gtag(...args: unknown[]): void {
  if (typeof window !== 'undefined' && 'gtag' in window) {
    (window as unknown as { gtag: (...a: unknown[]) => void }).gtag(...args);
  }
}

export function gaSignUpCompleted(method: 'google' | 'apple'): void {
  gtag('event', 'sign_up', { method });
}

export function gaSignInCompleted(method: 'google' | 'apple'): void {
  gtag('event', 'login', { method });
}

export function gaPlanSelected(planId: string): void {
  gtag('event', 'begin_checkout', { plan_id: planId });
}

export function gaCtaClick(segment: string, position: 'hero' | 'mid' | 'bottom'): void {
  gtag('event', 'cta_click', { page_segment: segment, button_position: position });
}
