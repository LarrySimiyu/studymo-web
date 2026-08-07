'use client';

import { useState } from 'react';
import { documentsApi } from '@/lib/api/documents';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import type { UploadFormProps } from './uploadTypes';

export default function VideoForm({ loading, onStart, onSuccess, onError }: UploadFormProps) {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');

  async function handleImport() {
    if (!url) return;
    onStart();
    const { data, error } = await documentsApi.uploadVideo({ url, title: title || 'YouTube Video' });
    if (error || !data) { onError(error ?? 'Import failed'); return; }
    onSuccess(data.id);
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-xs text-[var(--text-2)]">Title</label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Video title" />
      </div>
      <div>
        <label className="mb-1 block text-xs text-[var(--text-2)]">YouTube URL</label>
        <Input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !loading && handleImport()}
          placeholder="https://www.youtube.com/watch?v=..."
        />
      </div>
      <Button variant="brand" size="lg" className="w-full" onClick={handleImport} disabled={!url || loading}>
        {loading ? 'Importing…' : 'Import Video'}
      </Button>
    </div>
  );
}
