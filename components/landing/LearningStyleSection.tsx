'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  Brain, BookOpen, Zap, HelpCircle, Headphones, Target, BarChart2, FileText,
} from 'lucide-react';

// Each icon: position (% from center), direction it drifts on scroll
const ICONS = [
  { Icon: Brain,     color: '#8B5CF6', bg: 'rgba(139,92,246,0.15)', label: 'Tutor',      top: '12%',  left: '18%',  dx: -60, dy: -40  },
  { Icon: BookOpen,  color: '#3B82F6', bg: 'rgba(59,130,246,0.15)',  label: 'Notes',      top: '55%',  left: '14%',  dx: -70, dy: 30   },
  { Icon: FileText,  color: '#FF6500', bg: 'rgba(255,101,0,0.15)',   label: 'Docs',       top: '78%',  left: '24%',  dx: -50, dy: 60   },
  { Icon: Zap,       color: '#F59E0B', bg: 'rgba(245,158,11,0.15)',  label: 'Flashcards', top: '20%',  left: '32%',  dx: -30, dy: -50  },
  { Icon: HelpCircle,color: '#22C55E', bg: 'rgba(34,197,94,0.15)',   label: 'Quizzes',    top: '10%',  right: '28%', dx: 30,  dy: -55  },
  { Icon: Headphones,color: '#EC4899', bg: 'rgba(236,72,153,0.15)',  label: 'Podcasts',   top: '22%',  right: '16%', dx: 65,  dy: -35  },
  { Icon: Target,    color: '#14B8A6', bg: 'rgba(20,184,166,0.15)',  label: 'Goals',      top: '62%',  right: '18%', dx: 70,  dy: 40   },
  { Icon: BarChart2, color: '#EF4444', bg: 'rgba(239,68,68,0.15)',   label: 'Analytics',  top: '80%',  right: '30%', dx: 45,  dy: 65   },
];

const MOBILE_ICONS = ICONS; // reuse same set

function FloatingIcon({
  Icon, color, bg, top, left, right, dx, dy, progress,
}: {
  Icon: React.ElementType;
  color: string; bg: string;
  top: string; left?: string; right?: string;
  dx: number; dy: number;
  progress: ReturnType<typeof useTransform>;
}) {
  const x = useTransform(progress, [0, 1], [0, dx]);
  const y = useTransform(progress, [0, 1], [0, dy]);
  const opacity = useTransform(progress, [0, 0.6, 1], [1, 0.6, 0]);

  return (
    <motion.div
      style={{ x, y, opacity, position: 'absolute', top, left, right,
        width: 56, height: 56, borderRadius: 16,
        backgroundColor: bg, border: '1px solid rgba(255,255,255,0.08)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <Icon size={26} style={{ color }} />
    </motion.div>
  );
}

export default function LearningStyleSection() {
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
      style={{ backgroundColor: '#0A0A0A' }}
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
        <p className="text-xs font-semibold uppercase tracking-widest mb-5" style={{ color: 'rgba(255,255,255,0.3)' }}>
          Built around you
        </p>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight tracking-tight">
          AI Is Better When It Understands Your Learning Style
        </h2>

        <p className="mt-5 text-base sm:text-lg leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
          Your StudyMo tutor remembers your grade level, goals, struggles, and the exact topics you keep getting wrong, so every session feels like it was made for you.
        </p>
      </div>

      {/* ── Mobile: horizontal icon marquee ── */}
      <div className="md:hidden mt-12 relative overflow-hidden">
        {/* Left fade */}
        <div
          className="absolute left-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to right, #0A0A0A, transparent)' }}
        />
        {/* Right fade */}
        <div
          className="absolute right-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to left, #0A0A0A, transparent)' }}
        />

        <div className="mobile-icon-track flex items-center gap-5 w-max px-8">
          {[...MOBILE_ICONS, ...MOBILE_ICONS].map(({ Icon, color, bg }, i) => (
            <div
              key={i}
              className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: bg, border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <Icon size={26} style={{ color }} />
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
