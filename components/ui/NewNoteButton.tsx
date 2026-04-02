import Link from 'next/link';

export default function NewNoteButton() {
  return (
    <Link
      href="/dashboard/library"
      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium hover:opacity-90 transition-opacity text-white"
      style={{ background: 'linear-gradient(135deg, #FF6500, #FF9A3C)' }}
    >
      <span className="text-sm leading-none">+</span> New Note
    </Link>
  );
}
