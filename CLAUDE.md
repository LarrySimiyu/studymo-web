# Studymo Web — Claude Instructions

## Project Overview
Studymo is a study/ed-tech SaaS app. Web app built with Next.js 14 App Router + TypeScript.

**Backend**: All API logic lives in the separate `studymo-api` repo at `/Users/larrysimiyu/Desktop/coding/studymo-api`. If a task requires backend changes (new endpoints, schema changes, new fields), refer to that repo and its `CLAUDE.md` for context.

## Tech Stack
- **Framework**: Next.js 14 App Router (`'use client'` where needed)
- **Styling**: Tailwind CSS with custom CSS variables (see theme below)
- **Animations**: `framer-motion` — use `AnimatePresence` + `motion.div` for all show/hide transitions
- **Icons**: `lucide-react` exclusively
- **UI primitives**: shadcn/ui components (`components/ui/`) + `@radix-ui/react-popover` for popovers/date pickers
- **Date picker**: `react-day-picker` v9 with custom `MonthCaption` and `DayButton` components
- **API layer**: all API calls go through `lib/api/` modules

## Theme Variables
Always use these CSS variables — never hardcode colors except for brand accents:

```
var(--text-1)     — primary text (white-ish)
var(--text-2)     — secondary text
var(--text-3)     — muted/hint text
var(--bg-card)    — card background
var(--bg-input)   — input / inner element background
var(--bg-hover)   — hover state background
var(--border)     — border color
var(--brand)      — brand orange (#FF6500)
```

Common hardcoded accent colors (used for scores, status):
- Green: `#22C55E` / `rgba(34,197,94,0.12)` bg
- Amber: `#F59E0B` / `rgba(245,158,11,0.12)` bg
- Red: `#EF4444` / `rgba(239,68,68,0.12)` bg
- Blue: `#3B82F6`

## File Structure
```
app/dashboard/              — page routes
components/dashboard/       — dashboard-specific components (PlanCard, PlanCalendar, QuizStatsCard, Sidebar, etc.)
components/tasks/           — task components (TaskItem, TaskModal, TasksPanel)
components/ui/              — shared primitives (Button, Input, Calendar, etc.)
lib/api/                    — API modules (documents, studyPlan, analytics, tasks, etc.)
hooks/                      — custom hooks (useAuth, etc.)
```

## Reusable Components
Always import these — never re-implement inline:
- `components/ui/Input` — for all text inputs in forms/modals
- `components/ui/Button` — use `variant="brand" size="lg"` for primary actions
- `components/ui/calendar` — shadcn Calendar with custom `scheduledDates` / `completedDates` / `compact` props
- `components/dashboard/PlanCard` — exports `PlanCard` (default), `DayRow`, `PALETTE`, `getPalette`, `daysColor`
- `components/dashboard/PlanCalendar` — accepts `entries: StudyPlanDay[]` and `compact?: boolean`
- `components/tasks/TasksPanel` — accepts `onCountChange?` and `hideCompleted?`

## Component Patterns
- **`compact` prop**: thread through component trees for sidebar/small-screen size variants (smaller text, padding, icons)
- **`onCountChange` callback**: used to lift counts up to parent tab labels without lifting full state
- **Date pickers in modals**: always use Radix `Popover` + shadcn `Calendar`
- **Modal layout**: `fixed inset-0 flex items-center justify-center p-4` — centered at all breakpoints, no bottom-sheet behavior
- **Cancel actions**: small text link below the primary button, not an X icon
- **Section toggles**: use `AnimatePresence` with `height: 0 → auto` + `opacity` for collapsible sections

## Animation Conventions
```tsx
// Standard collapse/expand
initial={{ height: 0, opacity: 0 }}
animate={{ height: 'auto', opacity: 1 }}
exit={{ height: 0, opacity: 0 }}
transition={{ duration: 0.25, ease: 'easeInOut' }}
style={{ overflow: 'hidden' }}

// Tab panel switch
initial={{ opacity: 0, y: 10 }}
animate={{ opacity: 1, y: 0 }}
exit={{ opacity: 0, y: -10 }}
transition={{ duration: 0.2, ease: 'easeInOut' }}
// use AnimatePresence mode="wait"
```

## Sidebar
- Sections: Notes (starts open), Study Materials (starts closed), Tools (starts closed)
- Section header labels, icons, and chevrons are always `text-white`
- Nav links are always `text-white`
- Collapse/expand persisted in `localStorage('sidebar-collapsed')`

## Working Features (Pages)

### `/dashboard` — Home
- Welcome message with user name
- Recent notes horizontal scroll strip
- Recommended section (RecommendedSection component)
- Quiz stats card with collapsible quiz list (QuizStatsCard)
- Weak topics grid (top 4, links to full list)
- Right panel (xl+): Planning/Tasks tab switcher (PlanningPanel + TasksPanel)
- Inline section (below xl): PlanningTasksSection (calendar + plans + tasks)

### `/dashboard/library` — Notes/Documents
- Upload PDF, audio, YouTube URL, browser recording
- Folder hierarchy with color-coded collections
- Tag filtering
- Document processing status (processing/complete/failed)
- Collapsible sidebar when in library view

### `/dashboard/notes` — Notes viewer
- View AI-generated notes per document
- Share note via public link

### `/dashboard/flashcards` — Flashcards
- Flashcard decks per document
- Generate on demand

### `/dashboard/quizzes` — Quizzes
- Quiz per document (multiple choice, short answer, true/false)
- Record attempts, track scores
- Weak topic tracking from missed questions

### `/dashboard/practice-exams` — Practice Exams
- AI-generated exams with multiple question types
- Auto-graded short answers

### `/dashboard/podcasts` — Podcasts
- Generate podcast from notes (5/10/15 min)
- 6 voice options with preview
- Audio playback

### `/dashboard/study-plan` — Study Plan
- Create AI study plan (select documents + test date)
- Day-by-day breakdown with topics
- Mark days/topics complete
- Calendar view with scheduled/completed dates
- Progress bars per plan

### `/dashboard/tasks` — Tasks
- Create/edit/delete tasks
- Due dates, tags, estimated time
- Complete/incomplete toggle
- Active vs completed sections

### `/dashboard/weak-topics` — Weak Topics
- List of unresolved weak topics from quiz misses
- Mark as resolved

### `/dashboard/analytics` — Analytics
- Overview stats (documents, quizzes, sessions, streak)
- Time by subject chart
- Quiz history with improvement tracking
- Study session summaries
- Activity heatmap

### `/dashboard/tutor` — AI Tutor
- Chat interface with streaming SSE responses
- Attach up to 15 notes as context
- AI actions: navigate, generate quiz, create study plan, open timer

### `/dashboard/settings` — Settings
- Profile management
- Subscription/billing (Stripe portal)

## General Preferences
- No left accent bars on list items
- No X icon on modals — use cancel text link
- Keep components self-contained; don't re-implement things that already exist as reusable components
- Don't add comments unless logic is non-obvious
- Don't add extra error handling for impossible scenarios
- Prefer editing existing files over creating new ones
