'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import NoteHeader from '@/components/library/NoteHeader';
import NoteEditor from '@/components/library/NoteEditor';
import NoteAskBar from '@/components/library/NoteAskBar';
import FlashcardsTab from '@/components/library/FlashcardsTab';
import QuizTab from '@/components/library/QuizTab';
import PodcastTab from '@/components/library/PodcastTab';
import WeakTopicsTab from '@/components/library/WeakTopicsTab';
import DocumentStatusState from '@/components/library/DocumentStatusState';
import TutorPanel from '@/components/library/TutorPanel';
import DeleteConfirmModal from '@/components/library/DeleteConfirmModal';
import SlidingTabs from '@/components/ui/SlidingTabs';

// Module-level: survives component unmount so the library page can trigger a save
// before switching notes (before DocumentDetail even starts unmounting).
let _pendingNoteSave: (() => Promise<void>) | null = null;
export function flushPendingNoteSave(): Promise<void> {
  const fn = _pendingNoteSave;
  _pendingNoteSave = null;
  return fn ? fn() : Promise.resolve();
}
// Tracks edited-but-not-yet-saved content keyed by documentId
const _unsavedContent: Record<string, string> = {};

import { AnimatePresence, motion } from 'framer-motion';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Highlight from '@tiptap/extension-highlight';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import { convertNoteToHTML, NOTE_CONTENT_CLASS } from '@/lib/notes/noteHtml';
import {
  documentsApi,
  notesApi,
  flashcardsApi,
  quizzesApi,
  Document,
  Note,
  Flashcard,
  Quiz,
} from '@/lib/api/documents';
import { invalidatePrefix } from '@/lib/api';
import { analytics } from '@/lib/analytics';
import { tasksApi } from '@/lib/api/tasks';
import { docTagsApi } from '@/lib/api/documents';
import { weakTopicsApi, WeakTopic } from '@/lib/api/studyPlan';
import { podcastsApi, Podcast } from '@/lib/api/podcasts';
import { ScrollText, BookOpen, Layers, Heart, Mic, Target } from 'lucide-react';

type Tab = 'notes' | 'flashcards' | 'quiz' | 'podcast' | 'weak-topics' | 'transcript';

interface Props {
  id: string;
  onBack?: () => void;
  embedded?: boolean;
  availableTags?: { id: string; name: string; color: string | null }[];
}

