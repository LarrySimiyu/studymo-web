'use client';

import { Menu, Zap } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { showPaywall } from '@/lib/paywall';
import { Button } from '@/components/ui/Button';

export default function TopNav() {
  const { subscriptionStatus } = useAuth();

  return (
    <div className="lg:hidden flex items-center justify-between px-5 h-14 shrink-0">
      <Button
        variant="ghost"
        size="icon"
        aria-label="Open sidebar"
        className="text-[var(--text-1)]"
        onMouseEnter={() => window.dispatchEvent(new CustomEvent('sidebar:open'))}
        onClick={() => window.dispatchEvent(new CustomEvent('sidebar:open'))}
      >
        <Menu size={22} />
      </Button>

      {!subscriptionStatus?.hasAccess && (
        <Button
          variant="upgrade"
          size="xs"
          onClick={() => showPaywall('top_nav')}
        >
          <Zap size={12} />
          Get Unlimited
        </Button>
      )}
    </div>
  );
}
