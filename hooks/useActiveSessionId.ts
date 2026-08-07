'use client';

import { usePathname } from 'next/navigation';

// Static siblings of /dashboard/tutor/[sessionId] — never session ids.
const RESERVED_SEGMENTS = new Set(['history']);

/** The open chat's id from the route, or null on the welcome screen and other tutor pages. */
export function useActiveSessionId(): string | null {
  const pathname = usePathname();
  const match = pathname.match(/^\/dashboard\/tutor\/([^/]+)\/?$/);
  if (!match || RESERVED_SEGMENTS.has(match[1])) return null;
  return decodeURIComponent(match[1]);
}
