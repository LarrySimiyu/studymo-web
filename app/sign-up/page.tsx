'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function SignUpPage() {
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
      router.push('/onboarding');
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
      router.push('/onboarding');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Apple sign in failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-5"
      style={{ backgroundColor: '#0A0A0A' }}
    >
      {/* Radial glow */}
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(255,101,0,0.12) 0%, transparent 70%)' }}
      />

      <div className="relative z-10 w-full max-w-sm flex flex-col items-center gap-8">
        {/* Wordmark */}
        <Link href="/" className="text-xl font-bold tracking-tight text-white select-none">
          StudyMo
        </Link>

        <div className="w-full flex flex-col gap-3 text-center">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Create your account
          </h1>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
            Start studying smarter — it&apos;s free
          </p>
        </div>

        {error && (
          <div className="w-full p-3 rounded-xl text-sm text-center" style={{ backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#EF4444' }}>
            {error}
          </div>
        )}

        <div className="w-full flex flex-col gap-3">
          {/* Google */}
          <button
            onClick={handleGoogle}
            disabled={loading}
            className="w-full py-4 px-5 rounded-2xl font-semibold text-base transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
            style={{ backgroundColor: '#ffffff', color: '#111111' }}
          >
            <GoogleIcon />
            Continue with Google
          </button>

          {/* Apple */}
          <button
            onClick={handleApple}
            disabled={loading}
            className="w-full py-4 px-5 rounded-2xl font-semibold text-base transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
            style={{ backgroundColor: '#1A1A1A', color: '#ffffff', border: '1px solid #2A2A2A' }}
          >
            <AppleIcon />
            Continue with Apple
          </button>
        </div>

        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>
          Already have an account?{' '}
          <Link
            href="/sign-in"
            className="font-medium transition-colors hover:text-white"
            style={{ color: 'rgba(255,255,255,0.6)' }}
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="18" height="22" viewBox="0 0 814 1000" fill="currentColor">
      <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-36.8-165.8-126.1c-75-114.6-125.7-303.3-125.7-482.5 0-184.7 90.5-306.2 197.8-306.2 72.4 0 125.4 44.8 168.2 44.8 40.8 0 106.2-47.4 188.3-47.4 33.3 0 126.5 4.5 191.4 127.1zm-202.6-234.6c31.6-37.9 54.3-89.1 54.3-140.3 0-7.1-.6-14.3-1.9-20.1-51.4 1.9-112.4 34.2-149.1 75.8-28.5 31.6-55.6 81.6-55.6 133.5 0 7.7 1.3 15.5 1.9 17.8 3.2.6 8.4 1.3 13.6 1.3 46.2 0 102.9-30.9 136.8-68z"/>
    </svg>
  );
}
