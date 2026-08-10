'use client';

import { useAuth } from '@/hooks/useAuth';

export function useDisplayName(): string {
  const { currentUser, dbUser } = useAuth();
  return dbUser?.name ?? currentUser?.displayName ?? currentUser?.email?.split('@')[0] ?? 'User';
}

function partOfDay(hour: number): string {
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

/** "Good morning, Larry" — first name only. */
export function useGreeting(): string {
  const name = useDisplayName().split(' ')[0];
  return `${partOfDay(new Date().getHours())}, ${name}`;
}
