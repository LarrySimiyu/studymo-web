'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
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
import { useStudyTimer } from '@/context/StudyTimerContext';
import { noteTagsApi, NoteTag } from '@/lib/api/organization';
import { docTagsApi } from '@/lib/api/documents';
import { weakTopicsApi, WeakTopic } from '@/lib/api/studyPlan';
import { podcastsApi, Podcast } from '@/lib/api/podcasts';
import GeneratePodcastModal from '@/components/podcast/GeneratePodcastModal';
import PodcastPlayer from '@/components/podcast/PodcastPlayer';
import { tutorApi } from '@/lib/api/tutor';

type Tab = 'notes' | 'flashcards' | 'quiz' | 'podcast';

interface QuizQuestion {
  type: 'multiple_choice' | 'short_answer';
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
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

function GeneratePrompt({ icon, label, description, onGenerate }: {
  icon: string; label: string; description: string; onGenerate: () => Promise<void>;
}) {
  const [loading, setLoading] = useState(false);
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl" style={{ backgroundColor: '#9747FF20' }}>
        {icon}
      </div>
      <div>
        <p className="text-white font-medium">{label}</p>
        <p className="text-gray-500 text-sm mt-1 max-w-xs">{description}</p>
      </div>
      <button
        onClick={async () => { setLoading(true); await onGenerate(); setLoading(false); }}
        disabled={loading}
        className="px-5 py-2.5 rounded-xl text-sm font-medium text-white hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center gap-2"
        style={{ backgroundColor: '#9747FF' }}
      >
        {loading && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
        {loading ? 'Generating…' : label}
      </button>
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
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl" style={{ backgroundColor: '#9747FF20' }}>❓</div>
      <div>
        <p className="text-white font-medium">Generate Quiz</p>
        <p className="text-gray-500 text-sm mt-1 max-w-xs">Select question types then generate a short quiz to test your understanding.</p>
      </div>
      <div className="flex gap-2">
        {allTypes.map(({ value, label }) => (
          <button key={value} onClick={() => toggleType(value)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-all"
            style={{
              backgroundColor: types.includes(value) ? '#9747FF20' : 'transparent',
              borderColor: types.includes(value) ? '#9747FF' : '#333',
              color: types.includes(value) ? '#fff' : '#666',
            }}>
            {label}
          </button>
        ))}
      </div>
      <button
        onClick={async () => { if (!types.length) return; setLoading(true); await onGenerate(types); setLoading(false); }}
        disabled={loading || !types.length}
        className="px-5 py-2.5 rounded-xl text-sm font-medium text-white hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center gap-2"
        style={{ backgroundColor: '#9747FF' }}>
        {loading && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
        {loading ? 'Generating…' : 'Generate Quiz'}
      </button>
    </div>
  );
}

export default function DocumentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [doc, setDoc] = useState<Document | null>(null);
  const [note, setNote] = useState<Note | null>(null);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [tab, setTab] = useState<Tab>('notes');
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | ''>('');
  const [shareUrl, setShareUrl] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [docTasks, setDocTasks] = useState<Task[]>([]);
  const [noteTags, setNoteTags] = useState<{ id: string; name: string; color: string }[]>([]);
  const [allNoteTags, setAllNoteTags] = useState<NoteTag[]>([]);
  const [allDocTags, setAllDocTags] = useState<{ id: string; name: string; color: string | null }[]>([]);
  const [docWeakTopics, setDocWeakTopics] = useState<WeakTopic[]>([]);
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [showGeneratePodcast, setShowGeneratePodcast] = useState(false);
  const [showNoteTagDropdown, setShowNoteTagDropdown] = useState(false);
  const [showDocTagDropdown, setShowDocTagDropdown] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSettingContent = useRef(false);
  const { startSession, status: timerStatus, isCollapsed, toggleCollapsed } = useStudyTimer();

  const fetchAll = useCallback(async () => {
    const { data: docData } = await documentsApi.getById(id);
    if (!docData) return;
    setDoc(docData);
    if (docData.status === 'complete') {
      const [noteRes, flashRes] = await Promise.all([
        notesApi.getByDocument(id),
        flashcardsApi.getByDocument(id),
      ]);
      if (noteRes.data) setNote(noteRes.data);
      if (flashRes.data) setFlashcards(flashRes.data);
    }
  }, [id]);

  const loadSideData = useCallback(async () => {
    const [tasksRes, , allNoteTagsRes, allDocTagsRes, weakRes, podcastsRes] = await Promise.all([
      tasksApi.getAll({ documentId: id }),
      note ? noteTagsApi.getAll() : Promise.resolve({ data: null }),
      noteTagsApi.getAll(),
      docTagsApi.getAll(),
      weakTopicsApi.getAll({ documentId: id }),
      podcastsApi.getByDocument(id),
    ]);
    if (tasksRes.data) setDocTasks(tasksRes.data);
    if (allNoteTagsRes.data) setAllNoteTags(allNoteTagsRes.data);
    if (allDocTagsRes.data) setAllDocTags(allDocTagsRes.data);
    if (weakRes.data) setDocWeakTopics(weakRes.data.filter((t: WeakTopic) => !t.resolved));
    if (podcastsRes.data) setPodcasts(podcastsRes.data);
  }, [id, note]);

  useEffect(() => {
    fetchAll().finally(() => setLoading(false));
  }, [fetchAll]);

  useEffect(() => {
    loadSideData();
  }, [loadSideData]);

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
    ],
    content: note ? convertNoteToHTML(note.content) : '',
    editorProps: {
      attributes: {
        class: 'prose prose-invert prose-headings:text-white prose-h2:text-lg prose-h2:font-semibold prose-h2:mt-6 prose-h2:mb-2 prose-p:text-gray-300 prose-p:leading-relaxed prose-strong:text-white prose-li:text-gray-300 prose-ul:my-2 max-w-none focus:outline-none min-h-[400px]',
      },
    },
    onUpdate: ({ editor }) => {
      if (!note) return;
      if (isSettingContent.current) return;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      setSaveStatus('saving');
      debounceRef.current = setTimeout(async () => {
        await notesApi.update(note.id, editor.getHTML());
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus(''), 2000);
      }, 1000);
    },
  });

  // Update editor content when note loads
  useEffect(() => {
    if (editor && note && !editor.getText()) {
      isSettingContent.current = true;
      editor.commands.setContent(convertNoteToHTML(note.content));
      setTimeout(() => { isSettingContent.current = false; }, 100);
    }
    if (note?.tags) {
      setNoteTags(note.tags.map(t => t.tag));
    }
  }, [editor, note]);

  async function handleShare() {
    if (!note) return;
    const { data } = await notesApi.share(note.id);
    if (data) {
      setShareUrl(data.shareUrl);
      setShowShareModal(true);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: '#9747FF' }} />
      </div>
    );
  }

  if (!doc) return <div className="text-gray-400 py-10 text-center">Document not found.</div>;

  return (
    <div className="max-w-4xl mx-auto py-2">
      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <button onClick={() => router.push('/dashboard/library')} className="text-gray-500 hover:text-white transition-colors mt-0.5">
          ← Back
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-white truncate">{doc.title}</h1>
          {doc.status === 'processing' && (
            <div className="flex items-center gap-2 mt-1 text-yellow-400 text-sm">
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-yellow-400" />
              Generating your notes…
            </div>
          )}
          {doc.status === 'failed' && (
            <p className="text-red-400 text-sm mt-1">Processing failed. Please try uploading again.</p>
          )}
        </div>
        {docTasks.filter(t => !t.completed).length > 0 && (
          <button
            onClick={async () => {
              const activeTasks = docTasks.filter(t => !t.completed);
              if (timerStatus !== 'idle') {
                if (isCollapsed) toggleCollapsed();
                return;
              }
              await startSession('timeblock', activeTasks.map(t => t.id));
              if (isCollapsed) toggleCollapsed();
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#9747FF]/30 text-[#9747FF] text-sm hover:bg-[#9747FF]/10 transition-all flex-shrink-0"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
            {timerStatus === 'idle' ? 'Study Tasks' : 'View Timer'}
          </button>
        )}
        {note && (
          <button
            onClick={async () => {
              const { data } = await tutorApi.createSession({ noteIds: [note.id], mode: 'tutor' });
              if (data) router.push(`/dashboard/tutor?session=${data.id}`);
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#9747FF]/30 text-[#9747FF] text-sm hover:bg-[#9747FF]/10 transition-all flex-shrink-0"
          >
            🎓 Study with Tutor
          </button>
        )}
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="p-2 rounded-xl border border-white/10 text-white/30 hover:text-red-400 hover:border-red-400/30 transition-all flex-shrink-0"
          title="Delete document"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
          </svg>
        </button>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-[#1A1A1A] border border-white/10 rounded-2xl w-full max-w-sm p-6">
            <div className="flex flex-col items-center text-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl" style={{ backgroundColor: '#EF444420' }}>🗑</div>
              <div>
                <p className="text-white font-semibold">Delete this document?</p>
                <p className="text-white/40 text-sm mt-1">All notes, flashcards, and quizzes will be permanently deleted. This cannot be undone.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(false)} disabled={deleting}
                className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/60 text-sm hover:bg-white/5 disabled:opacity-40 transition-colors">
                Cancel
              </button>
              <button
                onClick={async () => {
                  setDeleting(true);
                  await documentsApi.delete(id);
                  router.push('/dashboard/library');
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

      {doc.status !== 'complete' ? null : (
        <>
          {/* Document tags */}
          {doc.tags && doc.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {doc.tags.map(dt => (
                <span key={dt.tagId} className="text-xs px-2 py-1 rounded-full flex items-center gap-1"
                  style={{ backgroundColor: (dt.tag.color ?? '#9747FF') + '25', color: dt.tag.color ?? '#9747FF' }}>
                  {dt.tag.name}
                </span>
              ))}
              <div className="relative">
                <button onClick={() => setShowDocTagDropdown(v => !v)}
                  className="text-xs px-2 py-1 rounded-full border border-white/10 text-white/40 hover:text-white/60 transition-colors">
                  + Add Tag
                </button>
                {showDocTagDropdown && allDocTags.length > 0 && (
                  <div className="absolute left-0 top-full mt-1 z-20 bg-[#2A2A2A] border border-white/10 rounded-xl shadow-xl min-w-[160px] overflow-hidden">
                    {allDocTags.map(t => (
                      <button key={t.id} className="w-full text-left px-3 py-2 text-sm text-white/70 hover:bg-white/5 flex items-center gap-2"
                        onClick={async () => {
                          const { documentsApi: dApi } = await import('@/lib/api/documents');
                          await dApi.addTag(id, t.id);
                          setShowDocTagDropdown(false);
                          fetchAll();
                        }}>
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: t.color ?? '#9747FF' }} />
                        {t.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-1 mb-6 p-1 rounded-lg w-fit" style={{ backgroundColor: '#111' }}>
            {(['notes', 'flashcards', 'quiz', 'podcast'] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={async () => {
                  setTab(t);
                  if (t === 'quiz' && !quiz) {
                    const { data } = await quizzesApi.getByDocument(id);
                    if (data) setQuiz(data);
                  }
                }}
                className="px-4 py-1.5 rounded-md text-sm font-medium transition-colors capitalize"
                style={tab === t ? { backgroundColor: '#9747FF', color: '#fff' } : { color: '#888' }}
              >
                {t === 'podcast' ? 'Podcast' : t}
              </button>
            ))}
          </div>

          {/* Notes Tab */}
          {tab === 'notes' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <p className="text-xs text-gray-500">
                  {saveStatus === 'saving' ? 'Saving…' : saveStatus === 'saved' ? '✓ Saved' : ''}
                </p>
                <div className="flex items-center gap-2">
                  {/* Note tags */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {noteTags.map(tag => (
                      <span key={tag.id} className="text-xs px-2 py-0.5 rounded-full flex items-center gap-1 cursor-pointer hover:opacity-80"
                        style={{ backgroundColor: tag.color + '25', color: tag.color }}
                        onClick={async () => {
                          if (!note) return;
                          await noteTagsApi.unassign(tag.id, note.id);
                          setNoteTags(prev => prev.filter(t => t.id !== tag.id));
                        }}>
                        {tag.name} ×
                      </span>
                    ))}
                    <div className="relative">
                      <button onClick={() => setShowNoteTagDropdown(v => !v)}
                        className="text-xs px-2 py-0.5 rounded-full border border-white/10 text-white/40 hover:text-white/60">
                        + Tag
                      </button>
                      {showNoteTagDropdown && allNoteTags.length > 0 && (
                        <div className="absolute right-0 top-full mt-1 z-20 bg-[#2A2A2A] border border-white/10 rounded-xl shadow-xl min-w-[160px] overflow-hidden">
                          {allNoteTags.filter(t => !noteTags.find(nt => nt.id === t.id)).map(t => (
                            <button key={t.id} className="w-full text-left px-3 py-2 text-sm text-white/70 hover:bg-white/5 flex items-center gap-2"
                              onClick={async () => {
                                if (!note) return;
                                await noteTagsApi.assign(t.id, note.id);
                                setNoteTags(prev => [...prev, t]);
                                setShowNoteTagDropdown(false);
                              }}>
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: t.color }} />
                              {t.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={handleShare}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-white hover:opacity-80 transition-opacity"
                    style={{ backgroundColor: '#2A2A2A', border: '1px solid #333' }}
                  >
                    Share
                  </button>
                </div>
              </div>
              <div className="rounded-xl p-6" style={{ backgroundColor: '#1A1A1A', border: '1px solid #2A2A2A' }}>
                <EditorContent editor={editor} />
              </div>

              {/* Weak Topics for this document */}
              {docWeakTopics.length > 0 && (
                <div className="mt-6 rounded-xl p-4" style={{ backgroundColor: '#1A1A1A', border: '1px solid #2A2A2A' }}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                      ⚠️ Topics to Review
                      <span className="px-1.5 py-0.5 rounded text-xs" style={{ backgroundColor: '#EF444420', color: '#EF4444' }}>
                        {docWeakTopics.length}
                      </span>
                    </h3>
                    <a href="/dashboard/weak-topics" className="text-xs text-purple-400 hover:text-purple-300">View all</a>
                  </div>
                  <div className="space-y-1.5">
                    {docWeakTopics.slice(0, 5).map(wt => (
                      <div key={wt.id} className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ backgroundColor: '#111111', border: '1px solid #2A2A2A' }}>
                        <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: '#EF4444' }} />
                        <span className="text-sm text-gray-300 flex-1 truncate">{wt.topic}</span>
                        <span className="text-xs text-gray-600 shrink-0">missed {wt.missedCount}×</span>
                      </div>
                    ))}
                    {docWeakTopics.length > 5 && (
                      <p className="text-xs text-gray-600 px-3">+{docWeakTopics.length - 5} more topics</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Flashcards Tab */}
          {tab === 'flashcards' && (
            <div>
              {flashcards.length === 0 ? (
                <GeneratePrompt
                  icon="🗂"
                  label="Generate Flashcards"
                  description="Create a set of flashcards from your notes to help you memorize key concepts."
                  onGenerate={async () => {
                    const { data } = await flashcardsApi.generate(id);
                    if (data) setFlashcards(data);
                  }}
                />
              ) : (
                <div className="flex flex-col items-center gap-6">
                  <p className="text-sm text-gray-500">{flashcards.length} Flashcards · Space to flip · ← → to navigate</p>
                  <div className="w-full max-w-lg" style={{ height: 280, perspective: 1000 }}>
                    <div
                      className="relative w-full h-full cursor-pointer"
                      style={{
                        transformStyle: 'preserve-3d',
                        transition: 'transform 0.5s',
                        transform: cardFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                      }}
                      onClick={() => setCardFlipped((f) => !f)}
                    >
                      <div
                        className="absolute inset-0 flex items-center justify-center p-8 rounded-2xl"
                        style={{ backfaceVisibility: 'hidden', backgroundColor: '#1A1A1A', border: '1px solid #2A2A2A' }}
                      >
                        <p className="text-center text-white text-lg font-medium">{flashcards[cardIndex]?.front}</p>
                      </div>
                      <div
                        className="absolute inset-0 flex items-center justify-center p-8 rounded-2xl"
                        style={{
                          backfaceVisibility: 'hidden',
                          transform: 'rotateY(180deg)',
                          backgroundColor: '#1A1A1A',
                          border: '1px solid #9747FF',
                        }}
                      >
                        <p className="text-center text-gray-200 text-base">{flashcards[cardIndex]?.back}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => { setCardIndex((i) => Math.max(i - 1, 0)); setCardFlipped(false); }}
                      disabled={cardIndex === 0}
                      className="px-4 py-2 rounded-lg text-sm text-gray-300 disabled:opacity-30 hover:bg-white/5 transition-colors"
                    >
                      ← Prev
                    </button>
                    <span className="text-sm text-gray-500">{cardIndex + 1} / {flashcards.length}</span>
                    <button
                      onClick={() => { setCardIndex((i) => Math.min(i + 1, flashcards.length - 1)); setCardFlipped(false); }}
                      disabled={cardIndex === flashcards.length - 1}
                      className="px-4 py-2 rounded-lg text-sm text-gray-300 disabled:opacity-30 hover:bg-white/5 transition-colors"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Quiz Tab */}
          {tab === 'quiz' && (
            <div>
              {!quiz || questions.length === 0 ? (
                <QuizGeneratePrompt
                  onGenerate={async (types) => {
                    const { data } = await quizzesApi.generate(id, types);
                    if (data) setQuiz(data);
                  }}
                />
              ) : !quizStarted ? (
                <div className="flex flex-col items-center gap-4 py-10">
                  <p className="text-white font-medium">{questions.length} questions</p>
                  <button
                    onClick={() => setQuizStarted(true)}
                    className="px-6 py-2.5 rounded-lg font-medium text-white hover:opacity-90"
                    style={{ backgroundColor: '#9747FF' }}
                  >
                    Start Quiz
                  </button>
                </div>
              ) : quizDone ? (
                <div className="flex flex-col items-center gap-4 py-10 text-center">
                  <p className="text-5xl font-bold text-white">{score} / {questions.length}</p>
                  <p className="text-2xl font-semibold" style={{ color: '#9747FF' }}>
                    {Math.round((score / questions.length) * 100)}%
                  </p>
                  <p className="text-gray-400">
                    {score / questions.length >= 0.8 ? 'Great job! 🎉' : 'Keep studying! 📚'}
                  </p>
                  <button
                    onClick={resetQuiz}
                    className="px-6 py-2.5 rounded-lg font-medium text-white hover:opacity-90 mt-2"
                    style={{ backgroundColor: '#9747FF' }}
                  >
                    Retake Quiz
                  </button>
                </div>
              ) : (
                <div className="max-w-xl mx-auto">
                  <p className="text-sm text-gray-500 mb-4">Question {qIndex + 1} of {questions.length}</p>
                  <div className="rounded-xl p-6 mb-4" style={{ backgroundColor: '#1A1A1A', border: '1px solid #2A2A2A' }}>
                    <p className="text-white font-medium mb-4">{questions[qIndex].question}</p>

                    {questions[qIndex].type === 'multiple_choice' && (
                      <div className="space-y-2">
                        {questions[qIndex].options?.map((opt) => {
                          const isCorrect = opt === questions[qIndex].correctAnswer;
                          const isSelected = selected === opt;
                          let bg = '#2A2A2A';
                          let border = '#333';
                          if (selected) {
                            if (isCorrect) { bg = '#16a34a20'; border = '#16a34a'; }
                            else if (isSelected) { bg = '#dc262620'; border = '#dc2626'; }
                          }
                          return (
                            <button
                              key={opt}
                              onClick={() => handleAnswer(opt)}
                              className="w-full text-left px-4 py-3 rounded-lg text-sm text-gray-200 transition-colors"
                              style={{ backgroundColor: bg, border: `1px solid ${border}` }}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {questions[qIndex].type === 'short_answer' && (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={shortAnswer}
                          onChange={(e) => setShortAnswer(e.target.value)}
                          disabled={selected !== null}
                          className="w-full px-3 py-2 rounded-lg text-white text-sm focus:outline-none"
                          style={{ backgroundColor: '#2A2A2A', border: '1px solid #333' }}
                          placeholder="Your answer…"
                        />
                        {selected === null && (
                          <button
                            onClick={() => handleAnswer(shortAnswer)}
                            disabled={!shortAnswer}
                            className="px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-40"
                            style={{ backgroundColor: '#9747FF' }}
                          >
                            Submit Answer
                          </button>
                        )}
                      </div>
                    )}

                    {selected !== null && (
                      <div className="mt-4 p-3 rounded-lg text-sm" style={{ backgroundColor: '#9747FF15', border: '1px solid #9747FF40' }}>
                        <p className="text-purple-300 font-medium mb-1">
                          {questions[qIndex].type === 'short_answer'
                            ? `Expected: ${questions[qIndex].correctAnswer}`
                            : selected === questions[qIndex].correctAnswer ? '✓ Correct!' : '✗ Incorrect'}
                        </p>
                        <p className="text-gray-300">{questions[qIndex].explanation}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {selected === null && (
                      <button
                        onClick={skipQuestion}
                        className="px-4 py-2.5 rounded-lg text-sm text-gray-500 hover:text-gray-300 border border-white/10 hover:border-white/20 transition-colors"
                      >
                        Skip
                      </button>
                    )}
                    {selected !== null && (
                      <button
                        onClick={nextQuestion}
                        className="flex-1 py-2.5 rounded-lg font-medium text-white hover:opacity-90"
                        style={{ backgroundColor: '#9747FF' }}
                      >
                        {qIndex + 1 >= questions.length ? 'See Results' : 'Next Question →'}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          {/* Podcast Tab */}
          {tab === 'podcast' && (
            <div>
              <div className="flex items-center justify-between mb-5">
                <p className="text-white/50 text-sm">{podcasts.length} podcast{podcasts.length !== 1 ? 's' : ''} generated</p>
                <button
                  onClick={() => setShowGeneratePodcast(true)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-white hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: '#9747FF' }}
                >
                  Generate Podcast
                </button>
              </div>

              {podcasts.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-5xl mb-4">🎙️</div>
                  <p className="text-white/50 mb-2">No podcasts yet</p>
                  <p className="text-white/30 text-sm mb-6">Turn your notes into an audio lecture you can listen to anywhere</p>
                  <button
                    onClick={() => setShowGeneratePodcast(true)}
                    className="px-5 py-2.5 rounded-xl text-sm font-medium text-white hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: '#9747FF' }}
                  >
                    Generate Podcast
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {podcasts.map(podcast => (
                    <div key={podcast.id} className="rounded-xl p-4" style={{ backgroundColor: '#1A1A1A', border: '1px solid #2A2A2A' }}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium text-sm truncate">{podcast.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {podcast.lengthMins} min · {podcast.voice} · {new Date(podcast.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <button
                          onClick={async () => {
                            await podcastsApi.delete(podcast.id);
                            setPodcasts(prev => prev.filter(p => p.id !== podcast.id));
                          }}
                          className="ml-3 text-gray-600 hover:text-red-400 transition-colors shrink-0"
                          title="Delete podcast"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
                          </svg>
                        </button>
                      </div>

                      {podcast.status === 'generating' && (
                        <div className="flex items-center gap-2 text-sm text-yellow-400 py-2">
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-yellow-400" />
                          Generating audio… this takes a minute
                        </div>
                      )}
                      {podcast.status === 'failed' && (
                        <p className="text-sm text-red-400 py-2">Generation failed. Please try again.</p>
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
          style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
          onClick={() => setShowShareModal(false)}
        >
          <div
            className="w-full max-w-md p-6 rounded-2xl"
            style={{ backgroundColor: '#1A1A1A', border: '1px solid #2A2A2A' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-white font-semibold mb-4">Share Notes</h3>
            <div className="flex gap-2">
              <input
                readOnly
                value={shareUrl}
                className="flex-1 px-3 py-2 rounded-lg text-sm text-gray-300 focus:outline-none"
                style={{ backgroundColor: '#2A2A2A', border: '1px solid #333' }}
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
  );
}
