const CONTENT_CHANGED = 'content:changed';

/** Study-material totals are rendered by the sidebar, which sits outside the
 *  library provider tree and so can't see its state. Anything that adds or
 *  removes content fires this instead, and the sidebar recounts. */
export function emitContentChanged(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(CONTENT_CHANGED));
}

export function onContentChanged(handler: () => void): () => void {
  window.addEventListener(CONTENT_CHANGED, handler);
  return () => window.removeEventListener(CONTENT_CHANGED, handler);
}

const USAGE_CHANGED = 'usage:changed';

/** Any successful mutation can move a free-tier counter, and the counters are
 *  rendered far from the thing that changed. Fires on every write, unlike
 *  CONTENT_CHANGED which is scoped to what the sidebar totals. */
export function emitUsageChanged(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(USAGE_CHANGED));
}

export function onUsageChanged(handler: () => void): () => void {
  window.addEventListener(USAGE_CHANGED, handler);
  return () => window.removeEventListener(USAGE_CHANGED, handler);
}
