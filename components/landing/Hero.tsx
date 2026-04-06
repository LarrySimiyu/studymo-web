'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import chatScreenshot from '@/assets/chat-screenshot.png';

const CYCLING_WORDS = ['harder.', 'faster.', 'longer.', 'better.'];
const TYPE_SPEED = 60;    // ms per character
const DELETE_SPEED = 40;  // ms per character
const HOLD_MS = 1800;     // how long to hold the full word

function useTypewriter(words: string[]) {
  const [displayed, setDisplayed] = useState('');
  const [wordIndex, setWordIndex] = useState(0);
  const [phase, setPhase] = useState<'typing' | 'holding' | 'deleting'>('typing');

  useEffect(() => {
    const word = words[wordIndex];

    if (phase === 'typing') {
      if (displayed.length < word.length) {
        const t = setTimeout(() => setDisplayed(word.slice(0, displayed.length + 1)), TYPE_SPEED);
        return () => clearTimeout(t);
      } else {
        const t = setTimeout(() => setPhase('holding'), HOLD_MS);
        return () => clearTimeout(t);
      }
    }

    if (phase === 'holding') {
      const t = setTimeout(() => setPhase('deleting'), HOLD_MS);
      return () => clearTimeout(t);
    }

    if (phase === 'deleting') {
      if (displayed.length > 0) {
        const t = setTimeout(() => setDisplayed(d => d.slice(0, -1)), DELETE_SPEED);
        return () => clearTimeout(t);
      } else {
        setWordIndex(i => (i + 1) % words.length);
        setPhase('typing');
      }
    }
  }, [displayed, phase, wordIndex, words]);

  return displayed;
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0 },
};

export default function Hero() {
  const typed = useTypewriter(CYCLING_WORDS);

  return (
    <section
      className="relative flex flex-col items-center overflow-hidden"
      style={{ backgroundColor: '#0A0A0A', minHeight: '100vh' }}
    >
      {/* Radial glow behind heading */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1400px] h-[900px] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, rgba(255,101,0,0.22) 0%, transparent 65%)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-5 sm:px-8 pt-28 sm:pt-40 pb-0 max-w-6xl mx-auto w-full">

        {/* Badge */}
        <motion.div
          variants={fadeUp} initial="hidden" animate="show"
          transition={{ duration: 0.5, delay: 0.1 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8 text-xs font-medium tracking-wide"
          style={{ backgroundColor: 'rgba(255,101,0,0.1)', border: '1px solid rgba(255,101,0,0.25)', color: '#FF6500' }}
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="#FF6500" stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
          AI-powered studying, built for real students
          <svg width="11" height="11" viewBox="0 0 24 24" fill="#FF6500" stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
        </motion.div>

        {/* Heading */}
        <motion.h1
          variants={fadeUp} initial="hidden" animate="show"
          transition={{ duration: 0.55, delay: 0.2 }}
          className="text-6xl sm:text-7xl lg:text-8xl font-extrabold tracking-tight leading-[1.08] text-white"
        >
          Study smarter,
          <br />
          not{' '}
          <span className="relative inline-block" style={{ color: '#FF6500' }}>
            {typed}
            <span
              className="inline-block w-[2px] h-[0.85em] align-middle ml-0.5 animate-pulse"
              style={{ backgroundColor: '#FF6500', verticalAlign: 'middle' }}
            />
          </span>
        </motion.h1>

        {/* Subtext */}
        <motion.p
          variants={fadeUp} initial="hidden" animate="show"
          transition={{ duration: 0.55, delay: 0.35 }}
          className="mt-6 text-lg sm:text-xl leading-relaxed max-w-2xl mx-auto"
          style={{ color: '#ffffff' }}
        >
          Upload your notes, generate flashcards and quizzes, get an AI tutor, and finally understand what you&apos;re studying.
        </motion.p>

        {/* CTA */}
        <motion.div
          variants={fadeUp} initial="hidden" animate="show"
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-10 flex items-center gap-4 flex-wrap justify-center"
        >
          <Link
            href="/onboarding"
            className="px-12 py-4 rounded-full text-base font-bold text-white transition-transform hover:scale-105 w-full sm:w-auto text-center"
            style={{ background: 'linear-gradient(135deg, #FF6500, #FF9A3C)' }}
          >
            Start For Free
          </Link>
        </motion.div>

        {/* Mockup */}
        <motion.div
          variants={fadeUp} initial="hidden" animate="show"
          transition={{ duration: 0.7, delay: 0.65 }}
          className="relative w-full mt-20"
        >
          {/* Fade mask so image bleeds out naturally */}
          <div
            className="absolute bottom-0 left-0 right-0 h-56 z-10 pointer-events-none"
            style={{ background: 'linear-gradient(to bottom, transparent, #0A0A0A)' }}
          />

          {/* Border beam wrapper — p-[1.5px] leaves the gradient visible as a border */}
          <div className="border-beam-wrap rounded-2xl p-[1.5px] shadow-2xl">
            <div className="rounded-[14px] overflow-hidden">
              <Image
                src={chatScreenshot}
                alt="Studymo app screenshot"
                className="w-full h-auto block"
              />
            </div>
          </div>
        </motion.div>

        <style>{`
          @property --beam-angle {
            syntax: '<angle>';
            initial-value: 0deg;
            inherits: false;
          }
          @keyframes beam-spin {
            to { --beam-angle: 360deg; }
          }
          .border-beam-wrap {
            background: conic-gradient(
              from var(--beam-angle),
              transparent 0%,
              transparent 72%,
              rgba(255, 101, 0, 0.04) 78%,
              rgba(255, 101, 0, 0.25) 86%,
              rgba(255, 101, 0, 0.75) 93%,
              #FF6500 98%,
              transparent 100%
            );
            animation: beam-spin 10s linear infinite;
          }
        `}</style>

      </div>
    </section>
  );
}
