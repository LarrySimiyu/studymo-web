'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Layers, ListChecks, Headphones, type LucideIcon } from 'lucide-react';
import AiPromptBox from '@/components/ui/AiPromptBox';

const SUGGESTIONS: { icon: LucideIcon; title: string; blurb: string; prompt: string }[] = [
  { icon: Layers, title: 'Make Flashcards', blurb: 'Turn any lecture or notes into a study-ready deck.', prompt: 'Make flashcards from my notes' },
  { icon: ListChecks, title: 'Create Practice Quiz', blurb: 'Test yourself with AI-generated questions.', prompt: 'Create a practice quiz from my material' },
  { icon: Headphones, title: 'Generate Podcast', blurb: 'Listen to your notes as a spoken lecture.', prompt: 'Generate a podcast from my notes' },
];

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
  const router = useRouter();

  const handlePrompt = (value: string) => {
    router.push(`/sign-up?prompt=${encodeURIComponent(value)}`);
  };

  return (
    <section
      className="relative flex flex-col items-center min-h-[50vh] sm:min-h-screen"
      style={{ backgroundColor: 'var(--bg-page)' }}
    >
      {/* Radial glow centered in hero */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] max-w-[1800px] h-[1100px] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, rgba(255,101,0,0.22) 0%, rgba(255,101,0,0.08) 38%, transparent 68%)',
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

        {/* AI chat field */}
        <motion.div
          variants={fadeUp} initial="hidden" animate="show"
          transition={{ duration: 0.7, delay: 0.65 }}
          className="relative w-full max-w-3xl mt-16 sm:mt-20"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-5 text-left">
            {SUGGESTIONS.map(({ icon: Icon, title, blurb, prompt }) => (
              <button
                key={title}
                type="button"
                onClick={() => handlePrompt(prompt)}
                className="group flex flex-col items-start text-left rounded-2xl p-4 sm:p-5 transition-colors hover:[background-color:var(--bg-hover)]"
                style={{ backgroundColor: 'var(--bg-card)' }}
              >
                <Icon size={22} className="mb-3 transition-colors [color:var(--text-3)] group-hover:[color:#FF6500]" />
                <p className="text-sm sm:text-base font-bold" style={{ color: 'var(--text-1)' }}>{title}</p>
                <p className="mt-1 text-xs sm:text-sm leading-snug" style={{ color: 'var(--text-3)' }}>{blurb}</p>
              </button>
            ))}
          </div>
          <AiPromptBox
            placeholder="Start your first session"
            modes={[]}
            onSubmit={handlePrompt}
            footer="Studymo turns your prompt into notes, flashcards, and quizzes."
          />
        </motion.div>

      </div>
    </section>
  );
}
