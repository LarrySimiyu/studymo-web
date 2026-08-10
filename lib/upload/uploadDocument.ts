import { documentsApi } from '@/lib/api/documents';

// Uploads a single file to its presigned URL with progress reporting.
export function uploadToPresignedUrl(
  url: string,
  file: Blob,
  mimeType: string,
  onProgress: (pct: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', url);
    xhr.setRequestHeader('Content-Type', mimeType);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error(`Upload failed: ${xhr.status}`));
    };
    xhr.onerror = () => reject(new Error('Upload failed'));
    xhr.send(file);
  });
}

export type UploadDocumentResult =
  | { docId: string; error?: undefined }
  | { docId?: undefined; error: string };

// Full document upload flow: presign → PUT to storage → trigger processing.
// Shared by the dashboard upload dialog and the deferred post-onboarding upload.
export async function uploadDocumentFile(
  file: Blob,
  opts: { mimeType: string; title: string; isRecording?: boolean; onProgress?: (pct: number) => void },
): Promise<UploadDocumentResult> {
  const { mimeType, title, isRecording, onProgress } = opts;

  const { data: presignData, error: presignError } = await documentsApi.presign({
    mimeType,
    title,
    fileSize: file.size,
    isRecording,
  });
  if (presignError || !presignData) return { error: presignError ?? 'Upload failed' };

  try {
    await uploadToPresignedUrl(presignData.uploadUrl, file, mimeType, onProgress ?? (() => {}));
  } catch {
    // The doc row is created by /presign before any bytes exist. If the PUT never
    // lands, that row is orphaned at `processing` pointing at a key that was never
    // written — so clear it rather than leave a ghost in the library.
    await documentsApi.delete(presignData.doc.id).catch(() => {});
    return { error: 'Upload failed — please try again' };
  }

  const { error: processError } = await documentsApi.triggerProcess(presignData.doc.id);
  if (processError) return { error: processError };

  return { docId: presignData.doc.id };
}
