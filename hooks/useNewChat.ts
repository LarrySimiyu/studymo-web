'use client';

import { useRouter } from 'next/navigation';
import { useTutorSessions } from '@/context/TutorSessionsContext';
import { useActiveSessionId } from '@/hooks/useActiveSessionId';

export function useNewChat() {
  const router = useRouter();
  const activeId = useActiveSessionId();
  const { sessions, creating, createSession } = useTutorSessions();

  async function startNewChat() {
    // Reuse the open chat if it's still empty instead of stacking up blank sessions.
    const active = sessions.find(s => s.id === activeId);
    if (active && active.messageCount === 0) {
      router.push(`/dashboard/tutor/${active.id}`);
      return;
    }
    const session = await createSession();
    if (session) router.push(`/dashboard/tutor/${session.id}`);
  }

  return { startNewChat, creating };
}
