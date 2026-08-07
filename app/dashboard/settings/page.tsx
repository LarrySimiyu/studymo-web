'use client';

import Link from 'next/link';
import { User, CreditCard, LogOut, ChevronRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import PageShell from '@/components/dashboard/PageShell';

export default function SettingsPage() {
  const { currentUser, dbUser, signOut } = useAuth();
  const router = useRouter();

  return (
    <PageShell width="sm" center>
      <h1 className="mb-6 text-heading-sm md:text-heading text-[var(--text-1)]">Settings</h1>

      <div className="flex flex-col gap-4">

        {/* Profile */}
        <section className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(139,92,246,0.12)' }}>
              <User size={15} style={{ color: '#8B5CF6' }} />
            </div>
            <h2 className="text-body-sm font-semibold text-[var(--text-1)]">Profile</h2>
          </div>

          <div className="px-5 py-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-body-sm text-[var(--text-2)]">Name</span>
              <span className="text-body-sm font-medium text-[var(--text-1)]">{dbUser?.name ?? '—'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-body-sm text-[var(--text-2)]">Email</span>
              <span className="text-body-sm font-medium text-[var(--text-1)]">{currentUser?.email ?? '—'}</span>
            </div>
          </div>
        </section>

        {/* Billing */}
        <section className="rounded-2xl" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <Link
            href="/dashboard/settings/billing"
            className="flex items-center justify-between px-5 py-4 rounded-2xl transition-colors hover:bg-[var(--bg-hover)]"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(255,101,0,0.12)' }}>
                <CreditCard size={15} className="text-[var(--brand-ink)]" />
              </div>
              <div>
                <p className="text-body-sm font-semibold text-[var(--text-1)]">Billing &amp; Subscription</p>
                <p className="text-xs text-[var(--text-2)] mt-0.5">Manage your plan and payment method</p>
              </div>
            </div>
            <ChevronRight size={16} style={{ color: 'var(--text-2)' }} className="shrink-0" />
          </Link>
        </section>

        {/* Sign out */}
        <section className="rounded-2xl" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--danger-subtle)]">
                <LogOut size={15} className="text-[var(--danger-ink)]" />
              </div>
              <div>
                <p className="text-body-sm font-semibold text-[var(--text-1)]">Sign Out</p>
                <p className="text-xs text-[var(--text-2)] mt-0.5">{currentUser?.email}</p>
              </div>
            </div>
            <Button
              variant="danger"
              size="xs"
              onClick={async () => { await signOut(); router.replace('/'); }}
            >
              Sign out
            </Button>
          </div>
        </section>

      </div>
    </PageShell>
  );
}
