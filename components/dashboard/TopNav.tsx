'use client';

import { Menu } from 'lucide-react';
export default function TopNav() {
  return (
    <div className="lg:hidden flex items-center px-5 h-14 shrink-0">
      <button
        className="flex items-center justify-center"
        style={{ color: 'var(--text-1)' }}
        onMouseEnter={() => window.dispatchEvent(new CustomEvent('sidebar:open'))}
      >
        <Menu size={22} />
      </button>
    </div>
  );
}
