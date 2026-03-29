'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { saveOnboardingData, getOnboardingData } from '@/lib/onboarding';

// ─── constants ──────────────────────────────────────────────────────────────

const GRADE_OPTIONS = [
  { id: 'high_school', label: 'High School', icon: '🏫' },
  { id: 'undergrad',   label: 'Undergrad',   icon: '🎓' },
  { id: 'grad',        label: 'Grad School', icon: '📚' },
  { id: 'self_learner',label: 'Self Learner',icon: '💼' },
  { id: 'other',       label: 'Other',       icon: '🌍' },
];

const PRESET_SUBJECTS = [
  'Mathematics','Biology','Chemistry','Physics','History',
  'English / Literature','Computer Science','Economics','Psychology',
  'Law','Medicine / Nursing','Engineering',
  'Coding','Personal Finance','Language Learning','Business',
  'Design','Marketing','Philosophy','Music Theory',
];

const LEARNING_STYLES = [
  { id: 'notes',     label: 'Reading notes and summaries', icon: '📖' },
  { id: 'listening', label: 'Listening to explanations',   icon: '🎧' },
  { id: 'quizzing',  label: 'Being quizzed on material',   icon: '❓' },
  { id: 'mix',       label: 'A mix of everything',         icon: '🔀' },
];

const STRUGGLE_OPTIONS = [
  { id: 'understanding',    label: 'Understanding the material',          icon: '😵' },
  { id: 'remembering',      label: 'Remembering what I studied',          icon: '🧠' },
  { id: 'distractions',     label: 'Staying focused / avoiding distractions', icon: '📱' },
  { id: 'time_management',  label: 'Time management',                     icon: '⏰' },
  { id: 'procrastination',  label: 'Procrastination',                     icon: '😴' },
  { id: 'adhd',             label: 'ADHD or focus challenges',            icon: '⚡' },
  { id: 'mental_health',    label: 'Mental health affecting my focus',    icon: '💭' },
  { id: 'organizing',       label: 'Staying organized',                   icon: '📋' },
  { id: 'all',              label: 'All of the above',                    icon: '🔥' },
];

const FOCUS_STRUGGLES = new Set(['procrastination','adhd','distractions','time_management','mental_health','all']);

const GOALS = [
  { id: 'pass_exams',       label: 'Pass my upcoming exams',         icon: '🎯' },
  { id: 'improve_grades',   label: 'Improve my grades',              icon: '📈' },
  { id: 'learn_faster',     label: 'Learn faster and retain more',   icon: '⚡' },
  { id: 'stay_organized',   label: 'Stay organized this semester',   icon: '🗂️' },
];

const STATS = [
  { number: '40%',  desc: 'less time studying for the same results' },
  { number: '3x',   desc: 'more practice exams completed before test day' },
  { number: '2x',   desc: 'more consistent studying with time blocking' },
];

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

function OptionCard({
  icon, label, selected, onClick,
}: { icon: string; label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 p-5 rounded-2xl transition-all text-center"
      style={{
        backgroundColor: selected ? '#1A0A2E' : '#1A1A1A',
        border: `1.5px solid ${selected ? '#9747FF' : '#2A2A2A'}`,
      }}
    >
      <span className="text-3xl">{icon}</span>
      <span className="text-sm font-medium text-white leading-snug">{label}</span>
    </button>
  );
}

function Pill({
  icon, label, selected, onClick,
}: { icon?: string; label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all"
      style={{
        backgroundColor: selected ? '#9747FF20' : '#1A1A1A',
        border: `1px solid ${selected ? '#9747FF' : '#2A2A2A'}`,
        color: selected ? '#9747FF' : '#9CA3AF',
      }}
    >
      {icon && <span>{icon}</span>}
      {label}
    </button>
  );
}

