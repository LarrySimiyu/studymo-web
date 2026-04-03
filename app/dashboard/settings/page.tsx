'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const { currentUser, dbUser, refreshSubscription, signOut } = useAuth();
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
    <div className="max-w-2xl mx-auto px-6 py-6">
      <h1 className="text-2xl font-bold text-[var(--text-1)] mb-6">Settings</h1>

      {/* Profile */}
      <div className="rounded-xl p-6 mb-5" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <h2 className="text-sm font-semibold text-[var(--text-1)] mb-4">Profile</h2>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[var(--text-2)] mb-1.5">Display Name</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Your name"
              className="w-full px-3 py-2.5 rounded-lg text-sm text-[var(--text-1)] placeholder-[var(--text-3)] outline-none"
              style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border)' }}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--text-2)] mb-1.5">Email</label>
            <input
              readOnly
              value={currentUser?.email ?? ''}
              className="w-full px-3 py-2.5 rounded-lg text-sm text-[var(--text-2)] outline-none cursor-not-allowed"
              style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--bg-card)' }}
            />
            <p className="text-xs text-[var(--text-3)] mt-1">Email cannot be changed here</p>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-50"
            style={{ backgroundColor: '#9747FF' }}
          >
            {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* Billing shortcut */}
      <div className="rounded-xl p-6 mb-5" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-[var(--text-1)]">Billing & Subscription</h2>
            <p className="text-xs text-[var(--text-2)] mt-0.5">Manage your plan, payment method, and invoices</p>
          </div>
          <Link
            href="/dashboard/settings/billing"
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-white hover:opacity-90 transition-opacity"
            style={{ backgroundColor: '#9747FF' }}
          >
            View Billing →
          </Link>
        </div>
      </div>

      {/* Sign out */}
      <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-[var(--text-1)]">Sign Out</h2>
            <p className="text-xs text-[var(--text-2)] mt-0.5">{currentUser?.email}</p>
          </div>
          <button
            onClick={async () => { await signOut(); router.replace('/onboarding'); }}
            className="px-3 py-1.5 rounded-lg text-xs font-medium hover:opacity-90 transition-opacity"
            style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-2)', border: '1px solid var(--border)' }}
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
