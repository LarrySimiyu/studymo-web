'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';

export default function SettingsPage() {
  const { currentUser, dbUser, refreshSubscription } = useAuth();
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
    <div className="max-w-2xl mx-auto py-2">
      <h1 className="text-2xl font-bold text-white mb-6">Settings</h1>

      {/* Profile */}
      <div className="rounded-xl p-6 mb-5" style={{ backgroundColor: '#1A1A1A', border: '1px solid #2A2A2A' }}>
        <h2 className="text-sm font-semibold text-white mb-4">Profile</h2>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Display Name</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Your name"
              className="w-full px-3 py-2.5 rounded-lg text-sm text-white placeholder-gray-600 outline-none"
              style={{ backgroundColor: '#111111', border: '1px solid #2A2A2A' }}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Email</label>
            <input
              readOnly
              value={currentUser?.email ?? ''}
              className="w-full px-3 py-2.5 rounded-lg text-sm text-gray-500 outline-none cursor-not-allowed"
              style={{ backgroundColor: '#111111', border: '1px solid #1A1A1A' }}
            />
            <p className="text-xs text-gray-600 mt-1">Email cannot be changed here</p>
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
      <div className="rounded-xl p-6" style={{ backgroundColor: '#1A1A1A', border: '1px solid #2A2A2A' }}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white">Billing & Subscription</h2>
            <p className="text-xs text-gray-500 mt-0.5">Manage your plan, payment method, and invoices</p>
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
    </div>
  );
}
