'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

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
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, rgba(255,101,0,0.18) 0%, transparent 70%)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-5 sm:px-8 pt-28 sm:pt-40 pb-0 max-w-4xl mx-auto w-full">

        {/* Badge */}
        <motion.div
          variants={fadeUp} initial="hidden" animate="show"
          transition={{ duration: 0.5, delay: 0.1 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8 text-xs font-medium tracking-wide"
          style={{ backgroundColor: 'rgba(255,101,0,0.1)', border: '1px solid rgba(255,101,0,0.25)', color: '#FF6500' }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#FF6500] animate-pulse" />
          AI-powered studying — built for real students
        </motion.div>

        {/* Heading */}
        <motion.h1
          variants={fadeUp} initial="hidden" animate="show"
          transition={{ duration: 0.55, delay: 0.2 }}
          className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.08] text-white"
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
          className="mt-6 text-base sm:text-lg leading-relaxed max-w-xl mx-auto"
          style={{ color: '#ffffff' }}
        >
          Upload your notes, generate flashcards and quizzes, get an AI tutor — and finally understand what you&apos;re studying.
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

        {/* Mockup — half visible on load */}
        <motion.div
          variants={fadeUp} initial="hidden" animate="show"
          transition={{ duration: 0.7, delay: 0.65 }}
          className="relative w-full mt-16 flex justify-center"
        >
          {/* Fade mask so image bleeds out naturally */}
          <div
            className="absolute bottom-0 left-0 right-0 h-40 z-10 pointer-events-none"
            style={{ background: 'linear-gradient(to bottom, transparent, #0A0A0A)' }}
          />
          <div
            className="w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl"
            style={{
              border: '1px solid rgba(255,255,255,0.08)',
              backgroundColor: 'rgba(255,255,255,0.04)',
              height: 480,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Placeholder — swap with <Image> when ready */}
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.15)' }}>[ App screenshot goes here ]</p>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
