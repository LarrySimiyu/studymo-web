'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import studymoLogo from '@/assets/studymo_logo.png';
import { useAuth } from '@/hooks/useAuth';

export default function Navbar() {
  const router = useRouter();
  const { currentUser, loading, signOut } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <motion.nav
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        backgroundColor: scrolled ? 'var(--bg-page)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? '0.5px solid var(--border)' : '0.5px solid transparent',
      }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-8 h-14 sm:h-16 flex items-center justify-between">
        {/* Wordmark */}
        <Link href="/" className="flex items-center select-none">
          <Image src={studymoLogo} alt="StudyMo" height={80} className="h-14 sm:h-20 w-auto" />
        </Link>

        {/* Center nav links */}
        <div className="hidden sm:flex items-center gap-6 absolute left-1/2 -translate-x-1/2">
          <Link
            href="/blog"
            className="text-sm font-medium transition-colors"
            style={{ color: 'var(--text-2)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-1)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-2)')}
          >
            Blog
          </Link>
          <Link
            href="/pricing"
            className="text-sm font-medium transition-colors"
            style={{ color: 'var(--text-2)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-1)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-2)')}
          >
            Pricing
          </Link>
        </div>

        {/* Right auth buttons — held blank until Firebase resolves, so a signed-in
            visitor never sees "Login" flash before it swaps. */}
        <div className="flex h-9 items-center gap-3">
          {loading ? null : currentUser ? (
            <>
              <button
                type="button"
                onClick={async () => {
                  await signOut();
                  router.push('/');
                }}
                className="text-sm font-medium text-[var(--text-2)] transition-colors hover:text-[var(--text-1)]"
              >
                Logout
              </button>
              <Link href="/dashboard" className="try-free-btn text-sm font-semibold text-white px-5 py-2 rounded-full">
                Dashboard
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="text-sm font-medium text-[var(--text-2)] transition-colors hover:text-[var(--text-1)]"
              >
                Login
              </Link>
              <Link href="/sign-up" className="try-free-btn text-sm font-semibold text-white px-5 py-2 rounded-full">
                Start Free
              </Link>
            </>
          )}
        </div>
      </div>

      <style>{`
        .try-free-btn {
          background: linear-gradient(90deg, #FF6500, #ec4899, #8B5CF6, #FF6500);
          background-size: 250% 100%;
          animation: gradientShift 4s linear infinite;
          transition: opacity 0.2s, transform 0.2s;
        }
        .try-free-btn:hover {
          opacity: 0.9;
          transform: scale(1.03);
        }
        @keyframes gradientShift {
          0%   { background-position: 0% 50%; }
          100% { background-position: 250% 50%; }
        }
      `}</style>
    </motion.nav>
  );
}
