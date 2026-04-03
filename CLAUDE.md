# Studymo Web — Claude Instructions

## Project Overview
Studymo is a study/ed-tech SaaS. This is the Next.js 14 App Router frontend.
The backend API lives at `/Users/larrysimiyu/Desktop/coding/studymo-api` — check its CLAUDE.md for endpoint details, schema, and service logic.

## Tech Stack
- **Framework**: Next.js 14 App Router (`'use client'` where needed)
- **Styling**: Tailwind CSS + custom CSS variables
- **Animations**: `framer-motion` — use `AnimatePresence` + `motion.div` for all transitions
- **Icons**: `lucide-react` exclusively
- **UI primitives**: `components/ui/` (custom + shadcn)
- **API layer**: `lib/api/` modules — never call fetch directly in components

## Theme Variables
```
var(--text-1)   — primary text
var(--text-2)   — secondary text
var(--text-3)   — muted/hint text
var(--bg-card)  — card background
var(--bg-input) — input background
var(--bg-hover) — hover state
var(--border)   — border color
var(--brand)    — brand orange #FF6500
```

Accent colors for icons, badges, status:
- Orange `#FF6500` / `rgba(255,101,0,0.12)`
- Green `#22C55E` / `rgba(34,197,94,0.12)`
- Amber `#F59E0B` / `rgba(245,158,11,0.12)`
- Red `#EF4444` / `rgba(239,68,68,0.12)`
- Blue `#3B82F6` / `rgba(59,130,246,0.12)`
- Pink `#EC4899` / `rgba(236,72,153,0.12)`
- Purple `#8B5CF6` / `rgba(139,92,246,0.12)`
- Teal `#14B8A6` / `rgba(20,184,166,0.12)`

## Reusable Components — Check These Before Building Anything New
Duplicate implementations cause visual inconsistency. Always import from here first.

### `components/ui/Button`
Primary action button. Variants: `brand` (orange gradient), `outline`, `ghost`. Sizes: `xs`, `sm`, `default`, `lg`, `icon`.
Use `variant="brand" size="lg"` for primary modal/form actions. Never use a raw `<button>` with a hardcoded background color for a CTA.

### `components/ui/Input`
Styled text input. Use for every form field — never use a raw `<input>` with custom styling.

### `components/ui/SlidingTabs`
Tab bar with an animated sliding underline indicator. Takes `tabs`, `active`, `onChange`. Used in DocumentDetail and anywhere you need tab switching.

### `components/ui/QuestionCard`
Renders a single quiz or exam question. Handles multiple choice, short answer, and true/false display + interaction. Has a `revealAnswer` prop — `false` for exam mode (no feedback), `true` for quiz mode (shows correct/wrong immediately).

### `components/ui/MultipleChoiceOptions`
Option list used inside QuestionCard. Also used standalone in results views.

### `components/ui/ProgressBar`
Linear progress bar. Takes `index` (0-based) and `total`.

### `components/ui/TagDropdown`
Tag selector with color dot display. Handles multi-select and tag creation.

### `components/ui/calendar`
shadcn Calendar extended with `scheduledDates`, `completedDates`, and `compact` props. Use with Radix `Popover` for date pickers in modals.

### `components/flashcards/FlipCard`
Animated flip card with prev/next/restart. Takes `cards`, `index`, `onPrev`, `onNext`, `onRestart`. Used in DocumentDetail and the flashcards page.

### `components/quiz/QuizRunner`
Full quiz-taking UI — question flow, scoring, attempt submission to the API, results screen. Takes `document` and `quiz`. Used in DocumentDetail and the quizzes page.

### `components/upload/UploadDialog`
The single upload modal for all content types. Takes a `type` prop: `'blank' | 'file' | 'record' | 'video'`. Handles the full flow: form input → upload → processing poll → success/failure. Always use this — don't build custom upload forms.

### `components/dashboard/PageHeader`
Page title + optional action button. Use at the top of every dashboard page.

### `components/dashboard/PlanCard`
Study plan card. Also exports `PALETTE`, `getPalette(id)`, `daysColor`, `DayRow`. **Import `PALETTE` and `getPalette` from here whenever you need consistent icon/card colors — never define a local palette array.**

### `components/dashboard/PlanCalendar`
Calendar view for a study plan. Takes `entries: StudyPlanDay[]` and optional `compact` prop.

