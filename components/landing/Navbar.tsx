'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Navbar() {
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
        backgroundColor: scrolled ? 'rgba(10,10,10,0.85)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent',
      }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-8 h-14 sm:h-16 flex items-center justify-between">
        {/* Wordmark */}
        <Link href="/" className="text-base font-bold tracking-tight text-white select-none">
          StudyMo
        </Link>

        <div className="flex items-center gap-3">
          {/* Login */}
          <Link
            href="/sign-in"
            className="text-sm font-medium transition-colors"
            style={{ color: 'rgba(255,255,255,0.6)' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
          >
            Login
          </Link>
          {/* Animated gradient CTA */}
          <Link href="/sign-up" className="try-free-btn text-sm font-semibold text-white px-5 py-2 rounded-full">
            Try free
          </Link>
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
