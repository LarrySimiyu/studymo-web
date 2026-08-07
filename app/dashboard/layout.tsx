'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Sidebar from '@/components/dashboard/Sidebar';
import TopNav from '@/components/dashboard/TopNav';
// import { StudyTimerProvider } from '@/context/StudyTimerContext';
// import StudyTimerPanel from '@/components/timer/StudyTimerPanel';
import { billingApi } from '@/lib/api/billing';
import { LibraryProvider } from '@/context/LibraryContext';
import { TutorSessionsProvider } from '@/context/TutorSessionsContext';
import PaywallModal from '@/components/pricing/PaywallModal';
import PendingUploadHandler from '@/components/dashboard/PendingUploadHandler';
import { analytics } from '@/lib/analytics';
import { onShowPaywall } from '@/lib/paywall';
import { ThemeProvider } from '@/components/ui/ThemeProvider';
import { Button } from '@/components/ui/Button';
// import { AssistantProvider, useAssistant } from '@/context/AssistantContext';
// import AssistantPanel from '@/components/assistant/AssistantPanel';

// function DashboardHeader() {
//   const { openAssistant, isTutoringMode } = useAssistant();
//   return (
//     <div className="flex items-center justify-end px-6 py-3 shrink-0" style={{ borderBottom: '1px solid #1A1A1A' }}>
//       <button
//         onClick={openAssistant}
//         className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
//         style={{ backgroundColor: '#1A1A1A', border: '1px solid #2A2A2A', color: 'var(--brand)' }}
//       >
//         <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//           <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
//         </svg>
//         Ask AI
//         {isTutoringMode && <span className="text-xs">🎓</span>}
//       </button>
//     </div>
//   );
// }

function PastDueBanner() {
  const { subscriptionStatus } = useAuth();
  const [portalLoading, setPortalLoading] = useState(false);

  if (subscriptionStatus?.status !== 'past_due') return null;

  async function handleUpdatePayment() {
    setPortalLoading(true);
    try {
      const { data } = await billingApi.createPortal();
      if (data?.url) window.location.href = data.url;
    } catch {
      // ignore
    } finally {
      setPortalLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-between px-6 py-2.5 text-body shrink-0" style={{ backgroundColor: 'var(--danger-subtle)', borderBottom: '1px solid var(--danger-border)' }}>
      <span style={{ color: 'var(--danger-ink)' }}>
        Your payment failed. Please update your payment method to keep access.
      </span>
      <Button
        variant="danger"
        size="xs"
        onClick={handleUpdatePayment}
        disabled={portalLoading}
        className="ml-4 shrink-0"
      >
        {portalLoading ? 'Loading…' : 'Update Payment'}
      </Button>
    </div>
  );
}

function DashboardInner({ children }: { children: React.ReactNode }) {
  const { currentUser, loading, refreshSubscription } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [refreshing, setRefreshing] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);

  // Listen for paywall triggers — nav buttons, and any free-tier 403 raised by lib/api
  useEffect(() => onShowPaywall(trigger => {
    setShowPaywall(true);
    analytics.paywallSeen(trigger);
  }), []);

  // Nothing opens the paywall on arrival. It only appears once the user asks for it
  // (an upgrade button) or hits a free-tier 403 — never in front of a first session.

  // After Stripe checkout, session_id lands in the URL. Refresh subscription
  // status before deciding whether to bounce the user back to /pricing.
  useEffect(() => {
    if (loading || !currentUser) return;
    const sessionId = searchParams.get('session_id');
    if (!sessionId) return;

    setRefreshing(true);
    // Give the webhook a moment to process, then refresh up to 5 times.
    let attempts = 0;
    const poll = async () => {
      await refreshSubscription();
      attempts++;
      const { data } = await import('@/lib/api/billing').then(m => m.billingApi.getStatus());
      if (data?.hasAccess || attempts >= 5) {
        setRefreshing(false);
        // Clean session_id from URL
        router.replace('/dashboard');
      } else {
        setTimeout(poll, 1500);
      }
    };
    setTimeout(poll, 1000);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, currentUser]);

  useEffect(() => {
    if (loading || refreshing) return;
    if (!currentUser) {
      router.replace('/');
    }
  }, [currentUser, loading, refreshing, router]);

  // Cmd+K / Ctrl+K global shortcut — shelved with assistant panel
  // const { toggleOpen } = useAssistant();
  // useEffect(() => {
  //   function handler(e: KeyboardEvent) {
  //     if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
  //       e.preventDefault();
  //       toggleOpen();
  //     }
  //   }
  //   window.addEventListener('keydown', handler);
  //   return () => window.removeEventListener('keydown', handler);
  // }, [toggleOpen]);

  if (loading || refreshing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3" style={{ backgroundColor: 'var(--bg-page)' }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: 'var(--brand)' }} />
        {refreshing && <p className="text-body-sm text-[var(--text-2)]">Activating your subscription…</p>}
      </div>
    );
  }

  if (!currentUser) return null;

  return (
    <TutorSessionsProvider>
      <div className="flex w-full h-screen overflow-hidden" style={{ backgroundColor: 'var(--bg-page)' }}>
        <Sidebar />
        <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
          <TopNav />
          <PastDueBanner />
          <main className="flex-1 overflow-auto scrollbar-hide [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
            <LibraryProvider>{children}</LibraryProvider>
          </main>
        </div>

        <PaywallModal open={showPaywall} onClose={() => setShowPaywall(false)} />

        <PendingUploadHandler />
      </div>
    </TutorSessionsProvider>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <Suspense>
        {/* <StudyTimerProvider> */}
        <DashboardInner>{children}</DashboardInner>
        {/* <StudyTimerPanel /> */}
        {/* </StudyTimerProvider> */}
      </Suspense>
    </ThemeProvider>
  );
}
