# Studymo Web — Claude Instructions

## Project Overview
Studymo is a study/ed-tech SaaS. This is the Next.js 14 App Router frontend.
The backend API lives at `../studymo-api` — check its CLAUDE.md for endpoint details, schema, service logic, and the free-tier quota rules.

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

The dashboard ships **dark-only** for now. Light mode is fully built in `.light`
in globals.css but switched off by `THEME_ENABLED = false` in `ThemeProvider`,
and the sidebar toggle is removed. Keep writing token-correct styles so it can
be switched back on with one line.

### Semantic colour — use the `-ink` tokens for text
`--brand` / `--danger` / `--success` / `--warning` are **fill** colours. For
anything that renders as text or an icon, use `--brand-ink` / `--danger-ink` /
`--success-ink` / `--warning-ink`. The raw accents sit at 1.9–2.2:1 on white and
fail AA in light mode; the `-ink` values are darkened to clear it.

Soft buttons pair `--x-subtle` (rest) with `--x-subtle-hover` (hover) — tinted
buttons can't hover via opacity without washing out the label.

### Accent palette — icons and identity only
For per-item colour (note icons, upload types, plan cards) import `PALETTE` /
`getPalette` from `components/dashboard/PlanCard`. **Never redefine the array
locally.** These are decorative, not semantic — don't use them for state.
- Orange `#FF6500` / `rgba(255,101,0,0.12)`
- Green `#22C55E` / `rgba(34,197,94,0.12)`
- Amber `#F59E0B` / `rgba(245,158,11,0.12)`
- Red `#EF4444` / `rgba(239,68,68,0.12)`
- Blue `#3B82F6` / `rgba(59,130,246,0.12)`
- Pink `#EC4899` / `rgba(236,72,153,0.12)`
- Purple `#8B5CF6` / `rgba(139,92,246,0.12)`
- Teal `#14B8A6` / `rgba(20,184,166,0.12)`

## Typography — use the scale, not raw sizes
Declared in `tailwind.config.ts`. Raw `text-sm` / `text-2xl` / `text-[10px]` are
what made ten pages render the same rank at five different sizes.

| token | size | use |
|---|---|---|
| `text-2xs` | 11px | count badges, timestamps, source pills. Nothing goes below this |
| `text-xs` | 12px | meta, chips, dense rows |
| `text-body-sm` | 14px | body copy, list rows, secondary text |
| `text-body` / `text-body-lg` | 16 / 18px | prose, card titles |
| `text-heading-sm` / `text-heading` | 20 / 24px | page title (via `PageHeader`), section headers |
| `text-title` / `text-display` | 28 / 36px | stat readouts, scores |

Headings carry their own weight — don't add `font-bold` on top of `text-heading`.

Page title = `PageHeader`. Block heading = `SectionHeading` (from the same file).

## Hover states are CSS, not JS
Use `hover:bg-[var(--bg-hover)]`. Never `onMouseEnter={e => e.currentTarget.style…}`
— it has no keyboard-focus equivalent and an inline style silently beats the class.

## Reusable Components — Check These Before Building Anything New
Duplicate implementations cause visual inconsistency. Always import from here first.

### `components/ui/Button`
**The only button in the app.** shadcn/cva. Never write a raw `<button>` with a hardcoded background, padding, and radius — that is how this codebase ended up with four parallel button systems.

Variants:

| variant | use |
|---|---|
| `primary` | solid brand — the one main action in a view |
| `secondary` | neutral filled — secondary actions, toolbars |
| `outline` | bordered neutral — pairs with primary in modal footers |
| `ghost` | transparent until hover — icon buttons, menu rows, dismissals |
| `link` | inline text action. Pair with `size="link"` |
| `danger` / `success` / `warning` / `brandSoft` | soft semantic fills, `-ink` label |
| `upgrade` | **the only gradient left in the app.** Paywall / Get Unlimited only |
| `pill` | card-surface chip — tutor context chips |

