'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { watchDocumentStatus } from '@/lib/api/documents';
import { invalidatePrefix } from '@/lib/api';
import { analytics } from '@/lib/analytics';
import type { UploadState, UploadType } from './uploadTypes';

/** Owns the upload → processing → complete/failed state machine shared by every
 *  upload type, including the status watch teardown. */
export function useUploadFlow(type: UploadType, onSuccess: (documentId?: string) => void) {
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [error, setError] = useState('');
  const [failedMessage, setFailedMessage] = useState<string | undefined>(undefined);
  const stopWatchRef = useRef<(() => void) | null>(null);

  useEffect(() => () => { stopWatchRef.current?.(); }, []);

  const handleUploadStart = useCallback(() => {
    setError('');
    setUploadState('uploading');
    analytics.uploadStarted(type);
  }, [type]);

  const handleUploadSuccess = useCallback((docId: string) => {
    setUploadState('processing');
    stopWatchRef.current = watchDocumentStatus(docId, (status, errorMessage) => {
      invalidatePrefix(`/documents/${docId}`);
      if (status === 'complete') {
        analytics.uploadCompleted(type);
        onSuccess(docId);
      } else {
        analytics.uploadFailed(type);
        setFailedMessage(errorMessage);
        setUploadState('failed');
      }
    });
  }, [type, onSuccess]);

  const handleUploadError = useCallback((msg: string) => {
    setError(msg);
    setUploadState('idle');
  }, []);

  const handleRetry = useCallback(() => {
    stopWatchRef.current?.();
    stopWatchRef.current = null;
    setUploadState('idle');
    setError('');
    setFailedMessage(undefined);
  }, []);

  return {
    uploadState,
    error,
    failedMessage,
    isOverlay: uploadState === 'processing' || uploadState === 'failed',
    handleUploadStart,
    handleUploadSuccess,
    handleUploadError,
    handleRetry,
  };
}
