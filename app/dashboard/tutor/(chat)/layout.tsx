'use client';

import TutorSurface from '@/components/tutor/TutorSurface';
import { useActiveSessionId } from '@/hooks/useActiveSessionId';

/**
 * The chat surface lives in the layout, not in the two pages under it, because
 * /dashboard/tutor and /dashboard/tutor/[sessionId] are sibling route segments —
 * rendering it from each one meant the first message unmounted the very component
 * that was streaming it, losing the message while the server still charged for it.
 * A layout survives that navigation, so the send keeps running and stays on screen.
 *
 * Both pages under here render null; the route only supplies the id.
 * `history` sits outside this group so it keeps its own full-page view.
 */
export default function TutorChatLayout({ children }: { children: React.ReactNode }) {
  const sessionId = useActiveSessionId();

  return (
    <>
      <TutorSurface sessionId={sessionId} />
      {children}
    </>
  );
}
