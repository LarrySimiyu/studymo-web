'use client';

import { useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTutorSessions } from '@/context/TutorSessionsContext';
import { deleteSessionOnUnload } from '@/lib/api/tutor';

interface Options {
  /** The session the view is pointed at. */
  sessionId: string | null;
  /** The session actually fetched from the server — null while it is still loading. */
  loadedId: string | null;
  /** Live message count of the loaded session. */
  messageCount: number;
  /** Streaming, creating, or otherwise mid-flight — never discard while true. */
  busy: boolean;
  onDiscarded?: (id: string) => void;
}

/**
 * Deletes a chat that was opened but never used. Fires when the session is swapped
 * out, when the view unmounts, and on tab close / refresh via a keepalive request.
 *
 * A chat is only discarded on positive evidence that it has no messages: the loaded
 * session, or the list summary while it is still loading. If neither knows the
 * session it is treated as having history and left alone.
 */
export function useEmptyChatCleanup({ sessionId, loadedId, messageCount, busy, onDiscarded }: Options) {
  const { currentUser } = useAuth();
  const { sessions, removeSession } = useTutorSessions();

  const summary = sessions.find(s => s.id === sessionId);
  const isEmpty = !busy && !!sessionId && (
    loadedId === sessionId ? messageCount === 0 : summary?.messageCount === 0
  );

  const tracked = useRef<{ id: string; empty: boolean } | null>(null);
  const discardRef = useRef<(id: string) => void>(() => {});
  const tokenRef = useRef<string | null>(null);
  const mountedRef = useRef(false);

  // Declared first so the tracking effect below always sees a current discard fn.
  useEffect(() => {
    discardRef.current = (id: string) => {
      removeSession(id).catch(() => {});
      onDiscarded?.(id);
    };
  });

  useEffect(() => {
    const prev = tracked.current;
    if (prev && prev.id !== sessionId && prev.empty) discardRef.current(prev.id);
    tracked.current = sessionId ? { id: sessionId, empty: isEmpty } : null;
  }, [sessionId, isEmpty]);

  // Pre-fetch a token while the chat is still empty — the unload handler can't await one.
  useEffect(() => {
    if (!isEmpty || !currentUser) return;
    currentUser.getIdToken().then(t => { tokenRef.current = t; }).catch(() => {});
  }, [isEmpty, currentUser]);

  useEffect(() => {
    function handlePageHide(event: PageTransitionEvent) {
      // persisted means bfcache — the user can navigate straight back into the chat.
      if (event.persisted) return;
      const last = tracked.current;
      if (last?.empty && tokenRef.current) deleteSessionOnUnload(last.id, tokenRef.current);
    }
    window.addEventListener('pagehide', handlePageHide);
    return () => window.removeEventListener('pagehide', handlePageHide);
  }, []);

  useEffect(() => {
    // StrictMode simulates an unmount synchronously after mount. The timeout has not
    // fired at that point, which is what tells the two cases apart — without this a
    // dev session would discard any chat already known to be empty on arrival.
    const timer = setTimeout(() => { mountedRef.current = true; }, 0);
    return () => {
      clearTimeout(timer);
      if (!mountedRef.current) return;
      const last = tracked.current;
      tracked.current = null;
      if (last?.empty) discardRef.current(last.id);
    };
  }, []);
}
