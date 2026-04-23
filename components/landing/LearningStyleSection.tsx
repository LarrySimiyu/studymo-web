'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform, MotionValue } from 'framer-motion';
import {
  Brain, BookOpen, Zap, HelpCircle, Headphones, Target, BarChart2, FileText,
} from 'lucide-react';

const ICONS = [
  { Icon: Brain,     color: '#8B5CF6', bg: 'rgba(139,92,246,0.22)', label: 'Tutor',      top: '12%',  left: '18%',  dx: -60, dy: -40  },
  { Icon: BookOpen,  color: '#3B82F6', bg: 'rgba(59,130,246,0.22)',  label: 'Notes',      top: '55%',  left: '14%',  dx: -70, dy: 30   },
  { Icon: FileText,  color: '#FF6500', bg: 'rgba(255,101,0,0.22)',   label: 'Docs',       top: '78%',  left: '24%',  dx: -50, dy: 60   },
  { Icon: Zap,       color: '#F59E0B', bg: 'rgba(245,158,11,0.22)',  label: 'Flashcards', top: '20%',  left: '32%',  dx: -30, dy: -50  },
  { Icon: HelpCircle,color: '#22C55E', bg: 'rgba(34,197,94,0.22)',   label: 'Quizzes',    top: '10%',  right: '28%', dx: 30,  dy: -55  },
  { Icon: Headphones,color: '#EC4899', bg: 'rgba(236,72,153,0.22)',  label: 'Podcasts',   top: '22%',  right: '16%', dx: 65,  dy: -35  },
  { Icon: Target,    color: '#14B8A6', bg: 'rgba(20,184,166,0.22)',  label: 'Goals',      top: '62%',  right: '18%', dx: 70,  dy: 40   },
  { Icon: BarChart2, color: '#EF4444', bg: 'rgba(239,68,68,0.22)',   label: 'Analytics',  top: '80%',  right: '30%', dx: 45,  dy: 65   },
];

const MOBILE_ICONS = ICONS;

function FloatingIcon({
  Icon, color, bg, top, left, right, dx, dy, progress,
}: {
  Icon: React.ElementType;
  color: string; bg: string;
  top: string; left?: string; right?: string;
  dx: number; dy: number;
  progress: MotionValue<number>;
}) {
  const x = useTransform(progress, [0, 1], [0, dx]);
  const y = useTransform(progress, [0, 1], [0, dy]);
  const opacity = useTransform(progress, [0, 0.6, 1], [1, 0.6, 0]);

  return (
    <motion.div
      style={{ x, y, opacity, position: 'absolute', top, left, right,
        width: 68, height: 68, borderRadius: 18,
        backgroundColor: bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <Icon size={32} style={{ color }} />
    </motion.div>
  );
}

type Props = {
  label?: string;
  heading?: string;
  body?: string;
};

export default function LearningStyleSection({
  label = 'Built around you',
  heading = 'AI Is Better When It Understands Your Learning Style',
  body = 'Drop your files in. Get notes, flashcards, quizzes, practice exams, and a tutor that already knows your weak spots.',
}: Props = {}) {
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const progress = useTransform(scrollYProgress, [0.1, 0.7], [0, 1]);

  return (
    <section
      ref={ref}
      className="relative py-24 sm:py-32 overflow-hidden"
      style={{ backgroundColor: 'var(--bg-page)' }}
    >
      {/* ── Desktop: floating icons ── */}
      <div className="hidden md:block">
        {ICONS.map(({ Icon, color, bg, top, left, right, dx, dy }, i) => (
          <FloatingIcon
            key={i}
            Icon={Icon} color={color} bg={bg}
            top={top} left={left} right={right}
            dx={dx} dy={dy}
            progress={progress}
          />
        ))}
      </div>

      {/* ── Center text ── */}
      <div className="relative z-10 flex flex-col items-center text-center px-5 sm:px-8 max-w-2xl mx-auto">
        <p className="text-xs sm:text-sm font-bold uppercase tracking-widest mb-5" style={{ color: '#FF6500' }}>
          {label}
        </p>

        <h2 className="font-playfair text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight tracking-tight" style={{ color: 'var(--text-1)' }}>
          {heading}
        </h2>

        <p className="mt-5 text-base sm:text-lg leading-relaxed" style={{ color: 'var(--text-2)' }}>
          {body}
        </p>
      </div>

      {/* ── Mobile: horizontal icon marquee ── */}
      <div className="md:hidden mt-12 relative overflow-hidden">
        {/* Left fade */}
        <div
          className="absolute left-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to right, var(--bg-page), transparent)' }}
        />
        {/* Right fade */}
        <div
          className="absolute right-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to left, var(--bg-page), transparent)' }}
        />

        <div className="mobile-icon-track flex items-center gap-5 w-max px-8">
          {[...MOBILE_ICONS, ...MOBILE_ICONS].map(({ Icon, color, bg }, i) => (
            <div
              key={i}
              className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: bg }}
            >
              <Icon size={30} style={{ color }} />
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .mobile-icon-track {
          animation: iconMarquee 18s linear infinite;
        }
        @keyframes iconMarquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
}
