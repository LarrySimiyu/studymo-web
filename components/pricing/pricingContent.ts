import type { Plan } from '@/lib/api/billing';

/** Mirrors FREE_LIMITS in studymo-api/src/lib/freeTier.ts */
export const FREE_FEATURES = [
  '5 uploads & 5 notes',
  '2 flashcard decks & 2 quizzes',
  '2 podcasts',
  '10 AI tutor messages',
  '2 practice exams & 1 study plan',
];

export const PAID_FEATURES = [
  'Unlimited uploads, files, audio & video',
  'Unlimited notes, flashcards & quizzes',
  'Unlimited podcasts',
  'Unlimited AI tutor chat',
  'Unlimited practice exams & study plans',
];

const PERIOD: Record<Plan['id'], string> = {
  free: '/month',
  weekly: '/week',
  monthly: '/month',
  yearly: '/year',
};

export function periodLabel(id: Plan['id']): string {
  return PERIOD[id] ?? '';
}

/** "$9.99/week" — the one place a plan's price and cadence get joined. */
export function priceWithPeriod(plan: Plan): string {
  return `${plan.price}${periodLabel(plan.id)}`;
}

export function parseDollars(price: string): number {
  return parseFloat(price.replace(/[^0-9.]/g, '')) || 0;
}

/**
 * Weekly and yearly are billed on a different cadence than the monthly plan they
 * sit next to, so a bare "$9.99" reads as the cheapest column. Monthly and free
 * return null — their headline price is already per month.
 */
export function effectiveMonthly(plan: Plan): string | null {
  const amount = parseDollars(plan.price);
  if (!amount) return null;
  if (plan.id === 'weekly') return `≈ $${((amount * 52) / 12).toFixed(2)}/month`;
  if (plan.id === 'yearly') return `≈ $${(amount / 12).toFixed(2)}/month`;
  return null;
}

/** Yearly against twelve months of the monthly plan — the comparison a buyer makes. */
export function yearlySavings(plans: Plan[]): number | null {
  const monthly = plans.find(p => p.id === 'monthly');
  const yearly = plans.find(p => p.id === 'yearly');
  if (!monthly || !yearly) return null;
  const annualised = parseDollars(monthly.price) * 12;
  const yearlyPrice = parseDollars(yearly.price);
  if (annualised <= 0 || yearlyPrice <= 0) return null;
  const pct = Math.round(((annualised - yearlyPrice) / annualised) * 100);
  return pct > 0 ? pct : null;
}

export function featuresFor(plan: Plan): string[] {
  if (plan.id === 'free') return FREE_FEATURES;
  return plan.trialDays ? [`${plan.trialDays}-day free trial`, ...PAID_FEATURES] : PAID_FEATURES;
}

export function featuresHeading(plan: Plan): string {
  return plan.id === 'free' ? "What's included for Free" : 'Everything in Free, plus';
}

/** Tailwind can't build class names at runtime, so the column counts are spelled out. */
const GRID: Record<number, string> = {
  1: 'grid-cols-1 max-w-sm mx-auto',
  2: 'grid-cols-1 sm:grid-cols-2 max-w-3xl mx-auto',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-4',
};

export function gridColumns(count: number): string {
  return GRID[count] ?? GRID[3];
}
