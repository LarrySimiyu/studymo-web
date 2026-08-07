'use client';

import { useState } from 'react';
import { PenLine } from 'lucide-react';
import { notesApi } from '@/lib/api/documents';
import { analytics } from '@/lib/analytics';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import type { UploadFormProps } from './uploadTypes';

type Props = Pick<UploadFormProps, 'onSuccess' | 'onError'>;

export default function BlankNoteForm({ onSuccess, onError }: Props) {
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    setLoading(true);
    const { data, error } = await notesApi.createBlank(title.trim() || undefined);
    setLoading(false);
    if (error || !data) { onError(error ?? 'Failed to create note'); return; }
    analytics.uploadCompleted('blank');
    onSuccess(data.documentId);
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-xs text-[var(--text-2)]">Title</label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !loading && handleCreate()}
          autoFocus
          placeholder="Untitled Note"
        />
      </div>
      <div
        className="rounded-xl p-6 text-center"
        style={{ backgroundColor: 'var(--bg-page)', border: '2px dashed var(--border-md)' }}
      >
        <PenLine size={26} className="mx-auto mb-2" style={{ color: 'var(--text-3)' }} />
        <p className="text-body-sm text-[var(--text-1)]">Start with an empty note</p>
        <p className="mt-1 text-xs text-[var(--text-2)]">Write freely — no upload needed</p>
      </div>
      <Button variant="brand" size="lg" className="w-full" onClick={handleCreate} disabled={loading}>
        {loading ? 'Creating…' : 'Create Note'}
      </Button>
    </div>
  );
}
