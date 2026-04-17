'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { billingApi } from '@/lib/api/billing';
import { AnimatePresence, motion } from 'framer-motion';
import {
  School, GraduationCap, BookOpen, Briefcase, Globe,
  Headphones, HelpCircle, Shuffle,
  Brain, Lightbulb, Smartphone, Clock, Moon, Zap, Heart, Flame,
  Target, TrendingUp, TrendingDown, FolderOpen, ArrowLeft, ArrowRight,
  CalendarDays, Timer, Repeat, Scale, Users,
  type LucideIcon,
} from 'lucide-react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { Button } from '@/components/ui/Button';
import { saveOnboardingData, getOnboardingData, defaultOnboardingData } from '@/lib/onboarding';
import { analytics } from '@/lib/analytics';

// ─── constants ──────────────────────────────────────────────────────────────

const GRADE_OPTIONS = [
  { id: 'high_school',  label: 'High School',  Icon: School,         color: '#3B82F6', bg: 'rgba(59,130,246,0.12)'  },
  { id: 'undergrad',    label: 'Undergrad',    Icon: GraduationCap,  color: '#FF6500', bg: 'rgba(255,101,0,0.12)'   },
  { id: 'grad',         label: 'Grad School',  Icon: BookOpen,       color: '#8B5CF6', bg: 'rgba(139,92,246,0.12)'  },
  { id: 'self_learner', label: 'Self Learner', Icon: Briefcase,      color: '#22C55E', bg: 'rgba(34,197,94,0.12)'   },
  { id: 'other',        label: 'Other',        Icon: Globe,          color: '#F59E0B', bg: 'rgba(245,158,11,0.12)'  },
];

const PRESET_SUBJECTS = [
  'Mathematics','Biology','Chemistry','Physics','History',
  'English / Literature','Computer Science','Economics','Psychology',
  'Law','Medicine / Nursing','Engineering',
  'Coding','Personal Finance','Language Learning','Business',
  'Design','Marketing','Philosophy','Music Theory',
];

const LEARNING_STYLES = [
  { id: 'notes',     label: 'Reading notes and summaries', Icon: BookOpen,    color: '#3B82F6', bg: 'rgba(59,130,246,0.12)'  },
  { id: 'listening', label: 'Listening to explanations',   Icon: Headphones,  color: '#EC4899', bg: 'rgba(236,72,153,0.12)'  },
  { id: 'quizzing',  label: 'Being quizzed on material',   Icon: HelpCircle,  color: '#FF6500', bg: 'rgba(255,101,0,0.12)'   },
  { id: 'mix',       label: 'A mix of everything',         Icon: Shuffle,     color: '#8B5CF6', bg: 'rgba(139,92,246,0.12)'  },
];

