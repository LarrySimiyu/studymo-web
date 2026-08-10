import { Folder } from '@/lib/api/organization';

export function timeAgo(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const secs = Math.floor(diffMs / 1000);
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 2) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function typeIcon(type: string): string {
  if (type === 'pdf') return '📄';
  if (type === 'audio') return '🎵';
  if (type === 'recording') return '🎙';
  if (type === 'video_url') return '🎬';
  return '📄';
}

export function flattenFolders(folders: Folder[], depth = 0): (Folder & { depth: number })[] {
  const result: (Folder & { depth: number })[] = [];
  for (const f of folders) {
    result.push({ ...f, depth });
    if (f.children?.length) result.push(...flattenFolders(f.children, depth + 1));
  }
  return result;
}

export function notifyFoldersChanged(): void {
  window.dispatchEvent(new CustomEvent('library:folders-changed'));
}
