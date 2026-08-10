// Shared upload-file validation. Keyed off file extension as well as MIME type,
// because browsers/OS frequently report an empty or unexpected `file.type`
// (e.g. `.m4a` → '', `.webm` → 'video/webm'), which would otherwise skip the
// size check entirely and let an oversized file slip through without a warning.

const ALLOWED_EXTS = ['pdf', 'mp3', 'mp4', 'wav', 'm4a', 'webm'];

// `accept` attribute string for file inputs, derived from the canonical list.
export const ACCEPTED_UPLOAD = ALLOWED_EXTS.map(e => `.${e}`).join(',');

export const PDF_MAX_BYTES = 40 * 1024 * 1024;
export const AUDIO_MAX_BYTES = 200 * 1024 * 1024;

export function isPdfFile(file: File): boolean {
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
}

export function isAudioUpload(file: File): boolean {
  const name = file.name.toLowerCase();
  return file.type.startsWith('audio/') || file.type === 'video/mp4' || /\.(mp3|wav|m4a|webm|mp4)$/.test(name);
}

const MIME_BY_EXT: Record<string, string> = {
  pdf: 'application/pdf',
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  m4a: 'audio/mp4',
  webm: 'audio/webm',
  mp4: 'video/mp4',
};

// Falls back to an extension-derived MIME type when the browser reports none.
export function resolveMimeType(file: File): string {
  if (file.type) return file.type;
  const ext = file.name.toLowerCase().split('.').pop() ?? '';
  return MIME_BY_EXT[ext] ?? 'application/octet-stream';
}

// Returns an error message if the file is invalid, or null if it passes.
export function validateUploadFile(file: File): string | null {
  const ext = file.name.toLowerCase().split('.').pop() ?? '';
  if (!ALLOWED_EXTS.includes(ext)) {
    return `Unsupported file type. Allowed: PDF, MP3, MP4, WAV, M4A, WEBM.`;
  }
  const mb = Math.round(file.size / 1024 / 1024);
  if (isPdfFile(file) && file.size > PDF_MAX_BYTES) {
    return `PDF is too large (${mb}MB). Maximum allowed size is 40MB.`;
  }
  if (isAudioUpload(file) && file.size > AUDIO_MAX_BYTES) {
    return `Audio file is too large (${mb}MB). Maximum allowed size is 200MB.`;
  }
  return null;
}
