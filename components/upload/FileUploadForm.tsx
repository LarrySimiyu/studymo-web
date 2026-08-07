'use client';

import { useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { uploadDocumentFile } from '@/lib/upload/uploadDocument';
import { validateUploadFile, ACCEPTED_UPLOAD } from '@/lib/upload/fileValidation';
import UploadProgress from './UploadProgress';
import type { UploadFormProps } from './uploadTypes';

export default function FileUploadForm({ loading, onStart, onSuccess, onError }: UploadFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [dragging, setDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    setFile(f);
    setTitle(prev => prev || f.name.replace(/\.[^.]+$/, ''));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  async function handleUpload() {
    if (!file) return;
    const validationError = validateUploadFile(file);
    if (validationError) { onError(validationError); return; }

    onStart();
    setUploadProgress(0);

    const { docId, error } = await uploadDocumentFile(file, {
      mimeType: file.type,
      title: title || file.name,
      onProgress: setUploadProgress,
    });
    if (error || !docId) { onError(error ?? 'Upload failed'); return; }

    onSuccess(docId);
  }

  return (
    <div className="space-y-4">
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className="cursor-pointer rounded-xl p-8 text-center transition-colors"
        style={{
          border: `2px dashed ${dragging ? 'var(--brand)' : 'var(--border-md)'}`,
          backgroundColor: dragging ? 'var(--brand-subtle)' : 'var(--bg-page)',
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_UPLOAD}
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
        <Upload size={26} className="mx-auto mb-2" style={{ color: 'var(--text-3)' }} />
        {file ? (
          <p className="text-body-sm font-medium text-[var(--text-1)]">{file.name}</p>
        ) : (
          <>
            <p className="text-body-sm text-[var(--text-1)]">Drag and drop a PDF, audio, or video file</p>
            <p className="mt-1 text-xs text-[var(--text-2)]">or click to browse</p>
          </>
        )}
      </div>
      {file && (
        <p className="px-1 text-xs" style={{ color: 'var(--text-3)' }}>
          Size: {Math.round(file.size / 1024 / 1024)}MB
        </p>
      )}
      <div>
        <label className="mb-1 block text-xs text-[var(--text-2)]">Title</label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Note title" />
      </div>
      {loading && <UploadProgress progress={uploadProgress} color="var(--brand)" />}
      <Button variant="brand" size="lg" className="w-full" onClick={handleUpload} disabled={!file || loading}>
        {loading ? 'Uploading…' : 'Upload'}
      </Button>
    </div>
  );
}
