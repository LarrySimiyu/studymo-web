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
