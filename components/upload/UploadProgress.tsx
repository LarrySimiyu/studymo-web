'use client';

interface Props {
  progress: number;
  color: string;
}

export default function UploadProgress({ progress, color }: Props) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-[var(--text-2)]">
        <span>{progress < 100 ? 'Uploading…' : 'Finalizing…'}</span>
        {progress < 100 && <span>{progress}%</span>}
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full" style={{ backgroundColor: 'var(--bg-page)' }}>
        <div
          className="h-full rounded-full transition-all duration-200"
          style={{ width: `${progress}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}
