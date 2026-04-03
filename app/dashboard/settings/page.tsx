'use client';

import { useState } from 'react';
import Link from 'next/link';
import { User, CreditCard, LogOut, ChevronRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function SettingsPage() {
  const { currentUser, dbUser, signOut } = useAuth();
  const router = useRouter();
  const [name, setName] = useState(dbUser?.name ?? '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.patch('/users/me', { name });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-xl font-bold text-[var(--text-1)] mb-6">Settings</h1>

      <div className="flex flex-col gap-4">

        {/* Profile */}
        <section className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(139,92,246,0.12)' }}>
              <User size={15} style={{ color: '#8B5CF6' }} />
            </div>
            <h2 className="text-sm font-semibold text-[var(--text-1)]">Profile</h2>
          </div>

          <form onSubmit={handleSave} className="px-5 py-5 space-y-4">
            <div>
              <label className="block text-xs font-medium text-[var(--text-2)] mb-1.5">Display Name</label>
              <Input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-2)] mb-1.5">Email</label>
              <Input
                readOnly
                value={currentUser?.email ?? ''}
                className="cursor-not-allowed opacity-60"
              />
              <p className="text-xs text-[var(--text-3)] mt-1.5">Email cannot be changed here</p>
            </div>
            <Button type="submit" variant="brand" size="sm" disabled={saving}>
              {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save Changes'}
            </Button>
          </form>
        </section>

        {/* Billing */}
        <section className="rounded-2xl" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <Link
            href="/dashboard/settings/billing"
            className="flex items-center justify-between px-5 py-4 rounded-2xl transition-colors hover:bg-[var(--bg-hover)]"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(255,101,0,0.12)' }}>
                <CreditCard size={15} style={{ color: '#FF6500' }} />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--text-1)]">Billing & Subscription</p>
                <p className="text-xs text-[var(--text-3)] mt-0.5">Manage your plan, payment method, and invoices</p>
              </div>
            </div>
            <ChevronRight size={16} style={{ color: 'var(--text-3)' }} className="shrink-0" />
          </Link>
        </section>

        {/* Sign out */}
        <section className="rounded-2xl" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(239,68,68,0.1)' }}>
                <LogOut size={15} style={{ color: '#EF4444' }} />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--text-1)]">Sign Out</p>
                <p className="text-xs text-[var(--text-3)] mt-0.5">{currentUser?.email}</p>
              </div>
            </div>
            <button
              onClick={async () => { await signOut(); router.replace('/'); }}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{ backgroundColor: 'rgba(239,68,68,0.08)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)' }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(239,68,68,0.16)';
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(239,68,68,0.4)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(239,68,68,0.08)';
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(239,68,68,0.2)';
              }}
            >
              Sign out
            </button>
          </div>
        </section>

      </div>
    </div>
  );
}
