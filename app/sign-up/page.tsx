'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getAdditionalUserInfo } from 'firebase/auth';
import { useAuth } from '@/hooks/useAuth';
import { billingApi } from '@/lib/api/billing';
import { gaSignUpCompleted } from '@/lib/analytics/ga';
import AuthShell from '@/components/auth/AuthShell';
import SocialAuthButtons from '@/components/auth/SocialAuthButtons';

export default function SignUpPage() {
  return <Suspense fallback={null}><SignUpContent /></Suspense>;
}

function SignUpContent() {
  const { googleSignIn, appleSignIn, currentUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const priceId = searchParams.get('priceId');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && currentUser) {
      if (priceId) {
        billingApi.createCheckout(priceId).then(({ data }) => {
          if (data?.url) window.location.href = data.url;
          else router.replace('/dashboard');
        });
      } else {
        router.replace('/dashboard');
      }
    }
  }, [currentUser, authLoading, router, priceId]);

  async function redirectAfterAuth(isNew: boolean, method: 'google' | 'apple') {
    if (isNew) {
      gaSignUpCompleted(method);
      router.push(priceId ? `/onboarding?priceId=${priceId}` : '/onboarding');
      return;
    }
    if (priceId) {
      const { data } = await billingApi.createCheckout(priceId);
      if (data?.url) {
        window.location.href = data.url;
      } else {
        router.push('/dashboard');
      }
    } else {
      router.push('/dashboard');
    }
  }

  async function handleGoogle() {
    setError(null);
    setLoading(true);
    try {
      const cred = await googleSignIn();
      const isNew = getAdditionalUserInfo(cred)?.isNewUser ?? false;
      await redirectAfterAuth(isNew, 'google');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google sign in failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleApple() {
    setError(null);
    setLoading(true);
    try {
      const cred = await appleSignIn();
      const isNew = getAdditionalUserInfo(cred)?.isNewUser ?? false;
      await redirectAfterAuth(isNew, 'apple');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Apple sign in failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Create your account"
      footer={
        <>
          Already have an account?{' '}
          <Link href="/sign-in" className="font-medium hover:underline" style={{ color: 'var(--brand)' }}>
            Sign in
          </Link>
        </>
      }
    >
      <SocialAuthButtons onGoogle={handleGoogle} onApple={handleApple} disabled={loading} error={error} />
    </AuthShell>
  );
}
