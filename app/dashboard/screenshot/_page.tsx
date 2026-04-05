'use client';

import { useState } from 'react';
import { House, Star, Folder as FolderIcon, Library, Wrench, FileText, CalendarDays, Heart, ClipboardList } from 'lucide-react';

// ── Static fake data ──────────────────────────────────────────────────────────

const COLLECTIONS = [
  { name: 'Biology', color: '#22C55E', count: 8 },
  { name: 'Calculus', color: '#3B82F6', count: 5 },
  { name: 'Psychology', color: '#9747FF', count: 6 },
  { name: 'Chemistry', color: '#F59E0B', count: 3 },
];

const PALETTES: [string, string][] = [
  ['#FF6500', 'rgba(255,101,0,0.12)'],
  ['#22C55E', 'rgba(34,197,94,0.12)'],
  ['#3B82F6', 'rgba(59,130,246,0.12)'],
  ['#F59E0B', 'rgba(245,158,11,0.12)'],
  ['#EC4899', 'rgba(236,72,153,0.12)'],
];

const RECENT_NOTES = [
  { id: '1', title: 'Cell Biology – Lecture 1', p: 0 },
  { id: '2', title: 'Mitosis & Meiosis Notes', p: 1 },
  { id: '3', title: 'Cold War Overview', p: 2 },
  { id: '4', title: 'Calculus – Derivatives', p: 3 },
  { id: '5', title: 'Psychology: Memory', p: 4 },
];

const WEAK_TOPICS = [
  { id: '1', topic: 'Differences between mitosis and meiosis in cell division phases', missed: 2 },
  { id: '2', topic: 'Role of the Golgi apparatus in protein packaging and transport', missed: 2 },
  { id: '3', topic: 'Applying the chain rule when differentiating composite functions', missed: 3 },
  { id: '4', topic: 'Encoding differences between short-term and long-term memory', missed: 1 },
];

const PLAN_1_ITEMS = [
  { label: 'Cell Structure & Organelles', date: 'Apr 2', done: true },
  { label: 'Cell Membrane & Transport', date: 'Apr 3', done: true },
  { label: 'Mitosis & Meiosis Notes', date: 'Apr 4', done: false, progress: '0/1' },
  { label: 'DNA Transcription & Translation', date: 'Apr 5', done: false, progress: '0/1' },
  { label: 'Full Review Session', date: 'Apr 6', done: false, progress: '0/1' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function Ring({ pct, color }: { pct: number; color: string }) {
  const r = 46.5;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct / 100);
  return (
    <svg width="100%" height="100%" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={50} cy={50} r={r} fill="none" stroke="var(--bg-input)" strokeWidth={7} />
      <circle cx={50} cy={50} r={r} fill="none" stroke={color} strokeWidth={7}
        strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset} />
    </svg>
  );
}

