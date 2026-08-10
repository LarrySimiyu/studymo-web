// Client-side PDF page counting via pdfjs (bundled with react-pdf). Dynamically imported so
// pdfjs stays off the initial bundle and never evaluates during SSR — only loads when a user
// actually picks a PDF to upload.
export async function getPdfPageCount(file: Blob): Promise<number> {
  const { pdfjs } = await import('react-pdf');
  if (!pdfjs.GlobalWorkerOptions.workerSrc) {
    // Served from /public, kept in sync by package.json "postinstall". Letting webpack bundle the
    // .mjs worker breaks `next build` (Terser parses it as a non-module: "import.meta cannot be
    // used outside of module code"). Self-hosting also avoids any CDN/CSP dependency at runtime.
    pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
  }
  const data = new Uint8Array(await file.arrayBuffer());
  const doc = await pdfjs.getDocument({ data }).promise;
  const pageCount = doc.numPages;
  await doc.destroy();
  return pageCount;
}