### `components/dashboard/WeakTopicItem`
Single weak topic row with severity color coding and resolve button. Takes `topic`, `onResolved`, optional `linkToDocument`.

### `components/dashboard/ActivityHeatmap`
GitHub-style activity heatmap with streak stats. Takes optional `streak` data and `recordVisit` flag.

### `components/tasks/TasksPanel`
Full task list with create/edit/complete. Takes optional `onCountChange` and `hideCompleted`. Reuse this anywhere tasks need to appear — don't build a custom task list.

### `components/podcast/GeneratePodcastModal`
Modal to configure and trigger podcast generation (length, voice).

### `components/podcast/PodcastPlayer`
Audio player for a generated podcast MP3.

---

## Features & Where They Live

### Document Library
Users upload PDFs, audio files, YouTube URLs, or create blank notes. Each document goes through async AI processing (notes, flashcards, quiz generated server-side).

- **List view**: `app/dashboard/library/page.tsx` — folder tree on left, document grid on right. Upload triggered via a dropdown that opens `UploadDialog` with the appropriate `type`.
- **Upload modal**: `components/upload/UploadDialog.tsx` — handles all 4 upload types in one component. Polls `GET /documents/:id` until status is `complete` or `failed`.
- **Document detail**: `components/library/DocumentDetail.tsx` — the main viewer. Has 6 tabs (Notes, Flashcards, Quiz, Podcast, Weak Topics, Transcript). Each tab shows an empty state with a generate button if content hasn't been created yet.
- **API**: `lib/api/documents.ts` — `documentsApi`, `notesApi`, `flashcardsApi`, `quizzesApi`

### Notes Editor
Rich text editor inside DocumentDetail's Notes tab. Auto-saves on a 30s debounce. Content is initially AI-generated from the uploaded document then freely editable by the user.

- **Editor**: TipTap inside `components/library/DocumentDetail.tsx` with a floating toolbar for formatting + AI simplify
- **AI Simplify**: select text → click Simplify → Claude returns 3 rephrased versions, click one to replace
- **Share**: generates a public share token — shared notes are readable at `/notes/shared/:token` without auth
- **API**: `lib/api/documents.ts` — `notesApi`

### Flashcards
Flashcard decks generated from document notes. Flip animation, keyboard navigation (arrow keys + space).

- **Deck list**: `app/dashboard/flashcards/page.tsx`
- **Viewer**: `components/flashcards/FlipCard.tsx` — used both on the flashcards page and inside DocumentDetail
- **API**: `lib/api/documents.ts` — `flashcardsApi`

### Quizzes
AI-generated quizzes with multiple choice, short answer, and true/false questions. Attempts are recorded and feed into weak topic tracking.

- **Quiz list**: `app/dashboard/quizzes/page.tsx`
- **Quiz runner**: `components/quiz/QuizRunner.tsx` — used on the quizzes page and inside DocumentDetail. Submits attempt to API on completion.
- **API**: `lib/api/documents.ts` — `quizzesApi`

### Practice Exams
Longer AI-generated exams spanning multiple documents. Three modes: select (overview + start), take (timed, progress saved), results (per-question breakdown with AI feedback on short answers).

- **Exam list + create**: `app/dashboard/practice-exams/page.tsx`
- **Exam taker**: `app/dashboard/practice-exams/[id]/page.tsx` — handles all three modes. Answers are auto-saved to the API every 2s while taking and restored on reload. Short answers graded in parallel via Claude on submit.
- **API**: `lib/api/organization.ts` — `practiceExamsApi`

### Podcasts
Converts document notes into a spoken audio lecture. User picks length (5/10/15 min) and voice. Generated async server-side.

- **Podcast list**: `app/dashboard/podcasts/page.tsx`
- **Generate modal**: `components/podcast/GeneratePodcastModal.tsx`
- **Player**: `components/podcast/PodcastPlayer.tsx`
- **API**: `lib/api/podcasts.ts` — `podcastsApi`

### Study Plans
AI generates a day-by-day study schedule from selected documents and a test date. Users can mark days and topics complete.

- **Plan list**: `app/dashboard/study-plan/page.tsx`
- **Plan detail**: `app/dashboard/study-plan/[id]/page.tsx` — day rows, topic checkboxes, progress bars, calendar view
- **Calendar**: `components/dashboard/PlanCalendar.tsx`
- **API**: `lib/api/studyPlan.ts` — `studyPlansApi`

### Tasks
Simple to-do list with due dates, estimated time, tags, and complete/incomplete toggle.

