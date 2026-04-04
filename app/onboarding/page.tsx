'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  School, GraduationCap, BookOpen, Briefcase, Globe,
  Headphones, HelpCircle, Shuffle,
  Brain, Lightbulb, Smartphone, Clock, Moon, Zap, Heart, LayoutList, Flame,
  Target, TrendingUp, FolderOpen, Timer, Play, ArrowLeft, ArrowRight, CalendarDays,
  type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { saveOnboardingData, getOnboardingData, defaultOnboardingData } from '@/lib/onboarding';

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

const STRUGGLE_OPTIONS = [
  { id: 'understanding',   label: 'Understanding the material',               Icon: Brain,       color: '#8B5CF6', bg: 'rgba(139,92,246,0.12)'  },
  { id: 'remembering',     label: 'Remembering what I studied',               Icon: Lightbulb,   color: '#F59E0B', bg: 'rgba(245,158,11,0.12)'  },
  { id: 'distractions',    label: 'Staying focused / avoiding distractions',  Icon: Smartphone,  color: '#EF4444', bg: 'rgba(239,68,68,0.12)'   },
  { id: 'time_management', label: 'Time management',                          Icon: Clock,       color: '#3B82F6', bg: 'rgba(59,130,246,0.12)'  },
  { id: 'procrastination', label: 'Procrastination',                          Icon: Moon,        color: '#14B8A6', bg: 'rgba(20,184,166,0.12)'  },
  { id: 'adhd',            label: 'ADHD or focus challenges',                 Icon: Zap,         color: '#FF6500', bg: 'rgba(255,101,0,0.12)'   },
  { id: 'mental_health',   label: 'Mental health affecting my focus',         Icon: Heart,       color: '#EC4899', bg: 'rgba(236,72,153,0.12)'  },
  { id: 'organizing',      label: 'Staying organized',                        Icon: LayoutList,  color: '#22C55E', bg: 'rgba(34,197,94,0.12)'   },
  { id: 'all',             label: 'All of the above',                         Icon: Flame,       color: '#EF4444', bg: 'rgba(239,68,68,0.12)'   },
];

const FOCUS_STRUGGLES = new Set(['procrastination','adhd','distractions','time_management','mental_health','all']);

