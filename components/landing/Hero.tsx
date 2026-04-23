'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import chatScreenshot from '@/assets/dashboard-screenshot.png';

const CYCLING_WORDS = [
  'chem',
  'math',
  'history',
  'bio',
  'law',
  'econ',
  'life',
];
const TYPE_SPEED = 28;
const DELETE_SPEED = 16;
const HOLD_MS = 900;

function useTypewriter(words: string[]) {
  const [displayed, setDisplayed] = useState('');
  const [wordIndex, setWordIndex] = useState(0);
  const [phase, setPhase] = useState<'typing' | 'holding' | 'deleting' | 'done'>('typing');

  const isLast = wordIndex === words.length - 1;

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
      } else if (isLast) {
        setPhase('done');
      } else {
        setWordIndex(i => i + 1);
        setPhase('typing');
      }
    }
  }, [displayed, phase, wordIndex, words, isLast]);

  return { text: displayed, done: phase === 'done' };
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0 },
};

export default function Hero() {
  const { text: typed, done } = useTypewriter(CYCLING_WORDS);

  return (
    <section
      className="relative flex flex-col items-center min-h-[50vh] sm:min-h-screen"
      style={{ backgroundColor: 'var(--bg-page)' }}
    >
      {/* Radial glow behind heading */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1400px] h-[900px] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, rgba(255,101,0,0.14) 0%, transparent 65%)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-2 sm:px-8 pt-28 sm:pt-40 pb-24 w-full max-w-7xl mx-auto">

        {/* Heading */}
        <motion.h1
          variants={fadeUp} initial="hidden" animate="show"
          transition={{ duration: 0.55, delay: 0.2 }}
          className="font-playfair text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.08]"
          style={{ color: 'var(--text-1)' }}
        >
          Your{done ? ' ' : ' '}
          <span className="relative inline-block" style={{ color: '#FF6500' }}>
            {typed}
            {!done && (
              <span
                className="inline-block w-[2px] h-[0.85em] align-middle ml-0.5 animate-pulse"
                style={{ backgroundColor: '#FF6500', verticalAlign: 'middle' }}
              />
            )}
          </span>
          {typed ? ' ' : ''}Notes<br />
          <span className="italic" style={{ color: '#FF6500' }}>Supercharged</span>
        </motion.h1>

        {/* Subtext */}
        <motion.p
          variants={fadeUp} initial="hidden" animate="show"
          transition={{ duration: 0.55, delay: 0.35 }}
          className="mt-6 text-base sm:text-lg md:text-xl leading-relaxed max-w-lg sm:max-w-xl md:max-w-2xl mx-auto font-bold"
          style={{ color: 'var(--text-2)' }}
        >
          Get notes, flashcards, quizzes, and an AI Tutor that understands your learning style.
        </motion.p>

        {/* CTA */}
        <motion.div
          variants={fadeUp} initial="hidden" animate="show"
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-10 flex items-center gap-4 flex-wrap justify-center"
        >
          <Link
            href="/sign-up"
            className="px-12 py-3 rounded-full text-lg sm:text-base font-bold text-white transition-transform hover:scale-105 w-full sm:w-auto text-center"
            style={{ background: 'linear-gradient(135deg, #FF6500, #FF9A3C)' }}
          >
            Start Free
          </Link>
        </motion.div>

        {/* Mockup */}
        <motion.div
          variants={fadeUp} initial="hidden" animate="show"
          transition={{ duration: 0.7, delay: 0.65 }}
          className="relative w-full mt-20"
        >
          {/* Border beam wrapper */}
          <div className="border-beam-wrap rounded-2xl p-[1.5px]" style={{ boxShadow: '0 25px 60px rgba(255,101,0,0.25), 0 8px 24px rgba(255,101,0,0.15)' }}>
            <div className="rounded-[14px] overflow-hidden">
              <Image
                src={chatScreenshot}
                alt="Studymo app screenshot"
                className="w-full h-auto block"
              />
            </div>
          </div>
        </motion.div>

        <style dangerouslySetInnerHTML={{ __html: `
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
        ` }} />

      </div>
    </section>
  );
}