export default function DocumentDetail({ id, onBack, embedded, availableTags }: Props) {
  const [doc, setDoc] = useState<Document | null>(null);
  const [note, setNote] = useState<Note | null>(null);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [tab, setTab] = useState<Tab>('notes');
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved' | ''>('');
  const [allDocTags, setAllDocTags] = useState<{ id: string; name: string; color: string | null }[]>(availableTags ?? []);
  const [docWeakTopics, setDocWeakTopics] = useState<WeakTopic[]>([]);
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [showGeneratePodcast, setShowGeneratePodcast] = useState(false);
  const [showTutorPanel, setShowTutorPanel] = useState(false);
  const [tutorPanelWidth, setTutorPanelWidth] = useState(380);
  const [isMobile, setIsMobile] = useState(false);
  const [tutorSessionId, setTutorSessionId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editableTitle, setEditableTitle] = useState('');
  const [, forceTabUpdate] = useState(0);
  const [simplifyLoading, setSimplifyLoading] = useState(false);
  const [simplifyOptions, setSimplifyOptions] = useState<{ label: string; text: string }[] | null>(null);
  const [pendingTutorMessage, setPendingTutorMessage] = useState<string | null>(null);
  const [pendingTutorReveal, setPendingTutorReveal] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const titleDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasTouchedRef = useRef(false);
  const isSettingContent = useRef(false);
  const pendingContent = useRef<{ noteId: string; html: string } | null>(null);
  const noteRef = useRef(note);
  const simplifyRangeRef = useRef<{ from: number; to: number } | null>(null);
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragStartWidth = useRef(380);
  const hasParentTagsRef = useRef(availableTags !== undefined);

  useEffect(() => { noteRef.current = note; }, [note]);
  useEffect(() => { if (availableTags) setAllDocTags(availableTags); }, [availableTags]);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const isAudioDoc = doc ? ['audio', 'recording', 'video_url'].includes(doc.type) : false;
  const tabs: Tab[] = ['notes', 'flashcards', 'quiz', 'podcast', 'weak-topics', ...(isAudioDoc ? ['transcript' as Tab] : [])];

  const fetchAll = useCallback(async () => {
    invalidatePrefix(`/documents/${id}`);
    const { data: docData } = await documentsApi.getById(id);
    if (!docData) return;
    setDoc(docData);
    setEditableTitle(prev => prev || docData.title);
    if (docData.status === 'complete') {
      const [noteRes, flashRes] = await Promise.all([
        notesApi.getByDocument(id),
        flashcardsApi.getByDocument(id),
      ]);
      if (noteRes.data) {
        const unsaved = _unsavedContent[id];
        setNote(unsaved ? { ...noteRes.data, content: unsaved } : noteRes.data);
      }
      if (flashRes.data) setFlashcards(flashRes.data);
    }
  }, [id]);

  const loadSideData = useCallback(async () => {
    const [tasksRes, weakRes, podcastsRes, quizRes] = await Promise.all([
      tasksApi.getAll({ documentId: id }),
      weakTopicsApi.getAll({ documentId: id }),
      podcastsApi.getByDocument(id),
      quizzesApi.getByDocument(id),
    ]);
    if (tasksRes.data) {} // kept for side effects
    if (weakRes.data) setDocWeakTopics(weakRes.data);
    if (podcastsRes.data) setPodcasts(podcastsRes.data);
    if (quizRes.data) setQuiz(quizRes.data);
    if (!hasParentTagsRef.current) {
      const tagsRes = await docTagsApi.getAll();
      if (tagsRes.data) setAllDocTags(tagsRes.data);
    }
  }, [id]);

  useEffect(() => {
    fetchAll().finally(() => { setLoading(false); forceTabUpdate(n => n + 1); });
  }, [fetchAll]);

  useEffect(() => { loadSideData(); }, [loadSideData]);

  // Poll podcasts while generating
  useEffect(() => {
    if (tab !== 'podcast') return;
    const hasGenerating = podcasts.some(p => p.status === 'generating');
    if (!hasGenerating) return;
    const interval = setInterval(async () => {
      const { data } = await podcastsApi.getByDocument(id);
      if (data) setPodcasts(data);
    }, 4000);
    return () => clearInterval(interval);
  }, [tab, podcasts, id]);

  // Poll while processing
  useEffect(() => {
    if (!doc || doc.status !== 'processing') return;
    const interval = setInterval(fetchAll, 3000);
    return () => clearInterval(interval);
  }, [doc, fetchAll]);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: 'Your notes will appear here…' }),
      Highlight.configure({ multicolor: true }),
      TextStyle,
      Color,
    ],
    content: note ? convertNoteToHTML(note.content) : '',
    editorProps: {
      attributes: {
        class: `${NOTE_CONTENT_CLASS} min-h-[400px]`,
      },
    },
    onUpdate: ({ editor }) => {
      const currentNote = noteRef.current;
      if (!currentNote) return;
      if (isSettingContent.current) return;
      const html = editor.getHTML();
      if (!hasTouchedRef.current) {
        hasTouchedRef.current = true;
        window.dispatchEvent(new CustomEvent('library:doc-touched', { detail: { documentId: id } }));
      }
      _unsavedContent[id] = html;
      pendingContent.current = { noteId: currentNote.id, html };
      _pendingNoteSave = () => notesApi.update(currentNote.id, html).then(() => {
        pendingContent.current = null;
        _pendingNoteSave = null;
        delete _unsavedContent[id];
      });
      setSaveStatus('unsaved');
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(async () => {
        _pendingNoteSave = null;
        await notesApi.update(currentNote.id, html);
        pendingContent.current = null;
        delete _unsavedContent[id];
        hasTouchedRef.current = false;
        setDoc(prev => prev ? { ...prev, updatedAt: new Date().toISOString() } : prev);
        window.dispatchEvent(new CustomEvent('library:refetch'));
        analytics.noteEdited(id);
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus(''), 2000);
      }, 30000);
    },
    onSelectionUpdate: ({ editor }) => {
      if (editor.state.selection.empty && simplifyRangeRef.current) {
        setSimplifyOptions(null);
        simplifyRangeRef.current = null;
      }
    },
  });

  useEffect(() => {
    if (editor && note && !editor.getText()) {
      isSettingContent.current = true;
      editor.commands.setContent(convertNoteToHTML(note.content));
      setTimeout(() => {
        isSettingContent.current = false;
        editor.commands.focus('start');
      }, 100);
    }
  }, [editor, note]);

  useEffect(() => {
    if (tab === 'notes' && editor) {
      setTimeout(() => editor.commands.focus(), 0);
    }
  }, [tab, editor]);

  async function flushSave() {
    if (!pendingContent.current) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const { noteId, html } = pendingContent.current;
    pendingContent.current = null;
    setSaveStatus('saving');
    await notesApi.update(noteId, html);
    delete _unsavedContent[id];
    setDoc(prev => prev ? { ...prev, updatedAt: new Date().toISOString() } : prev);
    window.dispatchEvent(new CustomEvent('library:refetch'));
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus(''), 2000);
  }

  useEffect(() => {
    if (tab !== 'notes') flushSave();
  }, [tab]);

  useEffect(() => {
    return () => {
      if (pendingContent.current) {
        const { noteId, html } = pendingContent.current;
        notesApi.update(noteId, html).then(() => { delete _unsavedContent[id]; });
      }
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (!pendingContent.current) return;
      const { noteId, html } = pendingContent.current;
      navigator.sendBeacon(`/api/notes/${noteId}`, JSON.stringify({ content: html }));
      e.preventDefault();
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, []);

  function handleResizeMouseDown(e: React.MouseEvent) {
    isDragging.current = true;
    dragStartX.current = e.clientX;
    dragStartWidth.current = tutorPanelWidth;
    const onMove = (ev: MouseEvent) => {
      if (!isDragging.current) return;
      const delta = dragStartX.current - ev.clientX;
      setTutorPanelWidth(Math.max(280, Math.min(700, dragStartWidth.current + delta)));
    };
    const onUp = () => {
      isDragging.current = false;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }

  async function handleSimplify() {
    if (!editor) return;
    const { from, to } = editor.state.selection;
    if (from === to) return;
    const selectedText = editor.state.doc.textBetween(from, to, ' ');
    simplifyRangeRef.current = { from, to };
    setSimplifyOptions(null);
    setSimplifyLoading(true);
    try {
      const { data } = await notesApi.simplify(selectedText);
      if (data?.options) setSimplifyOptions(data.options);
    } catch { /* ignore */ }
    finally { setSimplifyLoading(false); }
  }

  function handleCloseTutorPanel() {
    setShowTutorPanel(false);
  }

  function applySimplify(text: string) {
    if (!editor || !simplifyRangeRef.current) return;
    const { from, to } = simplifyRangeRef.current;
    editor.chain().focus().insertContentAt({ from, to }, text).run();
    setSimplifyOptions(null);
    simplifyRangeRef.current = null;
  }

  if (loading) return <LoadingSpinner size="lg" />;
  if (!doc) return <div className="text-[var(--text-2)] py-10 text-center">Note not found.</div>;

  return (
    <>
      <div className="flex h-full" style={{ backgroundColor: 'var(--bg-page)' }}>
        <div className={`flex-1 min-w-0 overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:hidden [scrollbar-width:none] ${embedded ? 'px-6 py-4' : 'max-w-4xl mx-auto py-2 w-full'}`}>

          <NoteHeader
            doc={doc}
            id={id}
            embedded={embedded}
            editableTitle={editableTitle}
            onTitleChange={val => {
              setEditableTitle(val);
              setDoc(prev => prev ? { ...prev, title: val } : prev);
            }}
            titleDebounceRef={titleDebounceRef}
            onBack={onBack}
            onShowTutorPanel={() => { if (showTutorPanel) { handleCloseTutorPanel(); } else { setShowTutorPanel(true); } }}
            showNote={!!note}
            allDocTags={allDocTags}
            setAllDocTags={setAllDocTags}
            onRefetch={fetchAll}
            onLoadSideData={loadSideData}
            onDeleteConfirm={() => setShowDeleteConfirm(true)}
          />

          <DeleteConfirmModal
            open={showDeleteConfirm}
            title="Delete this note?"
            description="All notes, flashcards, and quizzes will be permanently deleted. This cannot be undone."
            deleting={deleting}
            onClose={() => setShowDeleteConfirm(false)}
            onConfirm={async () => {
              setDeleting(true);
              await documentsApi.delete(id);
              onBack?.();
            }}
          />

          <DocumentStatusState
            status={doc.status}
            errorMessage={doc.errorMessage}
            onDelete={() => setShowDeleteConfirm(true)}
          />

          {doc.status === 'complete' && (
            <>
              <div className="mb-6">
                <SlidingTabs
                  tabs={tabs.map(t => ({
                    value: t,
                    label: t === 'podcast' ? 'Podcast' : t === 'weak-topics' ? 'Weak Topics' : t === 'transcript' ? 'Transcript' : t.charAt(0).toUpperCase() + t.slice(1),
                    icon: t === 'notes' ? <BookOpen size={13} /> : t === 'flashcards' ? <Layers size={13} /> : t === 'quiz' ? <Heart size={13} /> : t === 'podcast' ? <Mic size={13} /> : t === 'weak-topics' ? <Target size={13} /> : t === 'transcript' ? <ScrollText size={13} /> : undefined,
                  }))}
                  active={tab}
                  onChange={(t) => {
                    setTab(t);
                    if (t === 'flashcards' && flashcards.length > 0) {
                      analytics.flashcardsViewed(id, flashcards.length);
                    }
                  }}
                />
              </div>

              {tab === 'notes' && (
                <>
                  <NoteEditor
                    editor={editor}
                    saveStatus={saveStatus}
                    onSimplify={handleSimplify}
                    simplifyLoading={simplifyLoading}
                    simplifyOptions={simplifyOptions}
                    onApplySimplify={applySimplify}
                    onClearSimplify={() => { setSimplifyOptions(null); simplifyRangeRef.current = null; }}
                  />
                  {/* Spacer so the last lines of the note aren't hidden behind the ask bar */}
                  <div className="h-20" />
                  {/* Ask bar — must be after note content so sticky bottom works correctly */}
                  <AnimatePresence>
                    {!showTutorPanel && (
                      <NoteAskBar
                        key="note-ask-bar"
                        embedded={embedded}
                        hasSession={!!tutorSessionId}
                        onSend={(text, reveal) => {
                          setPendingTutorMessage(text);
                          setPendingTutorReveal(reveal);
                          setShowTutorPanel(true);
                        }}
                        onOpenPanel={() => setShowTutorPanel(true)}
                      />
                    )}
                  </AnimatePresence>
                </>
              )}

              {tab === 'flashcards' && (
                <FlashcardsTab
                  flashcards={flashcards}
                  onGenerate={async () => {
                    const { data } = await flashcardsApi.generate(id);
                    if (data) { setFlashcards(data); analytics.flashcardsGenerated(id); }
                  }}
                />
              )}

              {tab === 'quiz' && (
                <QuizTab
                  doc={doc}
                  quiz={quiz}
                  onGenerate={async (types) => {
                    const { data } = await quizzesApi.generate(id, types);
                    if (data) { setQuiz(data); analytics.quizGenerated(id); }
                  }}
                />
              )}

              {tab === 'podcast' && (
                <PodcastTab
                  documentId={id}
                  podcasts={podcasts}
                  setPodcasts={setPodcasts}
                  showModal={showGeneratePodcast}
                  setShowModal={setShowGeneratePodcast}
                />
              )}

              {tab === 'transcript' && (
                <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--bg-page)' }}>
                  {doc?.transcript ? (
                    <p className="text-sm text-[var(--text-1)] whitespace-pre-wrap leading-relaxed">{doc.transcript}</p>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
                      <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(34,197,94,0.12)' }}>
                        <ScrollText size={24} style={{ color: '#22C55E' }} />
                      </div>
                      <div>
                        <p className="text-[var(--text-1)] font-semibold">No transcript available</p>
                        <p className="text-[var(--text-2)] text-sm mt-1">Transcripts are generated automatically from audio and video uploads</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {tab === 'weak-topics' && (
                <WeakTopicsTab
                  topics={docWeakTopics}
                  onResolved={updated => setDocWeakTopics(prev => prev.map(t => t.id === updated.id ? updated : t))}
                />
              )}
            </>
          )}
        </div>

        {/* Tutor Panel */}
        <AnimatePresence>
          {showTutorPanel && note && (
            isMobile ? (
              <>
                <motion.div
                  className="fixed inset-0 z-40"
                  style={{ backgroundColor: 'rgba(0,0,0,0.35)' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  onClick={handleCloseTutorPanel}
                />
                <motion.div
                  className="fixed top-0 right-0 h-full z-50 flex flex-col shadow-2xl w-full"
                  style={{ backgroundColor: 'var(--bg-page)', borderLeft: '1px solid var(--border)' }}
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                >
                  <TutorPanel noteId={note.id} sessionId={tutorSessionId} onSessionCreated={setTutorSessionId} onClose={handleCloseTutorPanel} initialMessage={pendingTutorMessage ?? undefined} initialReveal={pendingTutorReveal} onInitialMessageConsumed={() => { setPendingTutorMessage(null); setPendingTutorReveal(false); }} />
                </motion.div>
              </>
            ) : (
              <>
                <motion.div
                  onMouseDown={handleResizeMouseDown}
                  className="w-2 shrink-0 cursor-col-resize flex items-center justify-center"
                  style={{ backgroundColor: 'transparent' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <div className="w-px h-full transition-colors" style={{ backgroundColor: 'var(--border)' }} />
                </motion.div>
                <motion.div
                  style={{ minWidth: 280, maxWidth: 700, flexShrink: 0 }}
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: tutorPanelWidth, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                >
                  <TutorPanel noteId={note.id} sessionId={tutorSessionId} onSessionCreated={setTutorSessionId} onClose={handleCloseTutorPanel} initialMessage={pendingTutorMessage ?? undefined} initialReveal={pendingTutorReveal} onInitialMessageConsumed={() => { setPendingTutorMessage(null); setPendingTutorReveal(false); }} />
                </motion.div>
              </>
            )
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
