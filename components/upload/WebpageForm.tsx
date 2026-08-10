'use client';

import { useState } from 'react';
import { documentsApi } from '@/lib/api/documents';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import type { UploadFormProps } from './uploadTypes';

export default function WebpageForm({ loading, onStart, onSuccess, onError }: UploadFormProps) {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');

  async function handleImport() {
    const trimmed = url.trim();
    if (!trimmed) return;
    try { new URL(trimmed); } catch { onError('Please enter a valid URL including https://'); return; }
    onStart();
    const { data, error } = await documentsApi.uploadWebpage({ url: trimmed, title: title.trim() || undefined });
    if (error || !data) { onError(error ?? 'Import failed'); return; }
    onSuccess(data.id);
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-xs text-[var(--text-2)]">
          Title <span className="text-[var(--text-3)]">(optional)</span>
        </label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Leave blank to use page title" />
      </div>
      <div>
        <label className="mb-1 block text-xs text-[var(--text-2)]">Website URL</label>
        <Input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !loading && handleImport()}
          placeholder="https://example.com/article"
          autoFocus
        />
      </div>
      <div className="rounded-xl px-4 py-3 text-xs" style={{ backgroundColor: 'var(--bg-page)', border: '1px solid var(--border)' }}>
        <p className="text-[var(--text-2)]">
          Works with articles, Wikipedia, documentation, and most public pages. Paywalled or login-required pages won&apos;t import.
        </p>
      </div>
      <Button variant="primary" size="lg" className="w-full" onClick={handleImport} disabled={!url.trim() || loading}>
        {loading ? 'Importing…' : 'Import Page'}
      </Button>
    </div>
  );
}
