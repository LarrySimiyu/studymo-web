'use client';

import { useEffect, useState } from 'react';
import { documentsApi } from '@/lib/api/documents';
import { useAuth } from '@/hooks/useAuth';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { TYPE_META, type UploadType, type UploadFormProps } from './uploadTypes';
import { useUploadFlow } from './useUploadFlow';
import ProcessingOverlay from './ProcessingOverlay';
import BlankNoteForm from './BlankNoteForm';
import FileUploadForm from './FileUploadForm';
import RecordForm from './RecordForm';
import VideoForm from './VideoForm';
import WebpageForm from './WebpageForm';

export type { UploadType };

interface Props {
  type: UploadType;
  onClose: () => void;
  onSuccess: (documentId?: string) => void;
}

const FORMS: Record<Exclude<UploadType, 'blank'>, React.ComponentType<UploadFormProps>> = {
  file: FileUploadForm,
  record: RecordForm,
  video: VideoForm,
  webpage: WebpageForm,
};

export default function UploadDialog({ type, onClose, onSuccess }: Props) {
  const [checking, setChecking] = useState(true);
  const { title, icon: Icon, color, bg } = TYPE_META[type];
  const { subscriptionStatus, loading: authLoading } = useAuth();
  const flow = useUploadFlow(type, onSuccess);

  useEffect(() => {
    if (authLoading) return;
    if (subscriptionStatus?.hasAccess) { setChecking(false); return; }
    documentsApi.getCount()
      .then(({ data }) => {
        if (data && data.count >= 1) {
          onClose();
          window.dispatchEvent(new CustomEvent('app:show-paywall', { detail: { trigger: 'upload_limit' } }));
        } else {
          setChecking(false);
        }
      })
      .catch(() => setChecking(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, subscriptionStatus]);

  const Form = type === 'blank' ? null : FORMS[type];

  return (
    <Dialog open onOpenChange={o => { if (!o && !flow.isOverlay) onClose(); }}>
      <DialogContent size="lg" showClose={!checking && !flow.isOverlay}>
        {checking ? (
          <div className="flex items-center justify-center py-12">
            <div
              className="h-6 w-6 animate-spin rounded-full border-2 border-transparent"
              style={{ borderTopColor: 'var(--brand)' }}
            />
          </div>
        ) : flow.isOverlay ? (
          <ProcessingOverlay
            state={flow.uploadState as 'processing' | 'failed'}
            errorMessage={flow.failedMessage}
            onRetry={flow.handleRetry}
            onClose={onClose}
          />
        ) : (
          <>
            <DialogHeader className="mb-5 flex-row items-center gap-3">
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                style={{ backgroundColor: bg }}
              >
                <Icon size={15} style={{ color }} />
              </span>
              <DialogTitle>{title}</DialogTitle>
            </DialogHeader>

            {flow.error && (
              <div
                className="mb-4 rounded-lg p-3 text-body-sm"
                style={{ backgroundColor: 'var(--danger-subtle)', color: 'var(--danger-ink)' }}
              >
                {flow.error}
              </div>
            )}

            {type === 'blank' ? (
              <BlankNoteForm onSuccess={onSuccess} onError={flow.handleUploadError} />
            ) : Form ? (
              <Form
                loading={flow.uploadState === 'uploading'}
                onStart={flow.handleUploadStart}
                onSuccess={flow.handleUploadSuccess}
                onError={flow.handleUploadError}
              />
            ) : null}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
