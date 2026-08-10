import { PenLine } from 'lucide-react';

export default function LibraryPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center gap-3 px-6">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'rgba(255,101,0,0.12)' }}>
        <PenLine size={28} style={{ color: 'var(--brand)' }} />
      </div>
      <div>
        <p className="text-body font-semibold text-[var(--text-1)]">Select a note to view it</p>
        <p className="text-body-sm text-[var(--text-3)] mt-1">Or create a new note to get started</p>
      </div>
    </div>
  );
}