const GOALS = [
  { id: 'pass_exams',     label: 'Pass my upcoming exams',       Icon: Target,     color: '#FF6500', bg: 'rgba(255,101,0,0.12)'  },
  { id: 'improve_grades', label: 'Improve my grades',            Icon: TrendingUp, color: '#22C55E', bg: 'rgba(34,197,94,0.12)'  },
  { id: 'learn_faster',   label: 'Learn faster and retain more', Icon: Zap,        color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
  { id: 'stay_organized', label: 'Stay organized this semester', Icon: FolderOpen, color: '#3B82F6', bg: 'rgba(59,130,246,0.12)' },
];

const STATS = [
  { number: '40%', desc: 'less time studying for the same results',         Icon: Clock,        color: '#FF6500', bg: 'rgba(255,101,0,0.12)'  },
  { number: '3x',  desc: 'more practice exams completed before test day',   Icon: Target,       color: '#22C55E', bg: 'rgba(34,197,94,0.12)'  },
  { number: '2x',  desc: 'more consistent studying with time blocking',     Icon: CalendarDays, color: '#3B82F6', bg: 'rgba(59,130,246,0.12)' },
];

// ─── step numbering ──────────────────────────────────────────────────────────
// 1  Grade level
// 2  Current GPA       (high_school / undergrad only)
// 3  Goal GPA          (high_school / undergrad only)
// 4  Subjects
// 5  Learning style
// 6  Struggles
// 7  Time blocking     (conditional on focus struggles)
// 8  Main goal
// 9  Upcoming test     (skippable)
// 10 Demo video        (skippable)
// 11 Social proof

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
  const [step, setStep] = useState(1);
  const [dir, setDir] = useState(1);
  const [data, setData] = useState(defaultOnboardingData);

  useEffect(() => {
    setData(getOnboardingData());
  }, []);

  const [customSubject, setCustomSubject] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [testChoice, setTestChoice] = useState<'yes' | 'skip' | null>(null);
  const [statIndex, setStatIndex] = useState(0);
  const customInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (step !== 11) return;
    const t = setInterval(() => setStatIndex(i => (i + 1) % STATS.length), 3000);
    return () => clearInterval(t);
  }, [step]);

  const showGpaSteps = data.gradeLevel === 'high_school' || data.gradeLevel === 'undergrad';
  const hasFocusStruggles = data.struggles.some(s => FOCUS_STRUGGLES.has(s));
  const TOTAL_STEPS = showGpaSteps ? 11 : 9;
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
    // skip time blocking if no focus struggles
    if (prev === 7 && !hasFocusStruggles) prev = 6;
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
    let struggles: string[];
    if (id === 'all') {
      struggles = data.struggles.includes('all') ? [] : STRUGGLE_OPTIONS.map(s => s.id);
    } else {
      const without = data.struggles.filter(s => s !== 'all');
      struggles = without.includes(id) ? without.filter(x => x !== id) : [...without, id];
    }
    setData(d => ({ ...d, struggles }));
    saveOnboardingData({ struggles });
  }

  const skippable = [10]; // demo video

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
            <div className="flex flex-wrap gap-2 justify-center w-full max-w-md">
              {STRUGGLE_OPTIONS.map(o => (
                <Pill key={o.id} label={o.label} selected={data.struggles.includes(o.id)} onClick={() => toggleStruggle(o.id)} />
              ))}
            </div>
            <ContinueBtn
              disabled={data.struggles.length === 0}
              onClick={() => {
                saveOnboardingData({ struggles: data.struggles });
                const hasFocus = data.struggles.some(s => FOCUS_STRUGGLES.has(s));
                next(hasFocus ? 7 : 8);
              }}
            />
          </StepWrapper>
        );

      // ── Step 7: Time blocking callout (conditional) ───────────────────────
      case 7:
        return (
          <StepWrapper heading="We've got something for that">
            <div className="w-full max-w-sm rounded-2xl p-5 sm:p-6 flex flex-col gap-4" style={{ backgroundColor: '#1A1A1A', border: '1px solid #2A2A2A' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(139,92,246,0.12)' }}>
                  <Timer size={20} style={{ color: '#8B5CF6' }} />
                </div>
                <p className="font-semibold text-white">Time Block Mode</p>
              </div>
              <p className="text-sm text-white leading-relaxed">
                Break study sessions into focused blocks with a built-in countdown timer. Progress saves automatically when you're done.
              </p>
              <div className="flex items-center gap-2 px-3 py-2 rounded-full self-start" style={{ backgroundColor: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.25)' }}>
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs font-mono" style={{ color: '#A78BFA' }}>25:00</span>
                <span className="text-xs text-white">· Studying Biology</span>
              </div>
            </div>
            <ContinueBtn onClick={() => next(8)} />
          </StepWrapper>
        );

      // ── Step 8: Main goal ─────────────────────────────────────────────────
      case 8:
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

      // ── Step 9: Upcoming test ─────────────────────────────────────────────
      case 9:
        return (
          <StepWrapper heading="Do you have an upcoming test?" sub="We'll build you a personalized study plan around it">
            <div className="flex flex-col gap-3 w-full max-w-sm">
              <button
                onClick={() => setTestChoice(testChoice === 'yes' ? null : 'yes')}
                className="p-4 sm:p-5 rounded-2xl text-left transition-all"
                style={{
                  backgroundColor: testChoice === 'yes' ? 'rgba(255,101,0,0.06)' : '#1A1A1A',
                  border: `1.5px solid ${testChoice === 'yes' ? 'rgba(255,101,0,0.5)' : '#2A2A2A'}`,
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(34,197,94,0.12)' }}>
                    <Target size={20} style={{ color: '#22C55E' }} />
                  </div>
                  <span className="font-medium text-white text-sm">Yes, I have a test coming up</span>
                </div>
                {testChoice === 'yes' && (
                  <div className="mt-4 flex flex-col gap-3" onClick={e => e.stopPropagation()}>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Subject</label>
                      <select
                        value={data.upcomingTest?.subject ?? ''}
                        onChange={e => setData(d => ({ ...d, upcomingTest: { subject: e.target.value, date: d.upcomingTest?.date ?? '' } }))}
                        className="w-full px-3 py-2 rounded-lg text-sm text-white focus:outline-none"
                        style={{ backgroundColor: '#2A2A2A', border: '1px solid #333' }}
                      >
                        <option value="">Select a subject…</option>
                        {data.subjects.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Test Date</label>
                      <input
                        type="date"
                        value={data.upcomingTest?.date ?? ''}
                        min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                        onChange={e => setData(d => ({ ...d, upcomingTest: { subject: d.upcomingTest?.subject ?? '', date: e.target.value } }))}
                        className="w-full px-3 py-2 rounded-lg text-sm text-white focus:outline-none"
                        style={{ backgroundColor: '#2A2A2A', border: '1px solid #333' }}
                      />
                    </div>
                    <Button
                      variant="brand"
                      size="default"
                      className="w-full"
                      onClick={() => {
                        if (data.upcomingTest?.subject && data.upcomingTest?.date) {
                          saveOnboardingData({ upcomingTest: data.upcomingTest });
                          next(10);
                        }
                      }}
                      disabled={!data.upcomingTest?.subject || !data.upcomingTest?.date}
                    >
                      Got it
                    </Button>
                  </div>
                )}
              </button>

              <button
                onClick={() => { saveOnboardingData({ upcomingTest: null }); next(10); }}
                className="p-4 sm:p-5 rounded-2xl text-left transition-all"
                style={{ backgroundColor: '#1A1A1A', border: '1.5px solid #2A2A2A' }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(107,114,128,0.12)' }}>
                    <ArrowRight size={20} style={{ color: '#9CA3AF' }} />
                  </div>
                  <span className="font-medium text-white text-sm">Skip for now</span>
                </div>
              </button>
            </div>
          </StepWrapper>
        );

      // ── Step 10: Demo video (skippable) ───────────────────────────────────
      case 10:
        return (
          <StepWrapper heading="See Studymo in action" sub="Watch how students are transforming their study sessions">
            <div className="w-full max-w-sm flex flex-col gap-4">
              <div
                className="w-full rounded-2xl flex flex-col items-center justify-center gap-3 py-14"
                style={{ backgroundColor: '#1A1A1A', border: '1px solid #2A2A2A' }}
              >
                <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(255,101,0,0.12)' }}>
                  <Play size={28} style={{ color: '#FF6500' }} fill="#FF6500" />
                </div>
                <p className="text-xs text-gray-600 text-center">[ Demo video — add final video here ]</p>
              </div>
              <ContinueBtn onClick={() => next(11)} />
            </div>
          </StepWrapper>
        );

      // ── Step 11: Social proof ─────────────────────────────────────────────
      case 11:
        return (
          <StepWrapper heading="You're in good company" sub="Here's what students are saying about Studymo">
            <div className="w-full max-w-sm flex flex-col gap-6 items-center">
              <div className="relative w-full h-40 overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={statIndex}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4 }}
                    className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-2xl p-6"
                    style={{ backgroundColor: '#1A1A1A', border: '1px solid #2A2A2A' }}
                  >
                    {(() => { const StatIcon = STATS[statIndex].Icon; return (
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: STATS[statIndex].bg }}>
                      <StatIcon size={22} style={{ color: STATS[statIndex].color }} />
                    </div>
                    ); })()}
                    <span className="text-4xl font-extrabold" style={{ color: STATS[statIndex].color }}>
                      {STATS[statIndex].number}
                    </span>
                    <p className="text-sm text-gray-400 text-center">{STATS[statIndex].desc}</p>
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="flex gap-2">
                {STATS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setStatIndex(i)}
                    className="h-2 rounded-full transition-all"
                    style={{ backgroundColor: i === statIndex ? '#FF6500' : '#2A2A2A', width: i === statIndex ? 20 : 8 }}
                  />
                ))}
              </div>

              <p className="text-sm text-gray-500 text-center">Join thousands of students studying smarter</p>

              <Button variant="brand" size="lg" className="w-full" onClick={() => router.push('/dashboard')}>
                Start studying
              </Button>
            </div>
          </StepWrapper>
        );

      default:
        return null;
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#111111' }}>
      {/* Progress bar */}
      <div className="h-1 w-full" style={{ backgroundColor: '#1A1A1A' }}>
        <div className="h-1 transition-all duration-500" style={{ width: `${progress}%`, backgroundColor: '#FF6500' }} />
      </div>

      {/* Top bar */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-4">
        <button
          onClick={back}
          className="text-gray-500 hover:text-white transition-colors p-1 -ml-1"
        >
          <ArrowLeft size={20} />
        </button>

        <span className="text-xs text-gray-600">{step} of {TOTAL_STEPS}</span>

        {skippable.includes(step) ? (
          <button onClick={() => next(step + 1)} className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
            Skip
          </button>
        ) : (
          <div className="w-8" />
        )}
      </div>

      {/* Step content */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-8 lg:px-16 pb-10 overflow-hidden">
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={step}
            custom={dir}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={transition}
            className="w-full flex justify-center"
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
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
