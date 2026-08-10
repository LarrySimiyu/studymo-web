'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { gaSignInCompleted } from '@/lib/analytics/ga';
import AuthShell from '@/components/auth/AuthShell';
import SocialAuthButtons from '@/components/auth/SocialAuthButtons';

export default function SignInPage() {
  const { googleSignIn, appleSignIn, currentUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && currentUser) router.replace('/dashboard');
  }, [currentUser, authLoading, router]);

  async function handleGoogle() {
    setError(null);
    setLoading(true);
    try {
      await googleSignIn();
      gaSignInCompleted('google');
      router.push('/dashboard');
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
      await appleSignIn();
      gaSignInCompleted('apple');
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Apple sign in failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Welcome back"
      footer={
        <>
          New here?{' '}
          <Link href="/sign-up" className="font-medium hover:underline" style={{ color: 'var(--brand)' }}>
            Sign up
          </Link>
        </>
      }
    >
      <SocialAuthButtons onGoogle={handleGoogle} onApple={handleApple} disabled={loading} error={error} />
    </AuthShell>
  );
}
