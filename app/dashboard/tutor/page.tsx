'use client';

import { useState } from 'react';
import { TutorNoteMeta } from '@/lib/api/tutor';
import { useTutorChat } from '@/hooks/useTutorChat';
import TutorInput from '@/components/tutor/TutorInput';
import TutorTopBar from '@/components/tutor/TutorTopBar';
import TutorMessages from '@/components/tutor/TutorMessages';
import TutorBanners from '@/components/tutor/TutorBanners';
import TutorWelcome from '@/components/tutor/TutorWelcome';
import SourcesPanel from '@/components/tutor/SourcesPanel';
import ContextPicker from '@/components/tutor/ContextPicker';
import { TutorMode } from '@/components/tutor/TutorModeDropdown';

export default function TutorPage() {
  const t = useTutorChat();
  const [showContextPicker, setShowContextPicker] = useState(false);

  const contextNotes = t.activeSession?.notes.map((n: TutorNoteMeta) => ({ id: n.id, title: n.document.title })) ?? [];

  return (
    <div className="flex h-full gap-3 overflow-hidden p-3">
      <div
        className="flex flex-1 min-w-0 flex-col overflow-hidden min-h-0 rounded-2xl"
        style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        {!t.activeSession ? (
          <TutorWelcome
            value={t.input}
            onChange={t.setInput}
            onSend={t.startWithMessage}
            creating={t.creating}
          />
        ) : (
          <>
            <TutorTopBar
              title={t.activeSession.title}
              onRename={t.saveTitle}
              mode={t.activeSession.mode as TutorMode}
              onModeChange={t.changeMode}
            />

            <TutorMessages messages={t.messages} isStreaming={t.isStreaming} bottomRef={t.bottomRef} />

            <div className="px-4 pb-4 shrink-0 relative">
              <TutorBanners
                offerSaved={t.offerSaved}
                resolvedTopics={t.resolvedTopics}
                onClearResolved={() => t.setResolvedTopics([])}
                noteOffer={t.noteOffer}
                offerSaving={t.offerSaving}
                onAcceptOffer={t.acceptOffer}
                onDismissOffer={() => t.setNoteOffer(null)}
              />

              <ContextPicker
                open={showContextPicker}
                loadedNotes={contextNotes}
                availableNotes={t.availableNotes.map(n => ({ id: n.id, title: n.document.title }))}
                noteSearch={t.noteSearch}
                onNoteSearchChange={t.setNoteSearch}
                onRemove={t.removeNote}
                onAdd={t.addNote}
                maxNotes={t.maxNotes}
                onClose={() => setShowContextPicker(false)}
              />

              <TutorInput
                value={t.input}
                onChange={t.setInput}
                onSend={t.sendMessage}
                disabled={t.isStreaming}
                placeholder={t.isStreaming ? 'Thinking…' : 'Message your tutor…'}
                contextNotes={contextNotes}
                onAddContext={() => setShowContextPicker(v => !v)}
                contextPillClassName="lg:hidden"
                onRemoveContext={t.removeNote}
                revealAnswer={t.revealAnswer}
                onToggleReveal={() => t.setRevealAnswer(v => !v)}
                inputRef={t.inputRef}
              />
            </div>
          </>
        )}
      </div>

      {t.activeSession && (
        <aside className="hidden lg:flex w-[280px] xl:w-[320px] shrink-0 flex-col gap-3 overflow-y-auto">
          <SourcesPanel
            className="shrink-0 max-h-[22rem]"
            sources={t.sources}
            attachedIds={t.activeSession.noteIds}
            onToggle={t.toggleNote}
            maxNotes={t.maxNotes}
          />
        </aside>
      )}
    </div>
  );
}
