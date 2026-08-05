'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useTutorSessions } from '@/context/TutorSessionsContext';

export function useNewChat() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { sessions, creating, createSession } = useTutorSessions();

  async function startNewChat() {
    // Reuse the open chat if it's still empty instead of stacking up blank sessions.
    const activeId = searchParams.get('session');
    const active = sessions.find(s => s.id === activeId);
    if (active && active.messageCount === 0) {
      router.push(`/dashboard/tutor?session=${active.id}`);
      return;
    }
    const id = await createSession();
    if (id) router.push(`/dashboard/tutor?session=${id}`);
  }

  return { startNewChat, creating };
}
