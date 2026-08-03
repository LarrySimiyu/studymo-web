'use client';

import { Star, Upload, FileText, Mic, MessageSquare, BookOpen, Check } from 'lucide-react';
import { Plan } from '@/lib/api/billing';

export const FEATURES = [
  { icon: Upload,       color: '#FF6500', bg: 'rgba(255,101,0,0.12)',   text: 'Unlimited uploads, files, audio & video' },
  { icon: FileText,     color: '#8B5CF6', bg: 'rgba(139,92,246,0.12)',  text: 'AI notes, flashcards & quizzes' },
  { icon: Mic,          color: '#EC4899', bg: 'rgba(236,72,153,0.12)',  text: 'Podcast from any document' },
  { icon: MessageSquare,color: '#3B82F6', bg: 'rgba(59,130,246,0.12)', text: 'Chat with your AI tutor' },
  { icon: BookOpen,     color: '#14B8A6', bg: 'rgba(20,184,166,0.12)', text: 'Practice exams & study plans' },
];

interface Props {
  plan: Plan | undefined;
  selected: Plan['id'];
  loading: boolean;
  onCTA: () => void;
}

export default function PlanCard({ plan, selected, loading, onCTA }: Props) {
  const isYearly = selected === 'yearly';

  return (
    <div
      className="rounded-3xl p-6 flex flex-col gap-5 w-full text-left"
      style={{ backgroundColor: 'var(--bg-card)', border: '2px solid var(--border)' }}
    >
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="w-11 h-11 flex items-center justify-center">
          <Star
            size={32}
            style={{
              color: selected === 'yearly' ? '#22C55E' : selected === 'monthly' ? '#FF6500' : 'var(--text-1)',
              fill:  selected === 'yearly' ? '#22C55E' : selected === 'monthly' ? '#FF6500' : 'var(--text-1)',
            }}
          />
        </div>
        <span
          className="text-xs font-bold px-3 py-1 rounded-full transition-opacity"
          style={{
            backgroundColor: 'rgba(34,197,94,0.15)',
            color: '#22C55E',
            opacity: isYearly ? 1 : 0,
            pointerEvents: 'none',
          }}
        >
          Most popular
        </span>
      </div>

      {/* Plan name + subtitle */}
      <div>
        <p className="text-lg font-bold" style={{ color: 'var(--text-1)' }}>
          {plan?.label ?? '—'} Plan
        </p>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-3)' }}>
          {isYearly ? 'Best value, one simple payment' : `Billed ${plan?.sub ?? ''}`}
        </p>
      </div>

      {/* Price row */}
      <div className="flex items-end justify-between gap-3">
        <div className="flex items-end gap-1.5">
          <span
            className="font-extrabold tabular-nums leading-none"
            style={{ color: 'var(--text-1)', fontSize: 'clamp(2.5rem, 8vw, 3.25rem)' }}
          >
            {plan?.price ?? '—'}
          </span>
          <span className="text-sm font-medium mb-1.5" style={{ color: 'var(--text-3)' }}>
            {plan?.sub}
          </span>
        </div>
        <span className="text-sm text-right shrink-0 mb-1.5" style={{ color: 'var(--text-3)' }}>
          Cancel<br />any time
        </span>
      </div>

      {/* Features */}
      <div className="rounded-2xl p-4 flex flex-col gap-3" style={{ backgroundColor: 'var(--bg-input)' }}>
        {FEATURES.map(({ icon: Icon, color, bg, text }) => (
          <div key={text} className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: bg }}>
              <Icon size={15} style={{ color }} />
            </div>
            <span className="text-sm font-medium flex-1" style={{ color: 'var(--text-1)' }}>
              {text}
            </span>
            <Check size={14} className="shrink-0" style={{ color: '#22C55E' }} />
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="flex flex-col gap-2">
        <button
          onClick={onCTA}
          disabled={loading || !plan}
          className="w-full py-4 rounded-2xl font-bold text-base sm:text-lg text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg, #FF6500 0%, #FF9A3C 100%)' }}
        >
          {loading ? 'Loading…' : plan?.trialDays ? 'Try for $0' : 'Get Unlimited'}
        </button>
        {plan?.trialDays && (
          <p className="text-center text-xs" style={{ color: 'var(--text-3)' }}>
            No risk, no payment today
          </p>
        )}
      </div>
    </div>
  );
}
