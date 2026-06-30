'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Note } from '@/lib/api/documents';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4001';

function convertNoteToHTML(content: string): string {
  try {
    const notes = JSON.parse(content);
    let html = '';
    if (notes.summary) html += `<h2>Summary</h2><p>${notes.summary}</p>`;
    if (notes.sections) {
      for (const s of notes.sections) {
        html += `<h2>${s.heading}</h2>`;
        for (const p of (s.content as string).split(/\n\n+/).filter(Boolean)) {
          html += `<p>${p.replace(/\n/g, '<br/>')}</p>`;
        }
      }
    }
    if (notes.keyTerms?.length) {
      html += '<h2>Key Terms</h2>';
      for (const kt of notes.keyTerms) {
        html += `<p><strong>${kt.term}</strong>: ${kt.definition}</p>`;
      }
    }
    if (notes.keyTakeaways?.length) {
      html += '<h2>Key Takeaways</h2><ul>';
      for (const kt of notes.keyTakeaways) html += `<li>${kt}</li>`;
      html += '</ul>';
    }
    return html;
  } catch {
    return content;
  }
}

export default function SharedNotePage() {
  const { shareToken } = useParams<{ shareToken: string }>();
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/notes/shared/${shareToken}`)
      .then((r) => {
        if (!r.ok) { setNotFound(true); return null; }
        return r.json();
      })
      .then((data) => { if (data) setNote(data as Note); })
      .finally(() => setLoading(false));
  }, [shareToken]);

  const editor = useEditor({
    extensions: [StarterKit],
    content: note ? convertNoteToHTML(note.content) : '',
    editable: false,
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none focus:outline-none text-gray-200',
      },
    },
  });

  useEffect(() => {
    if (editor && note) {
      editor.commands.setContent(convertNoteToHTML(note.content));
    }
  }, [editor, note]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#111111' }}>
      {/* Nav */}
      <div className="border-b px-6 py-4 flex items-center justify-between" style={{ borderColor: '#2A2A2A', backgroundColor: '#1A1A1A' }}>
        <span className="text-lg font-bold text-white">Studymo</span>
        <Link
          href="/sign-up"
          className="px-4 py-1.5 rounded-lg text-sm font-medium text-white hover:opacity-90 transition-opacity"
          style={{ backgroundColor: '#9747FF' }}
        >
          Sign up free
        </Link>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: '#9747FF' }} />
          </div>
        ) : notFound ? (
          <div className="text-center py-20">
            <p className="text-gray-400">This note doesn&apos;t exist or is no longer shared.</p>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-white mb-2">
              {note?.document?.title ?? 'Shared Notes'}
            </h1>
            <p className="text-xs text-gray-500 mb-6">
              Shared via Studymo · {note && new Date(note.createdAt).toLocaleDateString()}
            </p>

            <div className="rounded-xl p-6 mb-10" style={{ backgroundColor: '#1A1A1A', border: '1px solid #2A2A2A' }}>
              <EditorContent editor={editor} />
            </div>

            {/* CTA */}
            <div
              className="rounded-xl p-6 text-center"
              style={{ backgroundColor: '#9747FF15', border: '1px solid #9747FF40' }}
            >
              <p className="text-white font-semibold mb-1">Want to create your own AI notes?</p>
              <p className="text-gray-400 text-sm mb-4">Upload PDFs, videos, or recordings and get instant study notes.</p>
              <Link
                href="/sign-up"
                className="inline-block px-6 py-2.5 rounded-lg font-medium text-white hover:opacity-90 transition-opacity"
                style={{ backgroundColor: '#9747FF' }}
              >
                Get started free
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
