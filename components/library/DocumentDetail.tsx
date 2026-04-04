'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EditorBubbleToolbar from '@/components/library/EditorBubbleToolbar';

// Module-level: survives component unmount so the library page can trigger a save
// before switching notes (before DocumentDetail even starts unmounting).
let _pendingNoteSave: (() => Promise<void>) | null = null;
export function flushPendingNoteSave(): Promise<void> {
  const fn = _pendingNoteSave;
  _pendingNoteSave = null;
  return fn ? fn() : Promise.resolve();
}
// Tracks edited-but-not-yet-saved content keyed by documentId, so remounting
// DocumentDetail can show local content instead of racing against an in-flight save.
const _unsavedContent: Record<string, string> = {};
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Highlight from '@tiptap/extension-highlight';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import { marked } from 'marked';
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
import { tasksApi, Task } from '@/lib/api/tasks';
// import { useStudyTimer } from '@/context/StudyTimerContext';
import { docTagsApi } from '@/lib/api/documents';
import { weakTopicsApi, WeakTopic } from '@/lib/api/studyPlan';
import WeakTopicItem from '@/components/dashboard/WeakTopicItem';
import SlidingTabs from '@/components/ui/SlidingTabs';
import FlipCard from '@/components/flashcards/FlipCard';
import QuizRunner from '@/components/quiz/QuizRunner';
import { podcastsApi, Podcast } from '@/lib/api/podcasts';
import GeneratePodcastModal from '@/components/podcast/GeneratePodcastModal';
import PodcastPlayer from '@/components/podcast/PodcastPlayer';
import TagDropdown from '@/components/ui/TagDropdown';
import TutorPanel from '@/components/library/TutorPanel';
import { Layers, HelpCircle, Mic, Target, ScrollText } from 'lucide-react';
import { Button } from '@/components/ui/Button';

type Tab = 'notes' | 'flashcards' | 'quiz' | 'podcast' | 'weak-topics' | 'transcript';

interface QuizQuestion {
  type: 'multiple_choice' | 'short_answer';
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
}

interface Props {
  id: string;
  onBack?: () => void;
  embedded?: boolean;
  availableTags?: { id: string; name: string; color: string | null }[];
}

function convertNoteToHTML(content: string): string {
  try {
    const notes = JSON.parse(content);
    let md = '';
    if (notes.summary) md += `## Summary\n\n${notes.summary}\n\n`;
    if (notes.sections) {
      for (const s of notes.sections) {
        md += `## ${s.heading}\n\n${s.content}\n\n`;
      }
    }
    if (notes.keyTerms?.length) {
      md += `## Key Terms\n\n`;
      for (const kt of notes.keyTerms) {
        md += `**${kt.term}**: ${kt.definition}\n\n`;
      }
    }
    if (notes.keyTakeaways?.length) {
      md += `## Key Takeaways\n\n`;
      for (const kt of notes.keyTakeaways) md += `- ${kt}\n`;
    }
    return marked(md) as string;
  } catch {
    return marked(content) as string;
  }
}

function GeneratePrompt({ icon: Icon, color, bg, label, description, onGenerate }: {
  icon: React.ElementType; color: string; bg: string; label: string; description: string; onGenerate: () => Promise<void>;
}) {
  const [loading, setLoading] = useState(false);
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
      <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: bg }}>
        <Icon size={24} style={{ color }} />
      </div>
      <div>
        <p className="text-[var(--text-1)] font-semibold">{label}</p>
        <p className="text-[var(--text-2)] text-sm mt-1 max-w-xs">{description}</p>
      </div>
      <Button
        variant="brand"
        size="sm"
        onClick={async () => { setLoading(true); await onGenerate(); setLoading(false); }}
        disabled={loading}
      >
        {loading && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
        {loading ? 'Generating…' : label}
      </Button>
    </div>
  );
}

