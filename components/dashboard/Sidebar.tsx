'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { label: 'Home', href: '/dashboard', icon: '⌂' },
  { label: 'Settings', href: '/dashboard/settings', icon: '⚙' },
];

export default function Sidebar() {
  const { signOut, currentUser } = useAuth();
  const pathname = usePathname();

  return (
    <aside className="w-60 shrink-0 border-r border-border bg-card flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <span className="text-lg font-bold text-foreground">YourApp</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              pathname === item.href
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            )}
          >
            <span>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      {/* User / sign out */}
      <div className="p-4 border-t border-border">
        <p className="text-xs text-muted-foreground truncate mb-2">{currentUser?.email}</p>
        <button
          onClick={() => signOut()}
          className="w-full text-left text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