function missedColor(n: number) {
  if (n >= 5) return { badge: 'rgba(239,68,68,0.12)', text: '#EF4444' };
  if (n >= 3) return { badge: 'rgba(245,158,11,0.12)', text: '#F59E0B' };
  return { badge: 'var(--bg-input)', text: 'var(--text-3)' };
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StaticSidebar() {
  return (
    <aside
      className="shrink-0 flex flex-col my-3 ml-3 rounded-2xl overflow-hidden"
      style={{ width: 280, backgroundColor: 'var(--bg-card)' }}
    >
      {/* Logo */}
      <div className="px-3 py-3.5">
        <span className="text-sm font-bold tracking-tight text-[var(--text-1)]">StudyMo</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-1.5 py-2 overflow-y-auto space-y-1">
        {/* Home */}
        <div className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-sm font-medium text-white">
          <House size={16} className="shrink-0" />
          <span>Home</span>
        </div>

        {/* AI Tutor */}
        <div
          className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-sm font-bold text-white"
          style={{ background: 'linear-gradient(135deg, #FF6500, #FF9A3C)' }}
        >
          <Star size={16} fill="white" className="shrink-0" />
          <span>AI Tutor</span>
        </div>

        {/* Notes section */}
        <div className="flex items-center gap-1.5 px-2.5 pt-2 pb-1">
          <FolderIcon size={14} className="text-white" />
          <span className="flex-1 text-sm font-semibold text-white">Notes</span>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="text-white">
            <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <div className="ml-4 space-y-0.5">
          <div className="flex items-center gap-2 px-2 py-1 rounded-md text-xs text-[var(--text-2)]">
            <span className="truncate flex-1">All Notes</span>
            <span className="text-[10px] font-medium text-[var(--text-3)]">28</span>
          </div>
          <div className="flex items-center gap-2 px-2 py-1 rounded-md text-xs text-[var(--text-2)]">
            <span className="truncate flex-1">No Collection</span>
            <span className="text-[10px] font-medium text-[var(--text-3)]">6</span>
          </div>
          {COLLECTIONS.map(c => (
            <div key={c.name} className="flex items-center gap-2 px-2 py-1 rounded-md text-xs text-[var(--text-2)]">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
              <span className="truncate flex-1">{c.name}</span>
              <span className="text-[10px] font-medium text-[var(--text-3)]">{c.count}</span>
            </div>
          ))}
          <div className="flex items-center gap-2 px-2 py-1 rounded-md text-xs text-[var(--text-2)]">
            <span className="text-xs opacity-60">+</span>
            <span>New Collection</span>
          </div>
        </div>

        {/* Study Materials */}
        <div className="flex items-center gap-1.5 px-2.5 pt-2 pb-1">
          <Library size={14} className="text-white" />
          <span className="flex-1 text-sm font-semibold text-white">Study Materials</span>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="text-white" style={{ transform: 'rotate(-90deg)' }}>
            <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        {/* Tools */}
        <div className="flex items-center gap-1.5 px-2.5 pt-2 pb-1">
          <Wrench size={14} className="text-white" />
          <span className="flex-1 text-sm font-semibold text-white">Tools</span>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="text-white" style={{ transform: 'rotate(-90deg)' }}>
            <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </nav>

      {/* User footer */}
      <div className="px-1.5 pb-2 pt-1">
        <div className="flex items-center gap-2 px-2.5 py-2 rounded-lg">
          <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-semibold shrink-0" style={{ backgroundColor: 'var(--brand)' }}>
            JS
          </div>
          <p className="text-xs font-medium truncate text-[var(--text-1)]">Jordan Smith</p>
        </div>
      </div>
    </aside>
  );
}

function StaticCalendar() {
  const weeks = [
    [null, null, null, 1, 2, 3, 4],
    [5, 6, 7, 8, 9, 10, 11],
    [12, 13, 14, 15, 16, 17, 18],
    [19, 20, 21, 22, 23, 24, 25],
    [26, 27, 28, 29, 30, null, null],
  ];
  const scheduled = new Set([5, 6, 7]);
  const completed = new Set([1, 2, 3, 4]);
  const today = 4;

  return (
    <div className="px-1">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-[var(--text-1)]">April 2026</span>
        <div className="flex gap-1">
          <button className="w-5 h-5 flex items-center justify-center text-[var(--text-3)]">
            <svg width="8" height="8" viewBox="0 0 10 10" fill="none"><path d="M7 2L3 5l4 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
          <button className="w-5 h-5 flex items-center justify-center text-[var(--text-3)]">
            <svg width="8" height="8" viewBox="0 0 10 10" fill="none"><path d="M3 2l4 3-4 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 text-center mb-0.5">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
          <div key={d} className="text-[9px] text-[var(--text-3)] font-medium py-0.5">{d}</div>
        ))}
      </div>
      {weeks.map((week, wi) => (
        <div key={wi} className="grid grid-cols-7 text-center">
          {week.map((day, di) => (
            <div key={di} className="flex flex-col items-center py-0.5">
              {day !== null && (
                <>
                  <span
                    className="text-[10px] w-5 h-5 flex items-center justify-center rounded-full"
                    style={{
                      color: day === today ? 'white' : 'var(--text-2)',
                      backgroundColor: day === today ? 'var(--brand)' : 'transparent',
                      fontWeight: day === today ? 700 : 400,
                    }}
                  >
                    {day}
                  </span>
                  {(scheduled.has(day) || completed.has(day)) && (
                    <span className="w-1 h-1 rounded-full mt-0.5" style={{ backgroundColor: completed.has(day) ? '#22C55E' : '#FF6500' }} />
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      ))}
      <div className="flex items-center gap-3 mt-2">
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#FF6500' }} />
          <span className="text-[10px] text-[var(--text-3)]">Scheduled</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#22C55E' }} />
          <span className="text-[10px] text-[var(--text-3)]">Completed</span>
        </div>
      </div>
    </div>
  );
}

function StaticRightPanel() {
  const [plan1Open, setPlan1Open] = useState(true);

  return (
    <div className="flex flex-col gap-4 h-full overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl shrink-0" style={{ backgroundColor: 'var(--bg-card)' }}>
        <button className="flex-1 py-1.5 rounded-lg text-xs font-semibold capitalize" style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-1)' }}>
          Planning · 2
        </button>
        <button className="flex-1 py-1.5 rounded-lg text-xs font-semibold capitalize" style={{ color: 'var(--text-3)' }}>
          Tasks
        </button>
      </div>

      {/* Calendar */}
      <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--bg-card)' }}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-[var(--text-1)]">2 plans</span>
          <button className="w-5 h-5 flex items-center justify-center rounded" style={{ backgroundColor: 'var(--bg-input)' }}>
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="var(--text-2)" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </button>
        </div>
        <StaticCalendar />
      </div>

      {/* Plan 1 */}
      <div className="rounded-xl overflow-hidden" style={{ backgroundColor: 'var(--bg-card)' }}>
        <button
          onClick={() => setPlan1Open(o => !o)}
          className="w-full flex items-center gap-2 px-4 py-3"
        >
          <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(34,197,94,0.12)' }}>
            <CalendarDays size={14} color="#22C55E" />
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-xs font-semibold text-[var(--text-1)] truncate">Biology Midterm</p>
            <p className="text-[10px] text-[var(--text-3)]">Apr 7, 2026</p>
          </div>
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full shrink-0" style={{ backgroundColor: 'rgba(245,158,11,0.12)', color: '#F59E0B' }}>3d Left</span>
          <svg width="12" height="12" viewBox="0 0 10 10" fill="none" className="text-[var(--text-3)] shrink-0" style={{ transform: plan1Open ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.15s' }}>
            <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* Progress bar */}
        <div className="px-4 pb-1">
          <div className="flex items-center justify-between mb-1">
            <div className="flex-1 h-1.5 rounded-full mr-3 overflow-hidden" style={{ backgroundColor: 'var(--bg-input)' }}>
              <div className="h-full rounded-full" style={{ width: '40%', backgroundColor: '#22C55E' }} />
            </div>
            <span className="text-[10px] font-medium text-[var(--text-3)]">2/5</span>
          </div>
        </div>

        {plan1Open && (
          <div className="px-4 pb-3 space-y-2 mt-1">
            {PLAN_1_ITEMS.map((item, i) => (
              <div key={i} className="flex items-start gap-2.5">
                {item.done ? (
                  <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: 'rgba(34,197,94,0.15)' }}>
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="2 6 5 9 10 3" />
                    </svg>
                  </div>
                ) : (
                  <span className="text-[9px] font-medium text-[var(--text-3)] shrink-0 mt-1 w-5 text-center">{item.progress}</span>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-[var(--text-1)] leading-snug">{item.label}</p>
                  <p className="text-[9px] text-[var(--text-3)]">{item.date}</p>
                </div>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="text-[var(--text-3)] shrink-0 mt-1">
                  <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Plan 2 */}
      <div className="rounded-xl" style={{ backgroundColor: 'var(--bg-card)' }}>
        <div className="flex items-center gap-2 px-4 py-3">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(59,130,246,0.12)' }}>
            <CalendarDays size={14} color="#3B82F6" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-[var(--text-1)] truncate">Calculus Final</p>
            <p className="text-[10px] text-[var(--text-3)]">Apr 22, 2026</p>
          </div>
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full shrink-0" style={{ backgroundColor: 'rgba(34,197,94,0.12)', color: '#22C55E' }}>18d Left</span>
          <svg width="12" height="12" viewBox="0 0 10 10" fill="none" className="text-[var(--text-3)] shrink-0" style={{ transform: 'rotate(-90deg)' }}>
            <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="px-4 pb-3">
          <div className="flex items-center justify-between mb-1">
            <div className="flex-1 h-1.5 rounded-full mr-3 overflow-hidden" style={{ backgroundColor: 'var(--bg-input)' }}>
              <div className="h-full rounded-full" style={{ width: '0%', backgroundColor: '#3B82F6' }} />
            </div>
            <span className="text-[10px] font-medium text-[var(--text-3)]">0/8</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function DashboardScreenshotPage() {
  return (
    <div className="fixed inset-0 z-[9999] flex overflow-hidden" style={{ backgroundColor: 'var(--bg-page)' }}>

      {/* Sidebar */}
      <StaticSidebar />

      {/* Main area */}
      <div className="flex-1 flex gap-6 overflow-hidden">

        {/* Main content */}
        <div className="flex-1 min-w-0 overflow-y-auto p-6 space-y-6" style={{ scrollbarWidth: 'none' }}>

          {/* Welcome */}
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-1)]">Welcome back, Jordan</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-2)' }}>Here&apos;s what&apos;s happening with your studies.</p>
          </div>

          {/* Recent Notes */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xs font-medium text-[var(--text-1)]">Recent Notes</h2>
              <span className="text-xs font-medium" style={{ color: 'var(--text-2)' }}>View All</span>
            </div>
            <div className="flex gap-3 overflow-x-hidden">
              {RECENT_NOTES.map(note => {
                const [ic, ib] = PALETTES[note.p];
                return (
                  <div
                    key={note.id}
                    className="shrink-0 flex items-center gap-3 px-4 py-3 rounded-xl"
                    style={{ backgroundColor: 'var(--bg-card)', width: 210 }}
                  >
                    <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: ib }}>
                      <FileText size={16} style={{ color: ic }} />
                    </div>
                    <p className="text-xs font-medium text-[var(--text-1)] truncate">{note.title}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* For You */}
          <div>
            <h2 className="text-xs font-medium text-[var(--text-2)] mb-2">For You</h2>
            <div className="grid grid-cols-4 gap-3">
              {[
                { icon: <FileText size={26} color="#FF6500" />, bg: 'rgba(255,101,0,0.12)', label: 'New Note', sub: 'From any format' },
                { icon: <CalendarDays size={26} color="#3B82F6" />, bg: 'rgba(59,130,246,0.12)', label: 'Create a Study Plan', sub: 'AI day-by-day schedule' },
                { icon: <Heart size={26} color="#EC4899" fill="#EC4899" />, bg: 'rgba(236,72,153,0.12)', label: 'Take a Quiz', sub: 'Test and track weak spots' },
                { icon: <ClipboardList size={26} color="#8B5CF6" />, bg: 'rgba(139,92,246,0.12)', label: 'Practice Exam', sub: 'Full timed simulation' },
              ].map(card => (
                <div
                  key={card.label}
                  className="flex flex-col items-start gap-3 px-6 py-4 rounded-xl"
                  style={{ backgroundColor: 'var(--bg-card)' }}
                >
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: card.bg }}>
                    {card.icon}
                  </div>
                  <div>
                    <p className="text-base font-semibold text-[var(--text-1)]">{card.label}</p>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-3)' }}>{card.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quiz Stats */}
          <div>
            <h2 className="text-xs font-medium text-[var(--text-1)] mb-2">Quiz Stats</h2>
            <div className="grid grid-cols-3 gap-3 p-8 rounded-xl" style={{ backgroundColor: 'var(--bg-card)' }}>
              {/* Avg Score */}
              <div className="flex flex-col items-center gap-2">
                <div className="relative w-32 h-32">
                  <Ring pct={86} color="#22C55E" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold" style={{ color: '#22C55E' }}>86%</span>
                  </div>
                </div>
                <p className="text-xs text-[var(--text-3)] text-center">Avg Score</p>
              </div>
              {/* Best Score */}
              <div className="flex flex-col items-center gap-2">
                <div className="relative w-32 h-32">
                  <Ring pct={93} color="#22C55E" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold" style={{ color: '#22C55E' }}>93%</span>
                  </div>
                </div>
                <p className="text-xs text-[var(--text-3)] text-center">Best Score</p>
              </div>
              {/* Attempts */}
              <div className="flex flex-col items-center gap-2">
                <div className="w-32 h-32 flex items-center justify-center">
                  <span className="text-[3.5rem] font-bold leading-none" style={{ color: 'var(--brand)' }}>7</span>
                </div>
                <p className="text-xs text-[var(--text-3)] text-center">Attempts</p>
              </div>
            </div>
            {/* Quizzes row — expanded */}
            <div className="mt-2 flex flex-col gap-2">
              <div
                className="flex items-center justify-between px-4 py-3 rounded-xl"
                style={{ backgroundColor: 'var(--bg-card)' }}
              >
                <span className="text-xs font-semibold text-[var(--text-1)]">
                  Quizzes <span className="font-normal text-[var(--text-3)]">· 3</span>
                </span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-1)" strokeWidth="2" strokeLinecap="round">
                  <polyline points="6 15 12 9 18 15" />
                </svg>
              </div>
              {[
                { title: 'Cell Biology – Lecture 1', score: 93, attempts: 3, improvement: 15 },
                { title: 'Mitosis & Meiosis Notes', score: 86, attempts: 2, improvement: 20 },
                { title: 'Calculus – Derivatives', score: 75, attempts: 2, improvement: 0 },
              ].map(q => {
                const scoreColor = q.score >= 80 ? '#22C55E' : q.score >= 60 ? '#F59E0B' : '#EF4444';
                const r = 19.5; const circ = 2 * Math.PI * r;
                const offset = circ * (1 - q.score / 100);
                const impColor = q.improvement > 0 ? '#22C55E' : q.improvement < 0 ? '#EF4444' : 'var(--text-3)';
                const impBg = q.improvement > 0 ? 'rgba(34,197,94,0.12)' : q.improvement < 0 ? 'rgba(239,68,68,0.12)' : 'var(--bg-input)';
                return (
                  <div key={q.title} className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ backgroundColor: 'var(--bg-card)' }}>
                    <div className="relative shrink-0 w-11 h-11">
                      <svg width="44" height="44" viewBox="0 0 44 44" style={{ transform: 'rotate(-90deg)' }}>
                        <circle cx={22} cy={22} r={r} fill="none" stroke="var(--bg-input)" strokeWidth={4} />
                        <circle cx={22} cy={22} r={r} fill="none" stroke={scoreColor} strokeWidth={4}
                          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset} />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-[10px] font-bold" style={{ color: scoreColor }}>{q.score}%</span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-[var(--text-1)] truncate">{q.title}</p>
                      <p className="text-xs text-[var(--text-3)]">{q.attempts} attempt{q.attempts !== 1 ? 's' : ''}</p>
                    </div>
                    {q.improvement !== 0 && (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 flex items-center gap-0.5" style={{ backgroundColor: impBg, color: impColor }}>
                        ↑{q.improvement}%
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Weak Topics */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xs font-medium text-[var(--text-1)]">Weak Topics</h2>
              <span className="text-xs font-medium" style={{ color: 'var(--text-2)' }}>View All</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {WEAK_TOPICS.map(wt => {
                const colors = missedColor(wt.missed);
                return (
                  <div key={wt.id} className="px-4 py-3 rounded-xl" style={{ backgroundColor: 'var(--bg-card)' }}>
                    <p className="text-xs text-[var(--text-1)] leading-snug mb-4">{wt.topic}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: colors.badge, color: colors.text }}>
                        {wt.missed}× missed
                      </span>
                      <button className="text-xs px-2.5 py-1 rounded-lg" style={{ backgroundColor: 'rgba(245,158,11,0.12)', color: '#F59E0B' }}>
                        Show answer
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>{/* end main content */}

        {/* Right panel */}
        <div className="w-80 shrink-0 py-6 pr-6">
          <StaticRightPanel />
        </div>

      </div>
    </div>
  );
}
