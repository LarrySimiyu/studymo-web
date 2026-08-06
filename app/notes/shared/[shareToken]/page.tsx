'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Highlight from '@tiptap/extension-highlight';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import { Note } from '@/lib/api/documents';
import { convertNoteToHTML, NOTE_CONTENT_CLASS } from '@/lib/notes/noteHtml';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

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
    immediatelyRender: false,
    extensions: [StarterKit, Highlight.configure({ multicolor: true }), TextStyle, Color],
    content: note ? convertNoteToHTML(note.content) : '',
    editable: false,
    editorProps: {
      attributes: { class: NOTE_CONTENT_CLASS },
    },
  });

  useEffect(() => {
    if (editor && note) {
      editor.commands.setContent(convertNoteToHTML(note.content));
    }
  }, [editor, note]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-page)' }}>
      {/* Nav */}
      <div className="border-b px-6 py-4 flex items-center justify-between" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}>
        <span className="text-lg font-bold" style={{ color: 'var(--text-1)' }}>Studymo</span>
        <Link
          href="/sign-up"
          className="px-4 py-1.5 rounded-lg text-sm font-medium text-white hover:opacity-90 transition-opacity"
          style={{ backgroundColor: 'var(--brand)' }}
        >
          Sign up free
        </Link>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: 'var(--brand)' }} />
          </div>
        ) : notFound ? (
          <div className="text-center py-20">
            <p style={{ color: 'var(--text-2)' }}>This note doesn&apos;t exist or is no longer shared.</p>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-1)' }}>
              {note?.document?.title ?? 'Shared Notes'}
            </h1>
            <p className="text-xs mb-6" style={{ color: 'var(--text-3)' }}>
              Shared via Studymo · {note && new Date(note.createdAt).toLocaleDateString()}
            </p>

            <div className="rounded-xl p-6 mb-10" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <EditorContent editor={editor} />
            </div>

            {/* CTA */}
            <div
              className="rounded-xl p-6 text-center"
              style={{ backgroundColor: 'var(--brand-subtle)', border: '1px solid var(--brand-border)' }}
            >
              <p className="font-semibold mb-1" style={{ color: 'var(--text-1)' }}>Want to create your own AI notes?</p>
              <p className="text-sm mb-4" style={{ color: 'var(--text-2)' }}>Upload PDFs, videos, or recordings and get instant study notes.</p>
              <Link
                href="/sign-up"
                className="inline-block px-6 py-2.5 rounded-lg font-medium text-white hover:opacity-90 transition-opacity"
                style={{ backgroundColor: 'var(--brand)' }}
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