function GpaSelector({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex flex-col gap-2 items-center">
      <span className="text-xs text-gray-500 font-medium">{label}</span>
      <div className="flex items-center gap-4">
        <button
          onClick={() => onChange(clamp(+(value - 0.1).toFixed(1), 0, 4))}
          disabled={value <= 0}
          className="w-9 h-9 rounded-full flex items-center justify-center text-lg font-bold transition-colors disabled:opacity-30"
          style={{ backgroundColor: '#1A1A1A', border: '1px solid #2A2A2A', color: '#9747FF' }}
        >−</button>
        <span className="text-3xl font-bold text-white w-14 text-center tabular-nums">{fmt1dp(value)}</span>
        <button
          onClick={() => onChange(clamp(+(value + 0.1).toFixed(1), 0, 4))}
          disabled={value >= 4}
          className="w-9 h-9 rounded-full flex items-center justify-center text-lg font-bold transition-colors disabled:opacity-30"
          style={{ backgroundColor: '#1A1A1A', border: '1px solid #2A2A2A', color: '#9747FF' }}
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
  const [data, setData] = useState(() => getOnboardingData());
  const [customSubject, setCustomSubject] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [testChoice, setTestChoice] = useState<'yes' | 'skip' | null>(null);
  const [statIndex, setStatIndex] = useState(0);
  const customInputRef = useRef<HTMLInputElement>(null);

  // Auto-rotate stats on step 10
  useEffect(() => {
    if (step !== 10) return;
    const t = setInterval(() => setStatIndex(i => (i + 1) % STATS.length), 3000);
    return () => clearInterval(t);
  }, [step]);

  // Determine which steps exist (step 6 is conditional)
  const hasFocusStruggles = data.struggles.some(s => FOCUS_STRUGGLES.has(s));
  const TOTAL_STEPS = 10;

  // Calculate step for display (step 6 may be skipped)
  const displayStep = step;
  const displayTotal = TOTAL_STEPS;

  const progress = (step / TOTAL_STEPS) * 100;

  function go(next: number, direction = 1) {
    setDir(direction);
    setStep(next);
  }

  function next(nextStep?: number) {
    const n = nextStep ?? step + 1;
    go(n, 1);
  }

  function back() {
    if (step <= 1) return;
    let prev = step - 1;
    // Skip step 6 going back if no focus struggles
    if (prev === 6 && !hasFocusStruggles) prev = 5;
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

  const skippable = [7, 9];

  function renderStep() {
    switch (step) {
      // ── Step 1: Grade level ──────────────────────────────────────────────
      case 1:
        return (
          <StepWrapper heading="What level are you studying at?" sub="We'll personalize your experience based on this">
            <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
              {GRADE_OPTIONS.slice(0, 4).map(o => (
                <OptionCard
                  key={o.id} icon={o.icon} label={o.label}
                  selected={data.gradeLevel === o.id}
                  onClick={() => saveAndNext({ gradeLevel: o.id }, 2)}
                />
              ))}
              <div className="col-span-2 flex justify-center">
                <div className="w-1/2">
                  <OptionCard
                    icon={GRADE_OPTIONS[4].icon} label={GRADE_OPTIONS[4].label}
                    selected={data.gradeLevel === GRADE_OPTIONS[4].id}
                    onClick={() => saveAndNext({ gradeLevel: GRADE_OPTIONS[4].id }, 2)}
                  />
                </div>
              </div>
            </div>
          </StepWrapper>
        );

      // ── Step 2: GPA ──────────────────────────────────────────────────────
      case 2:
        return (
          <StepWrapper heading="What's your current GPA?" sub="And what are you aiming for?">
            <div className="flex flex-col gap-8 items-center">
              <GpaSelector label="Current GPA" value={data.gpa} onChange={gpa => setData(d => ({ ...d, gpa }))} />
              <div className="h-px w-full max-w-[200px]" style={{ backgroundColor: '#2A2A2A' }} />
              <GpaSelector label="Goal GPA" value={data.goalGpa} onChange={goalGpa => setData(d => ({ ...d, goalGpa }))} />
            </div>
            <ContinueBtn onClick={() => saveAndNext({ gpa: data.gpa, goalGpa: data.goalGpa }, 3)} />
          </StepWrapper>
        );

      // ── Step 3: Subjects ─────────────────────────────────────────────────
      case 3:
        return (
          <StepWrapper heading="What are you currently studying?" sub="Select all that apply — you can always add more later">
            <div className="flex flex-wrap gap-2 justify-center max-w-lg">
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
                    style={{ backgroundColor: '#1A1A1A', border: '1px solid #9747FF', width: 160 }}
                  />
                  <button
                    onClick={addCustomSubject}
                    className="w-7 h-7 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: '#9747FF' }}
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
            <ContinueBtn
              disabled={data.subjects.length === 0}
              onClick={() => saveAndNext({ subjects: data.subjects }, 4)}
            />
          </StepWrapper>
        );

      // ── Step 4: Learning style ────────────────────────────────────────────
      case 4:
        return (
          <StepWrapper heading="How do you learn best?" sub="We'll use this to tailor how we teach you">
            <div className="flex flex-col gap-3 w-full max-w-sm">
              {LEARNING_STYLES.map(o => (
                <OptionCard
                  key={o.id} icon={o.icon} label={o.label}
                  selected={data.learningStyle === o.id}
                  onClick={() => saveAndNext({ learningStyle: o.id }, 5)}
                />
              ))}
            </div>
          </StepWrapper>
        );

      // ── Step 5: Struggles ─────────────────────────────────────────────────
      case 5:
        return (
          <StepWrapper heading="What gets in the way of your studying?" sub="Select everything that applies — no judgment here">
            <div className="flex flex-wrap gap-2 justify-center max-w-md">
              {STRUGGLE_OPTIONS.map(o => (
                <Pill key={o.id} icon={o.icon} label={o.label} selected={data.struggles.includes(o.id)} onClick={() => toggleStruggle(o.id)} />
              ))}
            </div>
            <ContinueBtn
              disabled={data.struggles.length === 0}
              onClick={() => {
                saveOnboardingData({ struggles: data.struggles });
                const hasFocus = data.struggles.some(s => FOCUS_STRUGGLES.has(s));
                next(hasFocus ? 6 : 7);
              }}
            />
          </StepWrapper>
        );

      // ── Step 6: Time blocking callout (conditional) ───────────────────────
      case 6:
        return (
          <StepWrapper heading="We've got something for that" sub="Studymo has a built-in time blocking system designed for exactly this">
            <div className="w-full max-w-sm rounded-2xl p-6 flex flex-col gap-4" style={{ backgroundColor: '#1A1A1A', border: '1px solid #2A2A2A' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#9747FF20' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9747FF" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <p className="font-semibold text-white">Time Block Mode</p>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">
                Break your study sessions into focused time blocks. Each task gets its own countdown timer. When the session is done your progress is saved automatically.
              </p>
              {/* Mini timer pill mockup */}
              <div className="flex items-center gap-2 px-3 py-2 rounded-full self-start" style={{ backgroundColor: '#9747FF20', border: '1px solid #9747FF40' }}>
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs text-purple-300 font-mono">25:00</span>
                <span className="text-xs text-gray-500">· Studying Biology</span>
              </div>
            </div>
            <button
              onClick={() => next(7)}
              className="mt-2 px-6 py-3 rounded-xl font-medium text-white text-sm transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#9747FF' }}
            >
              That sounds helpful →
            </button>
          </StepWrapper>
        );

      // ── Step 7: Main goal ─────────────────────────────────────────────────
      case 7:
        return (
          <StepWrapper heading="What's your main goal with Studymo?">
            <div className="flex flex-col gap-3 w-full max-w-sm">
              {GOALS.map(o => (
                <OptionCard
                  key={o.id} icon={o.icon} label={o.label}
                  selected={data.mainGoal === o.id}
                  onClick={() => saveAndNext({ mainGoal: o.id }, 8)}
                />
              ))}
            </div>
          </StepWrapper>
        );

      // ── Step 8: Upcoming test (skippable) ─────────────────────────────────
      case 8:
        return (
          <StepWrapper heading="Do you have an upcoming test?" sub="We'll build you a personalized study plan around it">
            <div className="flex flex-col gap-3 w-full max-w-sm">
              <button
                onClick={() => setTestChoice(testChoice === 'yes' ? null : 'yes')}
                className="p-5 rounded-2xl text-left transition-all"
                style={{
                  backgroundColor: testChoice === 'yes' ? '#1A0A2E' : '#1A1A1A',
                  border: `1.5px solid ${testChoice === 'yes' ? '#9747FF' : '#2A2A2A'}`,
                }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">✅</span>
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
                    <button
                      onClick={() => {
                        if (data.upcomingTest?.subject && data.upcomingTest?.date) {
                          saveOnboardingData({ upcomingTest: data.upcomingTest });
                          next(9);
                        }
                      }}
                      disabled={!data.upcomingTest?.subject || !data.upcomingTest?.date}
                      className="py-2.5 rounded-xl font-medium text-white text-sm disabled:opacity-40"
                      style={{ backgroundColor: '#9747FF' }}
                    >
                      Got it →
                    </button>
                  </div>
                )}
              </button>

              <button
                onClick={() => { saveOnboardingData({ upcomingTest: null }); next(9); }}
                className="p-5 rounded-2xl text-left transition-all"
                style={{
                  backgroundColor: testChoice === 'skip' ? '#1A0A2E' : '#1A1A1A',
                  border: '1.5px solid #2A2A2A',
                }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">➡️</span>
                  <span className="font-medium text-white text-sm">Skip for now</span>
                </div>
              </button>
            </div>
          </StepWrapper>
        );

      // ── Step 9: Demo video (skippable) ────────────────────────────────────
      case 9:
        return (
          <StepWrapper heading="See Studymo in action" sub="Watch how students are transforming their study sessions">
            <div className="w-full max-w-sm flex flex-col gap-4">
              <div
                className="w-full rounded-2xl flex flex-col items-center justify-center gap-3 py-14"
                style={{ backgroundColor: '#1A1A1A', border: '1px solid #2A2A2A' }}
              >
                <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: '#9747FF20' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9747FF" strokeWidth="2">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                </div>
                <p className="text-xs text-gray-600 text-center">[ Demo video — add final video here ]</p>
              </div>
              <ContinueBtn onClick={() => next(10)} />
            </div>
          </StepWrapper>
        );

      // ── Step 10: Social proof ─────────────────────────────────────────────
      case 10:
        return (
          <StepWrapper heading="You're in good company" sub="Here's what students are saying about Studymo">
            <div className="w-full max-w-sm flex flex-col gap-6 items-center">
              {/* Rotating stat card */}
              <div className="relative w-full h-36 overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={statIndex}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4 }}
                    className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-2xl p-6"
                    style={{ backgroundColor: '#1A1A1A', border: '1px solid #2A2A2A' }}
                  >
                    <span className="text-5xl font-extrabold" style={{ color: '#9747FF' }}>
                      {STATS[statIndex].number}
                    </span>
                    <p className="text-sm text-gray-400 text-center">{STATS[statIndex].desc}</p>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Dot indicators */}
              <div className="flex gap-2">
                {STATS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setStatIndex(i)}
                    className="w-2 h-2 rounded-full transition-colors"
                    style={{ backgroundColor: i === statIndex ? '#9747FF' : '#2A2A2A' }}
                  />
                ))}
              </div>

              <p className="text-sm text-gray-500 text-center">Join thousands of students studying smarter</p>

              <button
                onClick={() => router.push('/sign-up')}
                className="w-full py-4 rounded-xl font-semibold text-white text-base transition-opacity hover:opacity-90"
                style={{ backgroundColor: '#9747FF' }}
              >
                Create your account →
              </button>
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
        <div
          className="h-1 transition-all duration-500"
          style={{ width: `${progress}%`, backgroundColor: '#9747FF' }}
        />
      </div>

      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4">
        <button
          onClick={back}
          className="text-gray-500 hover:text-white transition-colors"
          style={{ visibility: step > 1 ? 'visible' : 'hidden' }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <span className="text-xs text-gray-600">{displayStep} of {displayTotal}</span>

        {skippable.includes(step) ? (
          <button
            onClick={() => next(step + 1)}
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            Skip
          </button>
        ) : (
          <div className="w-8" />
        )}
      </div>

      {/* Step content */}
      <div className="flex-1 flex items-center justify-center px-6 pb-10 overflow-hidden">
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

function StepWrapper({
  heading, sub, children,
}: { heading: string; sub?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-lg text-center">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-white leading-tight">{heading}</h1>
        {sub && <p className="text-sm text-gray-500">{sub}</p>}
      </div>
      {children}
    </div>
  );
}

function ContinueBtn({ onClick, disabled }: { onClick: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="mt-2 w-full max-w-xs py-3 rounded-xl font-medium text-white text-sm transition-opacity hover:opacity-90 disabled:opacity-30"
      style={{ backgroundColor: '#9747FF' }}
    >
      Continue
    </button>
  );
}