- **Tasks page**: `app/dashboard/tasks/page.tsx`
- **Task panel** (reusable): `components/tasks/TasksPanel.tsx` — also used on the home dashboard
- **Task item**: `components/tasks/TaskItem.tsx`
- **Create/edit modal**: `components/tasks/TaskModal.tsx`
- **API**: `lib/api/tasks.ts` — `tasksApi`

### Weak Topics
Automatically tracked when a user answers a quiz or practice exam question incorrectly. Grouped by semantic concept (2-4 word topic name). Users can mark topics as resolved.

- **Full list**: `app/dashboard/weak-topics/page.tsx`
- **Per-document**: inside the Weak Topics tab in `components/library/DocumentDetail.tsx`
- **Row component**: `components/dashboard/WeakTopicItem.tsx` — shows severity by missed count (green → amber → red)
- **API**: `lib/api/studyPlan.ts` — `weakTopicsApi`

### AI Tutor
Streaming chat assistant that can reference the user's notes. Also lives as a slide-in panel inside the document viewer.

- **Standalone page**: `app/dashboard/tutor/page.tsx`
- **In-document panel**: `components/library/TutorPanel.tsx` — slides in from the right inside DocumentDetail, resizable by dragging
- **Input + bubbles**: `components/tutor/` — `TutorInput`, `UserBubble`, `ContextPicker`
- **API**: `lib/api/tutor.ts` — `tutorApi`

### Analytics
Overview stats, time by subject, quiz history, study session summaries, and an activity heatmap.

- **Page**: `app/dashboard/analytics/page.tsx`
- **Heatmap**: `components/dashboard/ActivityHeatmap.tsx` — also appears on the home dashboard
- **API**: `lib/api/analytics.ts` — `analyticsApi`, `activityApi`

### Home Dashboard
Aggregates everything in one view — recent notes, quiz stats, weak topics, planning panel, and tasks.

- **Page**: `app/dashboard/page.tsx`
- **Quiz stats**: `components/dashboard/QuizStatsCard.tsx`
- **Planning panel**: `components/dashboard/PlanningPanel.tsx` + `PlanningTasksSection.tsx`
- **Recommended actions**: `components/dashboard/RecommendedSection.tsx`

### Settings & Billing
Profile management and Stripe subscription portal.

- **Profile**: `app/dashboard/settings/page.tsx` — `lib/api/profile.ts`
- **Billing**: `app/dashboard/settings/billing/page.tsx` — `lib/api/billing.ts`

---

## File Structure
```
app/dashboard/          — page routes (one folder per feature)
components/
  ui/                   — shared primitives (Button, Input, SlidingTabs, QuestionCard, etc.)
  dashboard/            — dashboard-wide components (Sidebar, PageHeader, PlanCard, WeakTopicItem, etc.)
  library/              — document viewer (DocumentDetail, TutorPanel)
  upload/               — UploadDialog (all upload flows in one component)
  flashcards/           — FlipCard
  quiz/                 — QuizRunner
  podcast/              — GeneratePodcastModal, PodcastPlayer
  tasks/                — TaskItem, TaskModal, TasksPanel
  tutor/                — chat input/bubbles/context picker
  timer/                — StudyTimerPanel
lib/api/                — one file per API domain
  documents.ts          — documentsApi, notesApi, flashcardsApi, quizzesApi
  studyPlan.ts          — studyPlansApi, weakTopicsApi
  analytics.ts          — analyticsApi, activityApi
  tasks.ts              — tasksApi
  organization.ts       — foldersApi, practiceExamsApi
  podcasts.ts           — podcastsApi
  billing.ts / profile.ts / tutor.ts
hooks/
  useAuth.ts            — Firebase auth state
```

## General Conventions
- All API calls go through `lib/api/` — never call `fetch` directly
- GET responses are cached 5 min — call `invalidatePrefix('/resource')` after mutations if needed
- Use `api.postForm` for file/recording uploads
- Modals: `fixed inset-0 flex items-center justify-center p-4` — no bottom-sheet behavior
- Cancel actions: small text link below the primary button, not an X icon
- Dropdowns that appear inside `overflow-hidden` containers: use `getBoundingClientRect()` + `position: fixed`
- Never hardcode a color palette array locally — import `PALETTE` / `getPalette` from `components/dashboard/PlanCard`
- Prefer editing existing files over creating new ones
- Don't add comments unless logic is non-obvious