Sizes: `xs` (h-7) · `sm` (h-8) · `default` (h-9) · `lg` (h-11, 44px touch target) · `icon` · `icon-sm` · `icon-xs` · `pill` · `link`. Every button is `rounded-full` and presses in on `active:scale-[0.97]` — don't override either. Horizontal padding is deliberately tight for the pill shape; don't pad individual call sites back out.

Use `variant="primary" size="lg"` for primary modal/form actions.

**What counts as a button.** A raw `<button>` is correct only when the element isn't shaped like one. Use `Button` for: labelled actions, icon actions (close, dismiss, back, send, delete), and inline text actions (`variant="link" size="link"`). Keep a raw `<button>` for: dropdown/menu rows, clickable cards and list rows, tab and toggle groups (use `SegmentedTabs` / `SlidingTabs`), checkboxes and radios, colour swatches, calendar day cells, quiz answer options, and purpose-built transport controls (the podcast player, the recorder). The test is whether a pill with a press animation would look right there.

### `components/dashboard/PageShell`
The container every dashboard page sits in. Owns the gutter (`px-4 sm:px-5`, matching `PageHeader`'s) so pages stop inventing their own. `width`: `sm` (2xl) · `md` (3xl, default) · `lg` (4xl) · `xl` (5xl) · `full` (uncapped).

The column is **anchored to the sidebar, not centred** — a centred column on a wide screen leaves a canyon between the nav and the content. Pass `center` only on focus views that read better in the middle of the screen: settings, a quiz run, an exam, a plan detail.

Pass the page's `PageHeader` as the `header` prop, not as a child — the shell renders it outside the content column so the bar spans the full pane.

### `components/dashboard/EmptyState`
The one empty state — icon, title, description, optional action. Takes `accent` / `accentBg` for the icon tint. Don't hand-roll another.

### `components/ui/RowActionsMenu`
The three-dot row menu, on Radix `dropdownMenu`. Takes `actions: RowAction[]` (`label`, `icon`, `onSelect` or `href`, `danger`). Replaced three hand-rolled hover-timer popovers that had no focus trap, Escape, or keyboard access.

### `components/ui/SegmentedTabs`
Pill-in-a-track switch for two or three peer views. Distinct from `SlidingTabs`, which is the underlined bar for navigating sections of a page.

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

### `components/ui/badge`
shadcn Badge (`default` / `secondary` / `destructive` / `outline` / `tag` variants, `sm` / `default` sizes). **`TagBadge` is the only way to render a tag pill** — pass `color` and it applies the tint + text colour from `lib/tagColors`. Never hand-roll a `<span>` with `color + '22'`.

### `components/ui/calendar`
shadcn Calendar extended with `scheduledDates`, `completedDates`, and `compact` props. Use with Radix `Popover` for date pickers in modals.

### `components/flashcards/FlipCard`
Animated flip card with prev/next/restart. Takes `cards`, `index`, `onPrev`, `onNext`, `onRestart`. Used in DocumentDetail and the flashcards page.

### `components/quiz/QuizRunner`
Full quiz-taking UI — question flow, scoring, attempt submission to the API, results screen. Takes `document` and `quiz`. Used in DocumentDetail and the quizzes page.

### `components/ui/dialog`
The modal primitive (shadcn Dialog on `@radix-ui/react-dialog`). Gives focus trap, Escape, body scroll lock, and `aria-modal` for free. `DialogContent` takes `variant` (`default` | `fullscreen`), `size` (`sm` | `default` | `lg` | `xl`), and `showClose`. Exports `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter`, `DialogClose`. **Every modal in the app goes through this — never hand-roll `fixed inset-0`.**

### `components/ui/alertDialog`
Destructive-confirm primitive (shadcn AlertDialog on `@radix-ui/react-alert-dialog`). Focus defaults to Cancel and click-outside does not dismiss. Use for anything that deletes or is irreversible.

### `components/library/DeleteConfirmModal`
The shared delete confirmation, built on `alertDialog`. Takes `open`, `onConfirm`, `onClose`, `deleting`, and optional `title` / `description` / `count`. Used by the library grid, DocumentDetail, and chat history rows — **don't write another delete confirm.**

### `components/upload/UploadDialog`
The single upload modal for all content types. Takes a `type` prop: `'blank' | 'file' | 'record' | 'video' | 'webpage'`. Handles the full flow: form input → upload → processing poll → success/failure. Always use this — don't build custom upload forms.

Split by responsibility: `UploadDialog.tsx` is the Dialog shell + type routing; `useUploadFlow.ts` owns the upload → processing → complete/failed state machine and the status-watch teardown; one form component per type (`BlankNoteForm`, `FileUploadForm`, `RecordForm`, `VideoForm`, `WebpageForm`), all sharing the `UploadFormProps` contract in `uploadTypes.ts`. `UploadProgress.tsx` is the shared progress bar.

### `components/dashboard/PageHeader`
The page's top bar — sticky, `h-14`, bottom border, title left and actions right. Same shape as the tutor's `TutorTopBar`, so chat and the rest of the app share one piece of chrome. `subtitle` sits inline next to the title and is hidden below `sm`. Pass it to `PageShell`'s `header` prop; don't render it inside the content column.

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

### `components/dashboard/UsageCounter`
"2 of 2 free quizzes used" under a generate button. Takes a `limitKey`; renders nothing for
subscribers. Put one under every action that spends a free quota — don't hand-roll the copy.

### `components/dashboard/FreeUsageStrip`
The free-plan meter in the sidebar (uploads, notes, tutor messages). Hidden for subscribers.

### `components/tutor/OutOfMessagesBanner`
Shown above the tutor input when a free user's messages run out. Shared by the full tutor
page and the in-document panel.

---

## Free Tier

Non-subscribers get fixed, lifetime quotas — 5 uploads · 5 notes · 10 tutor messages · 2
each of decks, quizzes, exams and podcasts · 3 weak topics · 1 study plan · 5 tasks. The
server owns enforcement; see `../studymo-api/CLAUDE.md` for the authoritative table.

Three rules for the client:

1. **Never gate a feature by hand.** `lib/api.ts` turns any `403 free_limit_reached` into
   the paywall for you, and rewrites the error string into something a user can read. Any
   call going through `lib/api` is already covered.
2. **Read counts from `hooks/useUsage`** — `used`, `limit`, `remaining`, `atLimit`, `isFree`.
   It refreshes on every write via the `usage:changed` event in `lib/contentEvents`.
   Never count rows client-side to infer a quota.
3. **Raise the paywall with `showPaywall(trigger)`** from `lib/paywall`, never a raw
   `dispatchEvent`. `app/dashboard/layout.tsx` owns the modal and logs the trigger.

The tutor is the one exception to rule 1: `streamTutorChat` bypasses `lib/api`, so it
throws a typed `FreeLimitError` and the surface shows `OutOfMessagesBanner` inline instead
of throwing a modal over the conversation.

**Signup never touches Stripe.** Every account starts free, and the only moment a card is
asked for is when a free quota runs out and the paywall opens on a plan the user picked
deliberately. That is why every CTA on `/pricing` reads "Start free" and why a signed-out
visitor clicking *any* column — including a paid one — goes to `/sign-up` and nowhere else.
Don't reintroduce a plan hand-off through signup or onboarding; it puts a card form in
front of someone who hasn't used the product yet.

The API returns four plans — Free, Weekly, Monthly, Yearly. Free is a synthetic `$0` entry
with a null `priceId`, so any CTA handler must branch on `plan.id === 'free'` before
reaching for Stripe. `/pricing` shows all four; `PaywallModal` shows the three paid ones,
since it only ever opens for a user already on Free.

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
- Mathematics, Biology, Chemistry, Physics, History, English, Computer Science, Economics, Psychology, Law, Medicine, Engineering, Coding, Personal Finance, Language Learning, Business, Design, Marketing, Philosophy, Music Theory

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
- **Notes / Flashcards / Quizzes**: document title + raw content only (up to 200k chars). No user profile context. PDFs generate from their extracted text, not the file itself, except for scanned PDFs with no text layer.
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

- **Split layout**: `app/dashboard/library/layout.tsx` — note list, filters, and modals on the left; the `[id]` route renders into the right pane. Upload triggered via `components/library/LibraryUploadMenu.tsx`, which opens `UploadDialog` with the appropriate `type`. The layout owns the search/tag filters, auto-opens the first note on arrival, and falls back to the first match when the open note is filtered or deleted away — both via `router.replace`, so Back doesn't walk through every filter keystroke.
- **Empty state**: `app/dashboard/library/page.tsx` — "Select a note to view it". Only reached when the filtered list is empty, since the layout auto-opens the first note otherwise.
- **Selected note**: `app/dashboard/library/[id]/page.tsx` — renders `DocumentDetail` in `embedded` mode. Selecting a note is a real navigation; `?folder=` is carried across so the list and sidebar keep their filter.
- **Upload modal**: `components/upload/UploadDialog.tsx` — handles all 5 upload types (`blank`, `file`, `record`, `video`, `webpage`) in one component. Waits on `watchDocumentStatus`, which reads the SSE stream at `GET /documents/:id/status-stream` with a 10s polling backstop — the stream alone can die without ever delivering an event, which leaves the dialog spinning until a reload.
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

- **Deck list**: `app/dashboard/flashcards/page.tsx` — each deck links to `/dashboard/flashcards/[documentId]`
- **Deck viewer**: `app/dashboard/flashcards/[documentId]/page.tsx` — a deck is keyed by its document; card index is local state, not in the URL
- **Viewer**: `components/flashcards/FlipCard.tsx` — used both on the flashcards page and inside DocumentDetail
- **API**: `lib/api/documents.ts` — `flashcardsApi`

### Quizzes
AI-generated quizzes with multiple choice, short answer, and true/false questions. Attempts are recorded and feed into weak topic tracking.

- **Quiz list**: `app/dashboard/quizzes/page.tsx` — each quiz links to `/dashboard/quizzes/[documentId]`
- **Quiz page**: `app/dashboard/quizzes/[documentId]/page.tsx` — a quiz is keyed by its document
- **Quiz runner**: `components/quiz/QuizRunner.tsx` — used on the quiz page and inside DocumentDetail. Submits attempt to API on completion.
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

- **Plan list**: `app/dashboard/study-plan/page.tsx` — `PlanCard` expands inline for a quick look; the expand icon in its header links to the full `[id]` page
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

- **Welcome screen**: `app/dashboard/tutor/page.tsx` — no session open
- **Chat session**: `app/dashboard/tutor/[sessionId]/page.tsx` — the route segment is the source of truth for the open chat; `useTutorChat(sessionId)` takes it as an argument. Both routes render `components/tutor/TutorSurface.tsx`. Read the open session's id with `hooks/useActiveSessionId.ts` — never parse the pathname by hand, it has to skip the static `history` sibling.
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
- **Plans**: `app/pricing/page.tsx` and `components/pricing/PaywallModal.tsx` both render
  `PricingGrid`, differing only by `includeFree` and `ctaLabel`. Copy, prices, and the
  savings maths live in `components/pricing/pricingContent.ts`; CTA behaviour lives in
  `hooks/usePlanCheckout.ts`. Keep changes there, not in one of the two surfaces.
  Never hardcode a price — read it from `billingApi.getPlans()`, which is live from Stripe.

---

## File Structure
```
app/dashboard/          — page routes (one folder per feature)
components/
  ui/                   — shared primitives (dialog, alertDialog, Button, Input, SlidingTabs, QuestionCard, etc.)
  dashboard/            — dashboard-wide components (Sidebar, PageHeader, PlanCard, WeakTopicItem, etc.)
  library/              — document viewer (DocumentDetail, TutorPanel, DeleteConfirmModal)
  pricing/              — PricingGrid + PlanColumn, pricingContent (copy/maths), PaywallModal
  upload/               — UploadDialog shell + useUploadFlow + one form per upload type
  flashcards/           — FlipCard
  quiz/                 — QuizRunner
  podcast/              — GeneratePodcastModal, PodcastPlayer
  tasks/                — TaskItem, TaskModal, TasksPanel
  tutor/                — chat input/bubbles/context picker, OutOfMessagesBanner
  timer/                — StudyTimerPanel
lib/
  api.ts                — the fetch client: auth header, GET cache, free-limit interceptor
  paywall.ts            — showPaywall / onShowPaywall
  contentEvents.ts      — content:changed (sidebar totals) + usage:changed (free-tier counters)
lib/api/                — one file per API domain
  documents.ts          — documentsApi, notesApi, flashcardsApi, quizzesApi
  studyPlan.ts          — studyPlansApi, weakTopicsApi
  analytics.ts          — analyticsApi, activityApi
  tasks.ts              — tasksApi
  organization.ts       — foldersApi, practiceExamsApi
  podcasts.ts           — podcastsApi
  billing.ts            — plans, status, usage, checkout, portal
  profile.ts / tutor.ts
hooks/
  useAuth.ts            — Firebase auth state + subscriptionStatus
  useUsage.ts           — free-tier limits, usage, atLimit/remaining
  useTutorChat.ts       — the tutor page's chat state machine
  usePlanCheckout.ts    — plan list + CTA routing for /pricing and PaywallModal
```

## Environment Variables
```
NEXT_PUBLIC_API_URL                    # Backend URL (e.g. https://your-api.railway.app)
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
NEXT_PUBLIC_GA_MEASUREMENT_ID
NEXT_PUBLIC_MIXPANEL_TOKEN
```

Stripe checkout is entirely the API's job — it creates the session and returns a URL the
browser redirects to. The web app never talks to Stripe directly, and the Stripe webhook
is handled by the API, not a Next route handler.

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
- **Opening a record is a navigation, not a state change.** Anything with an id — a note, deck, quiz, exam, plan, chat — gets a `[id]` route so it survives refresh, works with the Back button, and can be linked to. Never swap a list view for a detail view with `useState`. Query params are for filters (`?folder=`), not for identity. Inline expansion is fine for a preview (`PlanCard`), but the full view still needs its own route.
- Master-detail screens use a route group: `layout.tsx` holds the list, `page.tsx` the empty state, `[id]/page.tsx` the detail — see `app/dashboard/library/`. Carry the existing query string across those navigations so filters survive.
- All API calls go through `lib/api/` — never call `fetch` directly
- GET responses are cached 5 min — call `invalidatePrefix('/resource')` after mutations if needed
- Free-tier limits are the server's job. Don't gate a feature client-side — let the 403 come
  back and `lib/api.ts` will raise the paywall. Read counts from `useUsage`, never by counting
  rows. See the Free Tier section above
- Use `api.postForm` for file/recording uploads
- **Modals: import `Dialog` from `components/ui/dialog`. Never hand-roll an overlay.** A raw `fixed inset-0` wrapper has no focus trap, no Escape key, no body scroll lock, and no `aria-modal`. Use `AlertDialog` from `components/ui/alertDialog` for destructive confirms. No bottom-sheet behavior.
- Stacking scale (also documented at the top of `globals.css`) — nothing may exceed `z-[70]`:

  | Layer | z |
  |---|---|
  | Page chrome, sticky headers | `z-10`–`z-40` |
  | Dialog overlay + content | `z-50` |
  | Popovers/calendars nested inside a dialog | `z-[60]` |
  | Portalled dropdowns, toasts | `z-[70]` |

- Radix primitives (`dialog`, `alertDialog`) animate via Tailwind keyframes declared in `tailwind.config.ts` (`overlay-in/out`, `dialog-in/out`) driven by `data-[state=open|closed]`. This is the one exception to the framer-motion rule — Radix exit animations would otherwise need `forceMount` + `AnimatePresence` on every call site.
- Cancel actions: small text link below the primary button, not an X icon
- Dropdowns that appear inside `overflow-hidden` containers: use `getBoundingClientRect()` + `position: fixed`
- Never hardcode a color palette array locally — import `PALETTE` / `getPalette` from `components/dashboard/PlanCard`
- Prefer editing existing files over creating new ones
- Don't add comments unless logic is non-obvious
