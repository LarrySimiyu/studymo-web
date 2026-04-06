'use client';

import { Menu, Zap } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function TopNav() {
  const { subscriptionStatus } = useAuth();

  return (
    <div className="lg:hidden flex items-center justify-between px-5 h-14 shrink-0">
      <button
        className="flex items-center justify-center"
        style={{ color: 'var(--text-1)' }}
        onMouseEnter={() => window.dispatchEvent(new CustomEvent('sidebar:open'))}
      >
        <Menu size={22} />
      </button>

      {!subscriptionStatus?.hasAccess && (
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('app:show-paywall'))}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-opacity hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #FF6500, #FF9A3C)' }}
        >
          <Zap size={12} />
          Get Unlimited
        </button>
      )}
    </div>
  );
}
