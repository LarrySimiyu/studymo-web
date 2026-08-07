'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { getPendingUpload, clearPendingUpload } from '@/lib/upload/pendingUpload';
import { uploadDocumentFile } from '@/lib/upload/uploadDocument';
import { resolveMimeType } from '@/lib/upload/fileValidation';
import { watchDocumentStatus } from '@/lib/api/documents';
import { invalidatePrefix } from '@/lib/api';
import { analytics } from '@/lib/analytics';

type Phase = 'idle' | 'uploading' | 'processing' | 'complete' | 'failed';

// Picks up a file attached on the logged-out landing page (stashed in IndexedDB
// through the sign-up → onboarding redirects) and uploads it once the user is
// authenticated in the dashboard.
export default function PendingUploadHandler() {
  const router = useRouter();
  const startedRef = useRef(false);
  const stopWatchRef = useRef<(() => void) | null>(null);
  const [phase, setPhase] = useState<Phase>('idle');
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    (async () => {
      const pending = await getPendingUpload();
      if (!pending) return;
      // Clear immediately so a refresh mid-upload can't trigger a duplicate.
      await clearPendingUpload();

      setFileName(pending.file.name);
      setPhase('uploading');
      analytics.uploadStarted('file');

      const { docId, error: uploadError } = await uploadDocumentFile(pending.file, {
        mimeType: resolveMimeType(pending.file),
        title: pending.title || pending.file.name,
      });
      if (uploadError || !docId) {
        setError(uploadError ?? 'Upload failed');
        setPhase('failed');
        return;
      }

      setPhase('processing');
      stopWatchRef.current = watchDocumentStatus(docId, (status, errorMessage) => {
        invalidatePrefix(`/documents/${docId}`);
        if (status === 'complete') {
          analytics.uploadCompleted('file');
          setPhase('complete');
          router.push('/dashboard/library');
        } else {
          analytics.uploadFailed('file');
          setError(errorMessage ?? 'Processing failed');
          setPhase('failed');
        }
      });
    })();

    return () => { stopWatchRef.current?.(); };
  }, [router]);

  if (phase === 'idle' || phase === 'complete') return null;

  const busy = phase === 'uploading' || phase === 'processing';

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <div
        className="flex items-start gap-3 rounded-2xl px-4 py-3 shadow-lg"
        style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
      >
        <span className="mt-0.5 shrink-0">
          {busy && <Loader2 size={18} className="animate-spin" style={{ color: '#FF6500' }} />}
          {phase === 'failed' && <AlertCircle size={18} style={{ color: 'var(--danger-ink)' }} />}
        </span>
        <div className="min-w-0">
          <p className="text-sm font-medium" style={{ color: 'var(--text-1)' }}>
            {phase === 'uploading' && 'Uploading your file…'}
            {phase === 'processing' && 'Processing your file…'}
            {phase === 'failed' && 'Upload failed'}
          </p>
          <p className="text-xs truncate mt-0.5" style={{ color: 'var(--text-3)' }}>
            {phase === 'failed' ? error : fileName}
          </p>
        </div>
        {phase === 'failed' && (
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label="Dismiss"
            onClick={() => setPhase('complete')}
            className="shrink-0"
          >
            <X size={16} />
          </Button>
        )}
      </div>
    </div>
  );
}
