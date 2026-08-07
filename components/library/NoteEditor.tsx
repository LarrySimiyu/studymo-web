'use client';

import { Editor, EditorContent } from '@tiptap/react';

interface Props {
  editor: Editor | null;
  saveStatus: 'saved' | 'saving' | 'unsaved' | '';
}

export default function NoteEditor({ editor, saveStatus }: Props) {
  return (
    <div>
      {saveStatus && (
        <p className="md:hidden text-xs mb-2 text-[var(--text-2)]">
          {saveStatus === 'saving' ? 'Saving…' : saveStatus === 'saved' ? 'Saved' : 'Unsaved changes'}
        </p>
      )}
      <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--bg-page)' }}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
