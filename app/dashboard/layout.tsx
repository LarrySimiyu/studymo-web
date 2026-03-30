'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Sidebar from '@/components/dashboard/Sidebar';
import { StudyTimerProvider } from '@/context/StudyTimerContext';
import StudyTimerPanel from '@/components/timer/StudyTimerPanel';
import { billingApi } from '@/lib/api/billing';
import { AssistantProvider, useAssistant } from '@/context/AssistantContext';
import AssistantPanel from '@/components/assistant/AssistantPanel';

function DashboardHeader() {
  const { openAssistant, isTutoringMode } = useAssistant();
  return (
    <div className="flex items-center justify-end px-6 py-3 shrink-0" style={{ borderBottom: '1px solid #1A1A1A' }}>
      <button
        onClick={openAssistant}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
        style={{ backgroundColor: '#1A1A1A', border: '1px solid #2A2A2A', color: '#9747FF' }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
        </svg>
        Ask AI
        {isTutoringMode && <span className="text-xs">🎓</span>}
      </button>
    </div>
  );
}

function DashboardInner({ children }: { children: React.ReactNode }) {
  const { currentUser, loading, subscriptionStatus, refreshSubscription } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [portalLoading, setPortalLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // After Stripe checkout, session_id lands in the URL. Refresh subscription
  // status before deciding whether to bounce the user back to /subscribe.
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
      router.replace('/onboarding');
      return;
    }
    if (subscriptionStatus && !subscriptionStatus.hasAccess) {
      router.replace('/subscribe');
    }
  }, [currentUser, loading, subscriptionStatus, refreshing, router]);

  // Cmd+K / Ctrl+K global shortcut
  const { toggleOpen } = useAssistant();
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        toggleOpen();
      }
    }
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [toggleOpen]);

  if (loading || refreshing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3" style={{ backgroundColor: '#111111' }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: '#9747FF' }} />
        {refreshing && <p className="text-sm text-gray-500">Activating your subscription…</p>}
      </div>
    );
  }

  if (!currentUser) return null;
  if (subscriptionStatus && !subscriptionStatus.hasAccess) return null;

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

  const isPastDue = subscriptionStatus?.status === 'past_due';

  return (
    <div className="flex h-screen" style={{ backgroundColor: '#111111' }}>
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {isPastDue && (
          <div className="flex items-center justify-between px-6 py-2.5 text-sm" style={{ backgroundColor: '#EF444415', borderBottom: '1px solid #EF444430' }}>
            <span style={{ color: '#EF4444' }}>
              Your payment failed. Please update your payment method to keep access.
            </span>
            <button
              onClick={handleUpdatePayment}
              disabled={portalLoading}
              className="ml-4 px-3 py-1 rounded-lg text-xs font-medium text-white shrink-0 disabled:opacity-50"
              style={{ backgroundColor: '#EF4444' }}
            >
              {portalLoading ? 'Loading…' : 'Update Payment'}
            </button>
          </div>
        )}
        <DashboardHeader />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <StudyTimerProvider>
      <AssistantProvider>
        <DashboardInner>{children}</DashboardInner>
        <StudyTimerPanel />
        <AssistantPanel />
      </AssistantProvider>
    </StudyTimerProvider>
  );
}