function QuizGeneratePrompt({ onGenerate }: { onGenerate: (types: string[]) => Promise<void> }) {
  const [loading, setLoading] = useState(false);
  const [types, setTypes] = useState<string[]>(['multiple_choice', 'short_answer']);
  const toggleType = (t: string) =>
    setTypes(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  const allTypes = [
    { value: 'multiple_choice', label: 'Multiple Choice' },
    { value: 'short_answer', label: 'Short Answer' },
    { value: 'true_false', label: 'True / False' },
  ];
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-5 text-center">
      <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(59,130,246,0.12)' }}>
        <HelpCircle size={24} style={{ color: '#3B82F6' }} />
      </div>
      <div>
        <p className="text-[var(--text-1)] font-semibold">Generate Quiz</p>
        <p className="text-[var(--text-2)] text-sm mt-1 max-w-xs">Select question types then generate a short quiz to test your understanding.</p>
      </div>
      <div className="flex gap-2">
        {allTypes.map(({ value, label }) => (
          <button key={value} onClick={() => toggleType(value)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-all"
            style={{
              backgroundColor: types.includes(value) ? 'rgba(255,101,0,0.08)' : 'transparent',
              borderColor: types.includes(value) ? 'var(--brand)' : 'var(--border-md)',
              color: types.includes(value) ? 'var(--brand)' : 'var(--text-2)',
            }}>
            {label}
          </button>
        ))}
      </div>
      <Button
        variant="brand"
        size="sm"
        onClick={async () => { if (!types.length) return; setLoading(true); await onGenerate(types); setLoading(false); }}
        disabled={loading || !types.length}
      >
        {loading && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
        {loading ? 'Generating…' : 'Generate Quiz'}
      </Button>
    </div>
  );
}

export default function DocumentDetail({ id, onBack, embedded, availableTags }: Props) {
  const [doc, setDoc] = useState<Document | null>(null);
  const [note, setNote] = useState<Note | null>(null);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [tab, setTab] = useState<Tab>('notes');
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved' | ''>('');
  const [shareUrl, setShareUrl] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [docTasks, setDocTasks] = useState<Task[]>([]);
  const [allDocTags, setAllDocTags] = useState<{ id: string; name: string; color: string | null }[]>(availableTags ?? []);
  const [docWeakTopics, setDocWeakTopics] = useState<WeakTopic[]>([]);
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [showGeneratePodcast, setShowGeneratePodcast] = useState(false);
  const [showDocTagDropdown, setShowDocTagDropdown] = useState(false);
  const [showCreateTagModal, setShowCreateTagModal] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#9747FF');
  const [showDotsMenu, setShowDotsMenu] = useState(false);
  const dotsMenuRef = useRef<HTMLDivElement>(null);
  const [showTutorPanel, setShowTutorPanel] = useState(false);
  const [tutorPanelWidth, setTutorPanelWidth] = useState(380);
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  const [tutorSessionId, setTutorSessionId] = useState<string | null>(null);
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragStartWidth = useRef(380);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editableTitle, setEditableTitle] = useState('');
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [, forceTabUpdate] = useState(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasTouchedRef = useRef(false);
  const titleDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSettingContent = useRef(false);
  const pendingContent = useRef<{ noteId: string; html: string } | null>(null);
  const noteRef = useRef(note);
  useEffect(() => { noteRef.current = note; }, [note]);
  const hasParentTagsRef = useRef(availableTags !== undefined);
  useEffect(() => {
    if (availableTags) setAllDocTags(availableTags);
  }, [availableTags]);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [bubblePos, setBubblePos] = useState<{ top: number; left: number; bottom: number } | null>(null);
  const [simplifyLoading, setSimplifyLoading] = useState(false);
  const [simplifyOptions, setSimplifyOptions] = useState<string[] | null>(null);
  const simplifyRangeRef = useRef<{ from: number; to: number } | null>(null);
  const isAudioDoc = doc ? ['audio', 'recording', 'video_url'].includes(doc.type) : false;
  const tabs: Tab[] = ['notes', 'flashcards', 'quiz', 'podcast', 'weak-topics', ...(isAudioDoc ? ['transcript' as Tab] : [])];
  // const { startSession, status: timerStatus, isCollapsed, toggleCollapsed } = useStudyTimer();

  const fetchAll = useCallback(async () => {
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
    const [tasksRes, weakRes, podcastsRes] = await Promise.all([
      tasksApi.getAll({ documentId: id }),
      weakTopicsApi.getAll({ documentId: id }),
      podcastsApi.getByDocument(id),
    ]);
    if (tasksRes.data) setDocTasks(tasksRes.data);
    if (weakRes.data) setDocWeakTopics(weakRes.data);
    if (podcastsRes.data) setPodcasts(podcastsRes.data);
    if (!hasParentTagsRef.current) {
      const tagsRes = await docTagsApi.getAll();
      if (tagsRes.data) setAllDocTags(tagsRes.data);
    }
  }, [id]);

  useEffect(() => {
    fetchAll().finally(() => { setLoading(false); forceTabUpdate(n => n + 1); });
  }, [fetchAll]);

  useEffect(() => {
    loadSideData();
  }, [loadSideData]);

  useEffect(() => {
    if (!showDotsMenu) return;
    const h = (e: MouseEvent) => {
      if (dotsMenuRef.current && !dotsMenuRef.current.contains(e.target as Node)) setShowDotsMenu(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [showDotsMenu]);

  // Poll podcasts while any are still generating
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

  // Keyboard shortcuts for flashcards
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (tab !== 'flashcards') return;
      if (e.key === 'ArrowRight') setCardIndex((i) => Math.min(i + 1, flashcards.length - 1));
      if (e.key === 'ArrowLeft') setCardIndex((i) => Math.max(i - 1, 0));
      if (e.key === ' ') { e.preventDefault(); setCardFlipped((f) => !f); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [tab, flashcards.length]);

  // Flashcard state
  const [cardIndex, setCardIndex] = useState(0);
  const [cardFlipped, setCardFlipped] = useState(false);

  // Quiz state
  const [quizStarted, setQuizStarted] = useState(false);
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [shortAnswer, setShortAnswer] = useState('');
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [quizDone, setQuizDone] = useState(false);
  const [score, setScore] = useState(0);

  const questions: QuizQuestion[] = quiz ? (() => {
    try { return JSON.parse(quiz.questions); } catch { return []; }
  })() : [];

  function handleAnswer(answer: string) {
    if (selected !== null) return;
    setSelected(answer);
    setAnswers((prev) => ({ ...prev, [qIndex]: answer }));
  }

  function nextQuestion() {
    if (qIndex + 1 >= questions.length) {
      const correct = questions.filter((q, i) => answers[i] === q.correctAnswer).length;
      setScore(correct);
      setQuizDone(true);
      if (quiz) {
        quizzesApi.submitAttempt(quiz.id, (correct / questions.length) * 100, answers).catch(console.error);
      }
    } else {
      setQIndex((i) => i + 1);
      setSelected(null);
      setShortAnswer('');
    }
  }

  function skipQuestion() {
    if (selected !== null) return;
    if (qIndex + 1 >= questions.length) {
      const correct = questions.filter((q, i) => answers[i] === q.correctAnswer).length;
      setScore(correct);
      setQuizDone(true);
      if (quiz) {
        quizzesApi.submitAttempt(quiz.id, (correct / questions.length) * 100, answers).catch(console.error);
      }
    } else {
      setQIndex((i) => i + 1);
      setSelected(null);
      setShortAnswer('');
    }
  }

  function resetQuiz() {
    setQuizStarted(false);
    setQIndex(0);
    setSelected(null);
    setShortAnswer('');
    setAnswers({});
    setQuizDone(false);
    setScore(0);
  }

  // TipTap editor
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
        class: 'prose prose-headings:text-[var(--text-1)] prose-h2:text-lg prose-h2:font-semibold prose-h2:mt-6 prose-h2:mb-2 prose-p:text-[var(--text-1)] prose-p:leading-relaxed prose-p:my-1 prose-strong:text-[var(--text-1)] prose-li:text-[var(--text-1)] prose-ul:my-2 max-w-none focus:outline-none min-h-[400px]',
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
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus(''), 2000);
      }, 30000);
    },
    onSelectionUpdate: ({ editor }) => {
      const { from, to } = editor.state.selection;
      if (from === to) {
        setBubblePos(null);
        setSimplifyOptions(null);
        simplifyRangeRef.current = null;
        return;
      }
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) { setBubblePos(null); return; }
      const rect = sel.getRangeAt(0).getBoundingClientRect();
      setBubblePos({ top: rect.top + window.scrollY - 48, left: rect.left + window.scrollX, bottom: rect.bottom + window.scrollY });
    },
  });

  // Update editor content when note loads
  useEffect(() => {
    if (editor && note && !editor.getText()) {
      isSettingContent.current = true;
      editor.commands.setContent(convertNoteToHTML(note.content));
      setTimeout(() => { isSettingContent.current = false; }, 100);
    }

  }, [editor, note]);

  // Flush pending save immediately
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

  // Save when tab changes away from notes
  useEffect(() => {
    if (tab !== 'notes') {
      flushSave();
    }
  }, [tab]);

  // Save on unmount (navigating to another note, back, etc.)
  useEffect(() => {
    return () => {
      if (pendingContent.current) {
        const { noteId, html } = pendingContent.current;
        notesApi.update(noteId, html).then(() => { delete _unsavedContent[id]; });
      }
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  // Save on page close / refresh
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

  async function handleShare() {
    if (!note) return;
    const { data } = await notesApi.share(note.id);
    if (data) {
      setShareUrl(data.shareUrl);
      setShowShareModal(true);
    }
  }

  if (loading) {
    return <LoadingSpinner size="lg" />;
  }

  if (!doc) return <div className="text-[var(--text-2)] py-10 text-center">Note not found.</div>;

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

  function applySimplify(option: string) {
    if (!editor || !simplifyRangeRef.current) return;
    const { from, to } = simplifyRangeRef.current;
    editor.chain().focus().insertContentAt({ from, to }, option).run();
    setSimplifyOptions(null);
    simplifyRangeRef.current = null;
    setBubblePos(null);
  }

  return (
    <>
    {editor && (
      <EditorBubbleToolbar
        editor={editor}
        bubblePos={bubblePos}
        onBubblePosChange={setBubblePos}
        onSimplify={handleSimplify}
        simplifyLoading={simplifyLoading}
        simplifyOptions={simplifyOptions}
        onApplySimplify={applySimplify}
        onClearSimplify={() => { setSimplifyOptions(null); simplifyRangeRef.current = null; }}
      />
    )}

    <div className="flex h-full" style={{ backgroundColor: 'var(--bg-page)' }}>
    <div className={`flex-1 min-w-0 overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:hidden [scrollbar-width:none] ${embedded ? 'px-6 py-4' : 'max-w-4xl mx-auto py-2 w-full'}`}>
      {/* Path label + action buttons */}
      <div className="flex items-center gap-2 mb-4">
        {!embedded && (
          <button onClick={() => onBack?.()} className="text-[var(--text-2)] hover:text-[var(--text-1)] transition-colors text-xs">
            ← Back
          </button>
        )}
        <span className="text-xs text-[var(--text-1)] truncate flex-1">{doc.title}</span>
        <div className="flex items-center gap-2 shrink-0">
          {/* Study Tasks timer button — shelved with StudyTimerPanel */}
          {note && (
            <button
              onClick={() => setShowTutorPanel(v => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-opacity hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #FF6500 0%, #FF9A3C 100%)' }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="white" stroke="none">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              AI Tutor
            </button>
          )}
          {/* Three-dot menu */}
          <div className="relative" ref={dotsMenuRef}>
            <button
              onClick={() => setShowDotsMenu(v => !v)}
              className="flex items-center justify-center w-7 h-7 rounded-lg transition-colors hover:bg-[var(--bg-hover)] text-[var(--text-2)]"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                <circle cx="8" cy="3" r="1.2"/><circle cx="8" cy="8" r="1.2"/><circle cx="8" cy="13" r="1.2"/>
              </svg>
            </button>
            {showDotsMenu && (
              <div
                className="absolute right-0 top-full mt-1 z-50 rounded-xl shadow-xl py-1 min-w-[140px]"
                style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
              >
                <button
                  onClick={() => { setShowDotsMenu(false); setShowDeleteConfirm(true); }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-[var(--bg-hover)] transition-colors"
                  style={{ color: 'var(--danger)' }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                  </svg>
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Editable title */}
      <input
        value={editableTitle}
        onChange={e => {
          const val = e.target.value;
          setEditableTitle(val);
          setDoc(prev => prev ? { ...prev, title: val } : prev);
          if (titleDebounceRef.current) clearTimeout(titleDebounceRef.current);
          titleDebounceRef.current = setTimeout(async () => {
            if (val.trim()) {
              await documentsApi.rename(id, val.trim());
              window.dispatchEvent(new CustomEvent('library:refetch'));
            }
          }, 600);
        }}
        placeholder="Untitled"
        className="w-full bg-transparent border-none outline-none text-heading-sm md:text-heading font-semibold text-[var(--text-1)] placeholder-[var(--text-3)] mb-3"
      />

      {/* Tags row */}
      <div className="flex flex-wrap items-center gap-1.5 mb-6">
        {(doc.tags ?? []).map(dt => (
          <span
            key={dt.tagId}
            className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full cursor-pointer group"
            style={{ backgroundColor: (dt.tag.color ?? '#9747FF') + '22', color: dt.tag.color ?? '#9747FF' }}
          >
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: dt.tag.color ?? '#9747FF' }} />
            {dt.tag.name}
            <button
              className="opacity-0 group-hover:opacity-60 hover:!opacity-100 ml-0.5 leading-none"
              onClick={async () => { await documentsApi.removeTag(id, dt.tagId); fetchAll(); }}
            >×</button>
          </span>
        ))}
        <TagDropdown
          tags={allDocTags}
          variant="add-tag"
          selectedIds={new Set((doc.tags ?? []).map(dt => dt.tagId))}
          onChange={async tagId => {
            const isApplied = (doc.tags ?? []).some(dt => dt.tagId === tagId);
            if (isApplied) { await documentsApi.removeTag(id, tagId); } else { await documentsApi.addTag(id, tagId); }
            fetchAll();
          }}
          onManageTags={() => setShowCreateTagModal(true)}
        />
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
          <div className="bg-[var(--bg-card)] border border-black/10 rounded-2xl w-full max-w-sm p-6">
            <div className="flex flex-col items-center text-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl" style={{ backgroundColor: 'var(--danger-subtle)' }}>🗑</div>
              <div>
                <p className="text-[var(--text-1)] font-semibold">Delete this note?</p>
                <p className="text-[var(--text-2)] text-sm mt-1">All notes, flashcards, and quizzes will be permanently deleted. This cannot be undone.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(false)} disabled={deleting}
                className="flex-1 py-2.5 rounded-xl border border-black/10 text-[var(--text-2)] text-sm hover:bg-black/5 disabled:opacity-40 transition-colors">
                Cancel
              </button>
              <button
                onClick={async () => {
                  setDeleting(true);
                  await documentsApi.delete(id);
                  onBack?.();
                }}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl text-white text-sm font-medium disabled:opacity-50 hover:opacity-90 transition-opacity"
                style={{ backgroundColor: '#EF4444' }}
              >
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showCreateTagModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="rounded-2xl w-full max-w-xs p-5 flex flex-col gap-3" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <p className="text-sm font-semibold text-[var(--text-1)]">New tag</p>
            <input
              autoFocus
              value={newTagName}
              onChange={e => setNewTagName(e.target.value)}
              placeholder="Tag name"
              className="w-full px-3 py-2 rounded-lg text-xs outline-none text-[var(--text-1)] placeholder-[var(--text-3)]"
              style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border)' }}
              onKeyDown={async e => {
                if (e.key === 'Escape') { setShowCreateTagModal(false); setNewTagName(''); }
              }}
            />
            <div className="flex items-center gap-2 flex-wrap">
              {['#9747FF','#FF6B6B','#4ECDC4','#45B7D1','#F59E0B','#22C55E','#EC4899','#64748B'].map(c => (
                <button key={c} onClick={() => setNewTagColor(c)}
                  className="w-5 h-5 rounded-full transition-transform hover:scale-110"
                  style={{ backgroundColor: c, outline: newTagColor === c ? `2px solid ${c}` : 'none', outlineOffset: 2 }}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setShowCreateTagModal(false); setNewTagName(''); }}
                className="flex-1 py-2 rounded-lg text-xs text-[var(--text-2)] hover:bg-[var(--bg-hover)] transition-colors">
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!newTagName.trim()) return;
                  const { data } = await docTagsApi.create({ name: newTagName.trim(), color: newTagColor });
                  if (data) { await documentsApi.addTag(id, data.id); fetchAll(); loadSideData(); window.dispatchEvent(new CustomEvent('library:refetch')); }
                  setShowCreateTagModal(false); setNewTagName('');
                }}
                className="flex-1 py-2 rounded-lg text-xs text-white hover:opacity-90 transition-opacity"
                style={{ backgroundColor: '#9747FF' }}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {doc.status !== 'complete' ? null : (
        <>
          {/* Tabs — sliding underline */}
          <div className="mb-6">
            <SlidingTabs
              tabs={tabs.map(t => ({
                value: t,
                label: t === 'podcast' ? 'Podcast' : t === 'weak-topics' ? 'Weak Topics' : t === 'transcript' ? 'Transcript' : t.charAt(0).toUpperCase() + t.slice(1),
              }))}
              active={tab}
              onChange={async (t) => {
                setTab(t);
                setActiveTabIndex(tabs.indexOf(t));
                if (t === 'quiz' && !quiz) {
                  const { data } = await quizzesApi.getByDocument(id);
                  if (data) setQuiz(data);
                }
              }}
            />
          </div>

          {/* Notes Tab */}
          {tab === 'notes' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <p className="text-xs text-[var(--text-2)]">
                  {saveStatus === 'saving' ? 'Saving…' : saveStatus === 'saved' ? '✓ Saved' : saveStatus === 'unsaved' ? 'Unsaved changes' : ''}
                </p>
              </div>
              <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--bg-page)' }}>
                <EditorContent editor={editor} />
              </div>
            </div>
          )}

          {/* Flashcards Tab */}
          {tab === 'flashcards' && (
            <div className="flex flex-col items-center">
              {flashcards.length === 0 ? (
                <GeneratePrompt
                  icon={Layers}
                  color="#FF6500"
                  bg="rgba(255,101,0,0.12)"
                  label="Generate Flashcards"
                  description="Create a set of flashcards from your notes to help you memorize key concepts."
                  onGenerate={async () => {
                    const { data } = await flashcardsApi.generate(id);
                    if (data) setFlashcards(data);
                  }}
                />
              ) : (
                <FlipCard
                  cards={flashcards}
                  index={cardIndex}
                  onPrev={() => setCardIndex(i => Math.max(0, i - 1))}
                  onNext={() => setCardIndex(i => Math.min(flashcards.length - 1, i + 1))}
                  onRestart={() => setCardIndex(0)}
                />
              )}
            </div>
          )}

          {/* Quiz Tab */}
          {tab === 'quiz' && (
            <div>
              {!quiz ? (
                <QuizGeneratePrompt
                  onGenerate={async (types) => {
                    const { data } = await quizzesApi.generate(id, types);
                    if (data) setQuiz(data);
                  }}
                />
              ) : (
                <QuizRunner document={doc} quiz={quiz} />
              )}
            </div>
          )}

          {/* Podcast Tab */}
          {tab === 'podcast' && (
            <div>
              {podcasts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(236,72,153,0.12)' }}>
                    <Mic size={24} style={{ color: '#EC4899' }} />
                  </div>
                  <div>
                    <p className="text-[var(--text-1)] font-semibold">Generate Podcast</p>
                    <p className="text-[var(--text-2)] text-sm mt-1 max-w-xs">Turn your notes into an audio lecture you can listen to anywhere</p>
                  </div>
                  <Button variant="brand" size="sm" onClick={() => setShowGeneratePodcast(true)}>
                    Generate Podcast
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex justify-end mb-3">
                    <button
                      onClick={() => setShowGeneratePodcast(true)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium text-white hover:opacity-90 transition-opacity"
                      style={{ background: 'linear-gradient(135deg, #FF6500, #FF9A3C)' }}
                    >
                      + Generate Podcast
                    </button>
                  </div>
                  {podcasts.map(podcast => (
                    <div
                      key={podcast.id}
                      className="relative rounded-xl p-3 transition-colors"
                      style={{ backgroundColor: 'var(--bg-input)' }}
                    >
                      <div className="flex items-start gap-3 mb-2">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(255,101,0,0.12)' }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FF6500" strokeWidth="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8"/></svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[var(--text-1)] font-semibold text-sm truncate">{podcast.title}</p>
                          <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>
                            {podcast.lengthMins} min · {podcast.voice} · {new Date(podcast.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <button
                          onClick={async () => { await podcastsApi.delete(podcast.id); setPodcasts(prev => prev.filter(p => p.id !== podcast.id)); }}
                          className="text-[var(--text-3)] hover:text-red-400 transition-colors shrink-0 p-1"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" /></svg>
                        </button>
                      </div>
                      {podcast.status === 'generating' && (
                        <div className="flex items-center gap-2 text-xs py-1.5 px-2 rounded-lg" style={{ backgroundColor: 'rgba(245,158,11,0.08)', color: '#F59E0B' }}>
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-[#F59E0B]" />
                          Generating audio… this takes a minute
                        </div>
                      )}
                      {podcast.status === 'failed' && (
                        <p className="text-xs py-1.5 px-2 rounded-lg" style={{ backgroundColor: 'var(--danger-subtle)', color: '#EF4444' }}>Generation failed. Please try again.</p>
                      )}
                      {podcast.status === 'complete' && podcast.audioUrl && (
                        <PodcastPlayer audioUrl={podcast.audioUrl} title={podcast.title} />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {/* Transcript Tab */}
          {tab === 'transcript' && (
            <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--bg-page)' }}>
              {doc?.transcript ? (
                <p className="text-sm text-[var(--text-1)] whitespace-pre-wrap leading-relaxed">
                  {doc.transcript}
                </p>
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

          {/* Weak Topics Tab */}
          {tab === 'weak-topics' && (
            <div>
              {docWeakTopics.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(245,158,11,0.12)' }}>
                    <Target size={24} style={{ color: '#F59E0B' }} />
                  </div>
                  <div>
                    <p className="text-[var(--text-1)] font-semibold">No weak topics yet</p>
                    <p className="text-[var(--text-2)] text-sm mt-1">Take a quiz to identify areas that need review</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {docWeakTopics.map(wt => (
                    <WeakTopicItem
                      key={wt.id}
                      topic={wt}
                      onResolved={updated => setDocWeakTopics(prev => prev.map(t => t.id === updated.id ? updated : t))}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Generate Podcast Modal */}
      {showGeneratePodcast && (
        <GeneratePodcastModal
          documentId={id}
          onClose={() => setShowGeneratePodcast(false)}
          onCreated={async () => {
            setShowGeneratePodcast(false);
            const { data } = await podcastsApi.getByDocument(id);
            if (data) setPodcasts(data);
          }}
        />
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
          onClick={() => setShowShareModal(false)}
        >
          <div
            className="w-full max-w-md p-6 rounded-2xl"
            style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-[var(--text-1)] font-semibold mb-4">Share Notes</h3>
            <div className="flex gap-2">
              <input
                readOnly
                value={shareUrl}
                className="flex-1 px-3 py-2 rounded-lg text-sm text-[var(--text-1)] focus:outline-none"
                style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-md)' }}
              />
              <button
                onClick={() => navigator.clipboard.writeText(shareUrl)}
                className="px-3 py-2 rounded-lg text-sm font-medium text-white hover:opacity-80"
                style={{ backgroundColor: '#9747FF' }}
              >
                Copy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    {/* Tutor Panel — overlay on mobile, side panel on md+ */}
    {showTutorPanel && note && (
      isMobile ? (
        <>
          <div
            className="fixed inset-0 z-40"
            style={{ backgroundColor: 'rgba(0,0,0,0.35)' }}
            onClick={() => setShowTutorPanel(false)}
          />
          <div
            className="fixed top-0 right-0 h-full z-50 flex flex-col shadow-2xl w-full"
            style={{ backgroundColor: 'var(--bg-page)', borderLeft: '1px solid var(--border)' }}
          >
            <TutorPanel
              noteId={note.id}
              sessionId={tutorSessionId}
              onSessionCreated={setTutorSessionId}
              onClose={() => setShowTutorPanel(false)}
            />
          </div>
        </>
      ) : (
        <>
          <div
            onMouseDown={handleResizeMouseDown}
            className="w-2 shrink-0 cursor-col-resize flex items-center justify-center group"
            style={{ backgroundColor: 'transparent' }}
          >
            <div className="w-px h-full transition-colors" style={{ backgroundColor: 'var(--border)' }} />
          </div>
          <div style={{ width: tutorPanelWidth, minWidth: 280, maxWidth: 700, flexShrink: 0 }}>
            <TutorPanel
              noteId={note.id}
              sessionId={tutorSessionId}
              onSessionCreated={setTutorSessionId}
              onClose={() => setShowTutorPanel(false)}
            />
          </div>
        </>
      )
    )}
    </div>
    </>
  );
}