const STRUGGLE_GROUPS: { category: string; items: { id: string; label: string; Icon: LucideIcon; color: string; bg: string }[] }[] = [
  {
    category: 'Keeping Up',
    items: [
      { id: 'falling_behind',  label: 'Falling behind on coursework',          Icon: TrendingDown, color: '#FF6500', bg: 'rgba(255,101,0,0.12)'   },
      { id: 'deadlines',       label: 'Managing multiple deadlines at once',    Icon: CalendarDays, color: '#3B82F6', bg: 'rgba(59,130,246,0.12)'  },
      { id: 'balance',         label: 'Balancing school with work or life',     Icon: Scale,        color: '#F59E0B', bg: 'rgba(245,158,11,0.12)'  },
    ],
  },
  {
    category: 'Studying',
    items: [
      { id: 'where_to_start',  label: 'Not knowing where to start',            Icon: HelpCircle,   color: '#8B5CF6', bg: 'rgba(139,92,246,0.12)' },
      { id: 'cramming',        label: 'Cramming the night before',              Icon: Timer,        color: '#14B8A6', bg: 'rgba(20,184,166,0.12)' },
      { id: 'consistency',     label: 'Staying consistent with studying',       Icon: Repeat,       color: '#EC4899', bg: 'rgba(236,72,153,0.12)' },
      { id: 'forgetting',      label: 'Forgetting what I studied',             Icon: Brain,        color: '#EF4444', bg: 'rgba(239,68,68,0.12)'  },
    ],
  },
  {
    category: 'Focus',
    items: [
      { id: 'distractions',    label: 'Phone & social media distractions',     Icon: Smartphone,   color: '#EF4444', bg: 'rgba(239,68,68,0.12)'  },
      { id: 'focus_span',      label: 'Losing focus quickly',                  Icon: Zap,          color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
    ],
  },
  {
    category: 'Mindset & Wellbeing',
    items: [
      { id: 'procrastination', label: 'Procrastination',                       Icon: Clock,        color: '#14B8A6', bg: 'rgba(20,184,166,0.12)' },
      { id: 'burnout',         label: 'Burnout or low motivation',             Icon: Flame,        color: '#EF4444', bg: 'rgba(239,68,68,0.12)'  },
      { id: 'test_anxiety',    label: 'Test anxiety',                          Icon: Heart,        color: '#EC4899', bg: 'rgba(236,72,153,0.12)' },
      { id: 'overwhelmed',     label: 'Feeling overwhelmed',                   Icon: Lightbulb,    color: '#8B5CF6', bg: 'rgba(139,92,246,0.12)' },
      { id: 'sleep',           label: 'Poor sleep affecting my focus',         Icon: Moon,         color: '#3B82F6', bg: 'rgba(59,130,246,0.12)' },
      { id: 'accountability',  label: 'No one to study with or keep me accountable', Icon: Users,  color: '#22C55E', bg: 'rgba(34,197,94,0.12)'  },
    ],
  },
];


const GOALS = [
  { id: 'pass_exams',     label: 'Pass my upcoming exams',       Icon: Target,     color: '#FF6500', bg: 'rgba(255,101,0,0.12)'  },
  { id: 'improve_grades', label: 'Improve my grades',            Icon: TrendingUp, color: '#22C55E', bg: 'rgba(34,197,94,0.12)'  },
  { id: 'learn_faster',   label: 'Learn faster and retain more', Icon: Zap,        color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
  { id: 'stay_organized', label: 'Stay organized this semester', Icon: FolderOpen, color: '#3B82F6', bg: 'rgba(59,130,246,0.12)' },
];

// ─── step numbering ──────────────────────────────────────────────────────────
// 1  Grade level
// 2  Current GPA       (high_school / undergrad only)
// 3  Goal GPA          (high_school / undergrad only)
// 4  Subjects
// 5  Learning style
// 6  Struggles
// 7  Main goal
// 9  Social proof (Lottie)

// ─── animation variants ─────────────────────────────────────────────────────

const slideVariants = {
  enter:  (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit:   (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
};

const transition = { duration: 0.28, ease: 'easeInOut' as const };

// ─── helpers ────────────────────────────────────────────────────────────────

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function fmt1dp(v: number) {
  return v.toFixed(1);
}

// ─── sub-components ─────────────────────────────────────────────────────────

function IconBadge({ Icon, color, bg, size = 20 }: { Icon: LucideIcon; color: string; bg: string; size?: number }) {
  return (
    <div className="rounded-xl flex items-center justify-center shrink-0" style={{ width: size + 20, height: size + 20, backgroundColor: bg }}>
      <Icon size={size} style={{ color }} />
    </div>
  );
}

function OptionCard({
  Icon, color, bg, label, selected, onClick,
}: { Icon: LucideIcon; color: string; bg: string; label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 sm:flex-col sm:items-center sm:gap-3 p-4 sm:p-5 rounded-2xl transition-all text-left sm:text-center w-full"
      style={{
        backgroundColor: selected ? 'rgba(255,101,0,0.06)' : '#1A1A1A',
        border: `1.5px solid ${selected ? 'rgba(255,101,0,0.5)' : '#2A2A2A'}`,
      }}
    >
      <IconBadge Icon={Icon} color={color} bg={bg} size={22} />
      <span className="text-sm font-medium text-white leading-snug">{label}</span>
    </button>
  );
}

function RowCard({
  Icon, color, bg, label, selected, onClick,
}: { Icon: LucideIcon; color: string; bg: string; label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 p-4 rounded-2xl transition-all text-left w-full"
      style={{
        backgroundColor: selected ? 'rgba(255,101,0,0.06)' : '#1A1A1A',
        border: `1.5px solid ${selected ? 'rgba(255,101,0,0.5)' : '#2A2A2A'}`,
      }}
    >
      <IconBadge Icon={Icon} color={color} bg={bg} size={20} />
      <span className="text-sm font-medium text-white leading-snug flex-1 text-left">{label}</span>
    </button>
  );
}

function Pill({
  label, selected, onClick,
}: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all"
      style={{
        backgroundColor: selected ? 'rgba(255,101,0,0.1)' : '#1A1A1A',
        border: `1px solid ${selected ? 'rgba(255,101,0,0.5)' : '#2A2A2A'}`,
        color: selected ? '#FF6500' : '#9CA3AF',
      }}
    >
      {label}
    </button>
  );
}

function GpaSelector({
  label, value, onChange, valueColor = '#ffffff',
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  valueColor?: string;
}) {
  return (
    <div className="flex flex-col gap-2 items-center">
      <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</span>
      <div className="flex items-center gap-4">
        <button
          onClick={() => onChange(clamp(+(value - 0.1).toFixed(1), 0, 4))}
          disabled={value <= 0}
          className="w-9 h-9 rounded-full flex items-center justify-center text-lg font-bold transition-colors disabled:opacity-30"
          style={{ backgroundColor: '#1A1A1A', border: '1px solid #2A2A2A', color: '#ffffff' }}
        >−</button>

        <div className="w-16 text-center overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.span
              key={fmt1dp(value)}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.15 }}
              className="block text-4xl font-bold tabular-nums"
              style={{ color: valueColor }}
            >
              {fmt1dp(value)}
            </motion.span>
          </AnimatePresence>
        </div>

        <button
          onClick={() => onChange(clamp(+(value + 0.1).toFixed(1), 0, 4))}
          disabled={value >= 4}
          className="w-9 h-9 rounded-full flex items-center justify-center text-lg font-bold transition-colors disabled:opacity-30"
          style={{ backgroundColor: '#1A1A1A', border: '1px solid #2A2A2A', color: '#ffffff' }}
        >+</button>
      </div>
    </div>
  );
}

// ─── main component ──────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const priceId = searchParams.get('priceId');
  const [step, setStep] = useState(1);
  const [dir, setDir] = useState(1);
  const [data, setData] = useState(defaultOnboardingData);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    setData(getOnboardingData());
  }, []);

  const [customSubject, setCustomSubject] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const customInputRef = useRef<HTMLInputElement>(null);

  const showGpaSteps = data.gradeLevel === 'high_school' || data.gradeLevel === 'undergrad';
  const TOTAL_STEPS = showGpaSteps ? 9 : 7;
  const progress = (step / TOTAL_STEPS) * 100;

  function go(nextStep: number, direction = 1) {
    setDir(direction);
    setStep(nextStep);
  }

  function next(nextStep?: number) {
    go(nextStep ?? step + 1, 1);
  }

  function back() {
    if (step <= 1) { router.push('/'); return; }
    let prev = step - 1;
    // skip GPA steps if not applicable
    if ((prev === 3 || prev === 2) && !showGpaSteps) prev = 1;
    go(prev, -1);
  }

  function saveAndNext(updates: Partial<typeof data>, nextStep?: number) {
    const updated = { ...data, ...updates };
    setData(updated);
    saveOnboardingData(updates);
    next(nextStep);
  }

  function toggleSubject(s: string) {
    const subjects = data.subjects.includes(s)
      ? data.subjects.filter(x => x !== s)
      : [...data.subjects, s];
    setData(d => ({ ...d, subjects }));
    saveOnboardingData({ subjects });
  }

  function addCustomSubject() {
    const s = customSubject.trim();
    if (!s) return;
    const subjects = data.subjects.includes(s) ? data.subjects : [...data.subjects, s];
    setData(d => ({ ...d, subjects }));
    saveOnboardingData({ subjects });
    setCustomSubject('');
    setShowCustomInput(false);
  }

  function toggleStruggle(id: string) {
    const struggles = data.struggles.includes(id)
      ? data.struggles.filter(x => x !== id)
      : [...data.struggles, id];
    setData(d => ({ ...d, struggles }));
    saveOnboardingData({ struggles });
  }

  const skippable: number[] = [];

  function renderStep() {
    switch (step) {
      // ── Step 1: Grade level ──────────────────────────────────────────────
      case 1:
        return (
          <StepWrapper heading="What level are you studying at?" sub="We'll personalize your experience based on this">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-sm sm:max-w-md">
              {GRADE_OPTIONS.slice(0, 4).map(o => (
                <OptionCard
                  key={o.id} Icon={o.Icon} color={o.color} bg={o.bg} label={o.label}
                  selected={data.gradeLevel === o.id}
                  onClick={() => { setData(d => ({ ...d, gradeLevel: o.id })); saveOnboardingData({ gradeLevel: o.id }); }}
                />
              ))}
              <div className="sm:col-span-2 sm:flex sm:justify-center">
                <div className="sm:w-1/2">
                  <OptionCard
                    Icon={GRADE_OPTIONS[4].Icon} color={GRADE_OPTIONS[4].color} bg={GRADE_OPTIONS[4].bg}
                    label={GRADE_OPTIONS[4].label}
                    selected={data.gradeLevel === GRADE_OPTIONS[4].id}
                    onClick={() => { setData(d => ({ ...d, gradeLevel: GRADE_OPTIONS[4].id })); saveOnboardingData({ gradeLevel: GRADE_OPTIONS[4].id }); }}
                  />
                </div>
              </div>
            </div>
            <AnimatePresence>
              {data.gradeLevel && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="w-full sm:max-w-xs"
                >
                  <ContinueBtn onClick={() => next(showGpaSteps ? 2 : 4)} />
                </motion.div>
              )}
            </AnimatePresence>
          </StepWrapper>
        );

      // ── Step 2: Current GPA (high school / undergrad only) ───────────────
      case 2:
        return (
          <StepWrapper heading="What's your current GPA?" sub="This helps us set realistic goals with you">
            <div className="flex flex-col gap-8 items-center w-full max-w-xs">
              <GpaSelector
                label="Current GPA"
                value={data.gpa}
                onChange={gpa => setData(d => ({ ...d, gpa }))}
              />
            </div>
            <ContinueBtn onClick={() => { saveOnboardingData({ gpa: data.gpa }); next(3); }} />
          </StepWrapper>
        );

      // ── Step 3: Goal GPA (high school / undergrad only) ──────────────────
      case 3: {
        const goalColor = data.goalGpa > data.gpa ? '#22C55E' : '#ffffff';
        return (
          <StepWrapper heading="What GPA are you aiming for?" sub="We'll track your progress toward this goal">
            <div className="flex flex-col gap-8 items-center w-full max-w-xs">
              <GpaSelector
                label="Goal GPA"
                value={data.goalGpa}
                onChange={goalGpa => setData(d => ({ ...d, goalGpa }))}
                valueColor={goalColor}
              />
              {data.goalGpa > data.gpa && (
                <p className="text-xs font-medium" style={{ color: '#22C55E' }}>
                  +{fmt1dp(data.goalGpa - data.gpa)} GPA points — we'll get you there
                </p>
              )}
            </div>
            <ContinueBtn onClick={() => { saveOnboardingData({ goalGpa: data.goalGpa }); next(4); }} />
          </StepWrapper>
        );
      }

      // ── Step 4: Subjects ─────────────────────────────────────────────────
      case 4:
        return (
          <StepWrapper heading="What are you currently studying?" sub="Select all that apply — you can always add more later">
            <div className="flex flex-wrap gap-2 justify-center w-full max-w-lg">
              {PRESET_SUBJECTS.map(s => (
                <Pill key={s} label={s} selected={data.subjects.includes(s)} onClick={() => toggleSubject(s)} />
              ))}
              {data.subjects.filter(s => !PRESET_SUBJECTS.includes(s)).map(s => (
                <Pill key={s} label={s} selected onClick={() => toggleSubject(s)} />
              ))}
              {showCustomInput ? (
                <div className="flex items-center gap-1">
                  <input
                    ref={customInputRef}
                    autoFocus
                    type="text"
                    value={customSubject}
                    onChange={e => setCustomSubject(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') addCustomSubject(); if (e.key === 'Escape') setShowCustomInput(false); }}
                    placeholder="Subject name…"
                    className="px-3 py-1.5 rounded-full text-sm text-white focus:outline-none"
                    style={{ backgroundColor: '#1A1A1A', border: '1px solid rgba(255,101,0,0.5)', width: 160 }}
                  />
                  <button
                    onClick={addCustomSubject}
                    className="w-7 h-7 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: '#FF6500' }}
                  >
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="white">
                      <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => { setShowCustomInput(true); setTimeout(() => customInputRef.current?.focus(), 50); }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm transition-colors"
                  style={{ backgroundColor: '#1A1A1A', border: '1px dashed #2A2A2A', color: '#6B7280' }}
                >
                  + Add your own
                </button>
              )}
            </div>
            <ContinueBtn disabled={data.subjects.length === 0} onClick={() => saveAndNext({ subjects: data.subjects }, 5)} />
          </StepWrapper>
        );

      // ── Step 5: Learning style ────────────────────────────────────────────
      case 5:
        return (
          <StepWrapper heading="How do you learn best?" sub="We'll use this to tailor how we teach you">
            <div className="flex flex-col gap-3 w-full max-w-sm sm:max-w-md">
              {LEARNING_STYLES.map(o => (
                <RowCard
                  key={o.id} Icon={o.Icon} color={o.color} bg={o.bg} label={o.label}
                  selected={data.learningStyle === o.id}
                  onClick={() => { setData(d => ({ ...d, learningStyle: o.id })); saveOnboardingData({ learningStyle: o.id }); }}
                />
              ))}
            </div>
            <AnimatePresence>
              {data.learningStyle && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="w-full sm:max-w-xs"
                >
                  <ContinueBtn onClick={() => next(6)} />
                </motion.div>
              )}
            </AnimatePresence>
          </StepWrapper>
        );

      // ── Step 6: Struggles ─────────────────────────────────────────────────
      case 6:
        return (
          <StepWrapper heading="What gets in the way of your studying?" sub="Select everything that applies — no judgment here">
            <div className="w-full max-w-lg flex flex-col gap-5">
              {STRUGGLE_GROUPS.map(group => (
                <div key={group.category} className="flex flex-col gap-2">
                  <p className="text-xs uppercase tracking-widest font-semibold text-left px-1" style={{ color: '#4B5563' }}>
                    {group.category}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {group.items.map(o => {
                      const selected = data.struggles.includes(o.id);
                      return (
                        <button
                          key={o.id}
                          onClick={() => toggleStruggle(o.id)}
                          className="flex items-center gap-3 p-4 rounded-xl text-left transition-all min-h-[56px]"
                          style={{
                            backgroundColor: selected ? 'rgba(255,101,0,0.06)' : '#1A1A1A',
                            border: `1.5px solid ${selected ? 'rgba(255,101,0,0.5)' : '#2A2A2A'}`,
                          }}
                        >
                          <div
                            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                            style={{ backgroundColor: o.bg }}
                          >
                            <o.Icon size={17} style={{ color: o.color }} />
                          </div>
                          <span className="text-sm font-medium leading-snug" style={{ color: selected ? '#ffffff' : '#9CA3AF' }}>
                            {o.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            <ContinueBtn
              disabled={data.struggles.length === 0}
              onClick={() => {
                saveOnboardingData({ struggles: data.struggles });
                next(7);
              }}
            />
          </StepWrapper>
        );

      // ── Step 7: Main goal ─────────────────────────────────────────────────
      case 7:
        return (
          <StepWrapper heading="What's your main goal with Studymo?">
            <div className="flex flex-col gap-3 w-full max-w-sm sm:max-w-md">
              {GOALS.map(o => (
                <RowCard
                  key={o.id} Icon={o.Icon} color={o.color} bg={o.bg} label={o.label}
                  selected={data.mainGoal === o.id}
                  onClick={() => { setData(d => ({ ...d, mainGoal: o.id })); saveOnboardingData({ mainGoal: o.id }); }}
                />
              ))}
            </div>
            <AnimatePresence>
              {data.mainGoal && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="w-full sm:max-w-xs"
                >
                  <ContinueBtn onClick={() => next(9)} />
                </motion.div>
              )}
            </AnimatePresence>
          </StepWrapper>
        );

      // ── Step 9: Social proof with Lottie ─────────────────────────────────
      case 9:
        return (
          <div className="flex flex-col items-center gap-6 w-full max-w-sm text-center px-2">
            <div className="w-full max-w-[260px] sm:max-w-[320px] aspect-square">
              <DotLottieReact
                src="/improvement-animation.lottie"
                loop
                autoplay
                backgroundColor="transparent"
                style={{ width: '100%', height: '100%' }}
              />
            </div>
            <div className="flex flex-col gap-2">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold leading-tight" style={{ color: '#111111' }}>
                Students increase their average test grade by{' '}
                <span style={{ color: '#22C55E' }}>14%</span>{' '}
                using Studymo
              </h1>
              <p className="text-sm sm:text-base" style={{ color: '#6B7280' }}>
                Join thousands of students already studying smarter
              </p>
            </div>
            <Button
              variant="brand"
              size="lg"
              className="w-full sm:max-w-xs"
              disabled={checkoutLoading}
              onClick={async () => {
                analytics.onboardingCompleted();
                if (priceId) {
                  setCheckoutLoading(true);
                  const { data } = await billingApi.createCheckout(priceId);
                  if (data?.url) {
                    analytics.subscriptionStarted(priceId);
                    window.location.href = data.url;
                  } else {
                    setCheckoutLoading(false);
                    router.push('/dashboard');
                  }
                } else {
                  router.push('/dashboard');
                }
              }}
            >
              {checkoutLoading ? 'Loading…' : 'Get Started'}
            </Button>
          </div>
        );

      default:
        return null;
    }
  }

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300" style={{ backgroundColor: step === 9 ? '#ffffff' : '#111111' }}>
      {/* Progress bar */}
      <div className="h-1 w-full" style={{ backgroundColor: step === 9 ? '#E5E7EB' : '#1A1A1A' }}>
        <div className="h-1 transition-all duration-500" style={{ width: `${progress}%`, backgroundColor: '#FF6500' }} />
      </div>

      {/* Top bar */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-4">
        <button
          onClick={back}
          className="transition-colors p-1 -ml-1"
          style={{ color: step === 9 ? '#6B7280' : '#6B7280' }}
        >
          <ArrowLeft size={20} />
        </button>

        <span className="text-xs" style={{ color: step === 9 ? '#9CA3AF' : '#4B5563' }}>{step} of {TOTAL_STEPS}</span>

        {skippable.includes(step) ? (
          <button onClick={() => next(step + 1)} className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
            Skip
          </button>
        ) : (
          <div className="w-8" />
        )}
      </div>

      {/* Step content */}
      <div className="flex-1 overflow-x-hidden overflow-y-auto px-4 sm:px-8 lg:px-16">
        <div className="min-h-full flex items-center justify-center py-8">
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={step}
              custom={dir}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={transition}
              className="w-full flex justify-center pb-6"
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// ─── shared layout components ────────────────────────────────────────────────

function StepWrapper({ heading, sub, children }: { heading: string; sub?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-xl text-center">
      <div className="flex flex-col gap-2 px-2">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white leading-tight">{heading}</h1>
        {sub && <p className="text-sm sm:text-base text-gray-500">{sub}</p>}
      </div>
      {children}
    </div>
  );
}

function ContinueBtn({ onClick, disabled }: { onClick: () => void; disabled?: boolean }) {
  return (
    <Button variant="brand" size="lg" className="mt-2 w-full sm:max-w-xs" onClick={onClick} disabled={disabled}>
      Continue
    </Button>
  );
}
