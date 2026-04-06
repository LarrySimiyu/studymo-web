'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import googleIcon from '@/assets/google-icon.png';
import appleIcon from '@/assets/apple-icon.png';

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
        <Link href="/" className="text-3xl sm:text-4xl font-bold tracking-tight text-white select-none">
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
            className="w-full py-4 px-5 rounded-3xl font-semibold text-base transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
            style={{ backgroundColor: '#ffffff', color: '#111111' }}
          >
            <GoogleIcon />
            Continue with Google
          </button>

          {/* Apple */}
          <button
            onClick={handleApple}
            disabled={loading}
            className="w-full py-4 px-5 rounded-3xl font-semibold text-base transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
            style={{ backgroundColor: '#ffffff', color: '#111111' }}
          >
            <AppleIcon />
            Continue with Apple
          </button>
        </div>

        <p className="text-xs text-center px-4" style={{ color: 'rgba(255,255,255,0.35)' }}>
          By continuing, you accept StudyMo&apos;s{' '}
          <Link href="/terms" className="underline underline-offset-2 hover:text-white transition-colors">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="underline underline-offset-2 hover:text-white transition-colors">
            Privacy Policy
          </Link>
          .
        </p>

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
  return <Image src={googleIcon} alt="Google" width={20} height={20} className="shrink-0" />;
}

function AppleIcon() {
  return <Image src={appleIcon} alt="Apple" width={20} height={20} className="shrink-0" />;
}
