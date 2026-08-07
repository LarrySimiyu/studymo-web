export function formatClock(secs: number): string {
  if (!isFinite(secs) || secs < 0) return '00:00';
  return `${String(Math.floor(secs / 60)).padStart(2, '0')}:${String(Math.floor(secs % 60)).padStart(2, '0')}`;
}
