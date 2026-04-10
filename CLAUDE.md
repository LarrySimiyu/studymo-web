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

## Data Collected

### Onboarding (`app/onboarding/page.tsx` → `POST /profile/sync`)
Collected once after signup. All steps are required except GPA (high school / undergrad only).

**Step 1 — Grade Level** (`gradeLevel`) — single select:
- `high_school` — High School
- `undergrad` — Undergrad
- `grad` — Grad School
- `self_learner` — Self Learner
- `other` — Other
- GPA steps only shown for `high_school` / `undergrad`

**Step 2 — Current GPA** (`gpa`) — float 0.0–4.0, +/− stepper (0.1 increments). High school / undergrad only.

**Step 3 — Goal GPA** (`goalGpa`) — float 0.0–4.0, +/− stepper. High school / undergrad only.

**Step 4 — Subjects** (`subjects`) — multi-select pill chips + free-text custom entry. Saved as colored `Tag` records. Preset options:
- Mathematics, Biology, Chemistry, Physics, History, English / Literature, Computer Science, Economics, Psychology, Law, Medicine / Nursing, Engineering, Coding, Personal Finance, Language Learning, Business, Design, Marketing, Philosophy, Music Theory

**Step 5 — Learning Style** (`learningStyle`) — single select:
- `notes` — Reading notes and summaries
- `listening` — Listening to explanations
- `quizzing` — Being quizzed on material
- `mix` — A mix of everything

**Step 6 — Struggles** (`struggles`) — multi-select array, grouped:
- *Keeping Up*: `falling_behind`, `deadlines`, `balance`
- *Studying*: `where_to_start`, `cramming`, `consistency`, `forgetting`
- *Focus*: `distractions`, `focus_span`
- *Mindset & Wellbeing*: `procrastination`, `burnout`, `test_anxiety`, `overwhelmed`, `sleep`, `accountability`

**Step 7 — Main Goal** (`mainGoal`) — single select:
- `pass_exams` — Pass my upcoming exams
- `improve_grades` — Improve my grades
- `learn_faster` — Learn faster and retain more
- `stay_organized` — Stay organized this semester

---

### Behavioral & Activity Data

| Data | Where | What's Stored |
|---|---|---|
| **Documents** | `lib/api/documents.ts` | Type, title, transcript, status, folder, tags |
| **Quiz Attempts** | `lib/api/documents.ts` → `quizzesApi` | Score, all user answers (JSON), timestamp |
| **Weak Topics** | Auto-generated on wrong answers | Topic string, missed count, correct answer, document source |
| **Practice Exam Attempts** | `lib/api/organization.ts` → `practiceExamsApi` | Score, per-question results, in-progress auto-save |
| **Study Plans** | `lib/api/studyPlan.ts` | Test date, selected docs, AI schedule, day completion |
| **Tasks** | `lib/api/tasks.ts` | Title, due date, estimated time, tags, completion |
| **Study Sessions** | `lib/api/tasks.ts` → `studySessionsService` | Mode, duration, start/end, linked tasks |
| **Daily Activity** | API ping on visit/upload/study | Level 1–3 per day, drives heatmap + streak |
| **Streak** | `GET /streak` | Current days, longest streak, last study date |
| **Podcasts** | `lib/api/podcasts.ts` | Title, length, voice, status, audio URL, script |
| **Tutor Sessions** | `lib/api/tutor.ts` | Full message history, loaded note IDs, mode |

### What AI Content Generation Currently Uses
- **Notes / Flashcards / Quizzes**: document title + raw content only. No user profile context.
- **Practice Exams**: document titles + notes/transcripts. No user profile context.
- **Study Plans**: document content + user profile (grade level, learning style, hoursPerWeek, struggles) + unresolved weak topics for selected documents.
- **Tutor chat**: full user profile, up to 15 loaded notes, unresolved weak topics, active study plan context (today's topics, days until test).
- **Assistant chat**: profile, active study plans, weak topics, recent quiz scores, subjects.
- **Notes/flashcards/quizzes/podcasts**: document content only. No profile context.

> **Note**: profile data is not yet used to personalize notes, flashcards, quiz, or podcast generation.

---

## Features & Where They Live

### Document Library
Users upload PDFs, audio files, YouTube URLs, website URLs, or create blank notes. Each document goes through async AI processing (notes, flashcards, quiz generated server-side). Tags are auto-assigned from a fixed subject list during processing.

- **List view**: `app/dashboard/library/page.tsx` — folder tree on left, document grid on right. Upload triggered via a dropdown that opens `UploadDialog` with the appropriate `type`.
- **Upload modal**: `components/upload/UploadDialog.tsx` — handles all 5 upload types (`blank`, `file`, `record`, `video`, `webpage`) in one component. Polls `GET /documents/:id` until status is `complete` or `failed`.
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
AI generates a day-by-day study schedule from selected documents, test date, user profile, and weak topics. Users can mark days and individual topics complete. Topic completion state is stored in DB (`completedTopics` field), not localStorage.

- **Plan list**: `app/dashboard/study-plan/page.tsx`
- **Plan detail**: `app/dashboard/study-plan/[id]/page.tsx` — day rows, topic checkboxes, progress bars, calendar view
- **Calendar**: `components/dashboard/PlanCalendar.tsx`
- **API**: `lib/api/studyPlan.ts` — `studyPlansApi` (includes `saveTopics`, `completeDay`, `incompleteDay`)

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
Streaming chat with 5 teaching modes (`casual`, `tutor`, `strict`, `teach_back`, `eli5`) — same chat, mode changes teaching method. Tutor is aware of user's weak topics, active study plans, and loaded notes. Weak topics are resolved in DB when the student demonstrates understanding.

- **Standalone page**: `app/dashboard/tutor/page.tsx` — session list + mode selector on welcome screen
- **In-document panel**: `components/library/TutorPanel.tsx` — slides in from the right inside DocumentDetail
- **Input + bubbles**: `components/tutor/` — `TutorInput`, `UserBubble`, `ContextPicker`
- **API**: `lib/api/tutor.ts` — `tutorApi`, `streamTutorChat` (SSE stream, handles `delta`, `offer`, `resolved`, `done` events)

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

## Component Architecture
- **Always extract reusable UI into its own component file** before a page file gets long. If a section of a page could reasonably appear elsewhere, it belongs in `components/`.
- Page files (`app/**/page.tsx`) should be thin — they wire data and compose components, not render large blocks of JSX directly.
- If a component is specific to one feature, colocate it in the relevant `components/<feature>/` folder. If it could be used across features, put it in `components/ui/`.
- Before building something new, check the component list in this file. Duplicate implementations cause visual inconsistency.

## Responsive Design — Required on Everything
Every UI must work across three breakpoints: mobile (`< sm`), laptop (`sm`–`lg`), and large screen (`lg+`). This is not optional.

Rules:
- **Layouts**: multi-column grids collapse to a single column on mobile. Side-by-side rows stack vertically. Horizontal lists become vertical lists.
- **Typography**: headings and body text scale with breakpoints. Use `text-base sm:text-lg lg:text-xl` style patterns — never hardcode a single font size for headings.
- **Spacing & padding**: use `px-4 sm:px-6 lg:px-8` and `py-4 sm:py-6` patterns so screens don't feel cramped or over-spaced.
- **Buttons and inputs**: full width (`w-full`) on mobile, constrained width (`sm:max-w-xs` or similar) on larger screens.
- **Cards**: full width on mobile, fixed or percentage widths on `sm+`.
- **Touch targets**: interactive elements must be at least 44px tall on mobile.
- Always test mental model for all three breakpoints before finalizing any layout.

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
