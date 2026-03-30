# studymo-web

Next.js 14 (App Router) frontend. All pages are client-side rendered via `'use client'` components wrapped in context providers.

---

## Folder Structure

```
studymo-web/
├── app/
│   ├── layout.tsx                            # Root layout (AuthProvider)
│   ├── page.tsx                              # Landing page
│   ├── sign-in/page.tsx                      # Sign in (email + Google)
│   ├── sign-up/page.tsx                      # Sign up (email + Google + Apple)
│   ├── onboarding/page.tsx                   # 10-step onboarding flow
│   ├── subscribe/page.tsx                    # Pricing / subscription page
│   ├── notes/shared/[shareToken]/page.tsx    # Public shared note (read-only)
│   ├── dashboard/
│   │   ├── layout.tsx                        # Dashboard shell (Sidebar, Timer, Assistant)
│   │   ├── page.tsx                          # Home — streak, tasks, weak topics
│   │   ├── library/
│   │   │   ├── page.tsx                      # Document library with folders + tags
│   │   │   └── [id]/page.tsx                 # Document detail (notes, flashcards, quiz)
│   │   ├── study-plan/
│   │   │   ├── page.tsx                      # Study plans list + create
│   │   │   └── [id]/page.tsx                 # Plan detail with calendar view
│   │   ├── tasks/page.tsx                    # Task management + timer integration
│   │   ├── analytics/page.tsx                # Study analytics
│   │   ├── weak-topics/page.tsx              # Weak topics review
│   │   ├── practice-exams/
│   │   │   ├── page.tsx                      # Practice exams list
│   │   │   └── [id]/page.tsx                 # Exam detail + submission
│   │   ├── podcasts/page.tsx                 # Podcast generation + playback
│   │   ├── tutor/page.tsx                    # AI Tutor (two-column chat)
│   │   └── settings/
│   │       ├── page.tsx                      # User settings
│   │       └── billing/page.tsx              # Billing management
│   └── api/
│       └── webhooks/stripe/route.ts          # Stripe webhook handler
├── components/
│   ├── assistant/
│   │   └── AssistantPanel.tsx                # Floating AI assistant (bottom-left)
│   ├── dashboard/
│   │   └── Sidebar.tsx                       # Navigation sidebar
│   ├── landing/
│   │   ├── Hero.tsx
│   │   ├── Features.tsx
│   │   └── Pricing.tsx
│   ├── podcast/
│   │   ├── GeneratePodcastModal.tsx           # Create podcast from document
│   │   └── PodcastPlayer.tsx                 # Audio player
│   ├── timer/
│   │   └── StudyTimerPanel.tsx               # Pomodoro/timeblock timer panel
│   ├── upload/
│   │   └── UploadModal.tsx                   # Upload PDF/video/recording
│   └── ui/
│       ├── button.tsx
│       └── card.tsx
├── context/
│   ├── AuthContext.tsx                       # Firebase auth state + user sync
│   ├── AssistantContext.tsx                  # AI assistant state + streaming
│   └── StudyTimerContext.tsx                 # Study session timer state
├── hooks/
│   ├── useAuth.ts                            # Auth state + methods
│   └── useSubscription.ts                   # Subscription status
├── lib/
│   ├── api.ts                               # Core HTTP client (get/post/patch/delete)
│   ├── firebase.ts                          # Firebase client init + Apple provider
│   ├── onboarding.ts                        # localStorage onboarding persistence
│   ├── stripe.ts                            # Stripe.js lazy loader
│   ├── utils.ts                             # cn() classname helper
│   └── api/
│       ├── analytics.ts                     # analyticsApi
│       ├── billing.ts                       # billingApi
│       ├── documents.ts                     # documentsApi, notesApi, flashcardsApi, quizzesApi, docTagsApi
│       ├── organization.ts                  # foldersApi, practiceExamsApi, noteTagsApi
│       ├── podcasts.ts                      # podcastsApi
│       ├── profile.ts                       # profileApi
│       ├── studyPlan.ts                     # studyPlansApi, weakTopicsApi, streakApi
│       ├── tasks.ts                         # subjectTagsApi, tasksApi, studySessionsApi
│       └── tutor.ts                         # tutorApi, streamTutorChat()
```

---

## Pages

### Public
| Route | Description |
|---|---|
| `/` | Landing page — Hero, Features, Pricing |
| `/sign-in` | Email/password + Google OAuth |
| `/sign-up` | Email/password + Google + Apple OAuth. Redirects to `/onboarding` after signup |
| `/onboarding` | 10-step tap-only flow. Saves to localStorage. Syncs to API after OAuth completes |
| `/subscribe` | Pricing cards (weekly/monthly/yearly). Creates Stripe checkout session |
| `/notes/shared/[shareToken]` | Read-only shared note — no auth required |

### Dashboard (auth + subscription required)
| Route | Description |
|---|---|
| `/dashboard` | Streak banner, upcoming tests, today's tasks, weak topics, AI recommendations |
| `/dashboard/library` | Document library. Folders (drag-n-drop), tags, search, type filter |
| `/dashboard/library/[id]` | Document detail — notes editor, flashcard deck, quiz, podcast list, Study with Tutor |
| `/dashboard/study-plan` | Create study plan (pick test date + documents). List active plans |
| `/dashboard/study-plan/[id]` | Plan detail — calendar + list view, day-by-day topics, mark complete |
| `/dashboard/tasks` | Task list with subject tags. Timer integration. Completion tracking |
| `/dashboard/analytics` | Study time, quiz history, weak topics summary, session data |
| `/dashboard/weak-topics` | Unresolved weak topics by document. Mark resolved |
| `/dashboard/practice-exams` | Generate + list practice exams |
| `/dashboard/practice-exams/[id]` | Take exam. Submit + see score |
| `/dashboard/podcasts` | Generate podcasts from documents. Playback with player |
| `/dashboard/tutor` | Two-column AI tutor. Session list (left) + chat (right). Helper/Tutor modes. Load notes as context |
| `/dashboard/settings` | User settings |
| `/dashboard/settings/billing` | Stripe billing portal |

---

## Context Providers

### AuthContext
Wraps the entire app. Manages:
- Firebase Auth state (`currentUser`)
- Backend user record (`dbUser`)
- Subscription status (`subscription`)
- Methods: `signIn`, `signUp`, `signOut`, `googleSignIn`, `appleSignIn`
- After OAuth: syncs onboarding data from localStorage to API, then clears it
- Unauthenticated users on `/dashboard/*` redirect to `/onboarding`

### AssistantContext
Powers the floating `AssistantPanel`. Manages:
- Open/collapsed state
- `isTutoringMode` toggle
- Message list with streaming SSE
- `sendMessage()` — streams response chunk by chunk
- `handleAction()` — routes `ACTION:{...}` blocks from responses to: navigate, generate_quiz, open_timer, create_study_plan
- Global `Cmd+K` shortcut via dashboard layout

### StudyTimerContext
Powers `StudyTimerPanel`. Manages:
- Session modes: `pomodoro` (25 min work / 5 min break), `timeblock` (open-ended)
- Active session state, task entries, elapsed time
- Methods: `startSession`, `pauseTimer`, `resumeTimer`, `endSession`, `abandonSession`, `setActiveTask`
- Syncs progress to API every tick

---

## Key Components

### Sidebar
Navigation with 15 items. Active state detection via `pathname.startsWith()`. Color scheme: `#1A1A1A` bg, `#9747FF` accent.

### AssistantPanel
Floating circle (bottom-left) → expands to 400×520px panel. Features:
- Tutoring mode toggle
- Streaming message rendering with cursor
- Action cards (rendered when AI returns structured actions)
- Suggestion chips
- `Enter` to send

### StudyTimerPanel
Slide-up timer panel. Pomodoro mode auto-starts break after work interval. Timeblock mode is task-linked. Integrates with task list to mark tasks complete on session end.

### UploadModal
Handles 3 upload types:
- **File** — PDF drag-and-drop or file picker
- **Video** — YouTube URL input
- **Recording** — Browser microphone via MediaRecorder API

### GeneratePodcastModal
Select document, voice (alloy/echo/fable/onyx/nova/shimmer), and length (5/10/15 min). Polls document status if still processing.

---

## API Client

All calls go through `lib/api.ts` which:
- Reads Firebase `currentUser.getIdToken()` for every request
- Adds `Authorization: Bearer <token>` header
- Returns `{ data, error }` — never throws

```ts
api.get<T>(path)
api.post<T>(path, body)
api.patch<T>(path, body)
api.delete<T>(path)
api.postForm<T>(path, formData)   // multipart uploads
```

SSE streaming (tutor + assistant) uses `fetch` + `ReadableStream` directly, not the `api` wrapper.

---

## Onboarding Flow (10 steps)

1. Grade level selection
2. Subject selection (multi-select)
3. Learning style (visual/auditory/reading/kinesthetic)
4. Study struggles (multi-select)
5. Main goal
6. Focus struggles callout *(conditional — only if focus struggles selected in step 4)*
7. Upcoming test *(skippable)*
8. GPA + goal GPA + hours/week *(skippable)*
9. Demo video
10. Social proof (rotating stats)

Data persisted to `localStorage` at each step. Synced to `/profile/sync` after OAuth completes in `AuthContext`.

---

## Scripts

```bash
npm run dev     # Next.js dev server (port 3000)
npm run build   # Production build
npm run start   # Start production server
npm run lint    # ESLint
```

---

## Environment Variables

```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
NEXT_PUBLIC_API_URL                    # Backend URL (e.g. https://your-api.railway.app)
STRIPE_SECRET_KEY                      # Server-side only (webhook handler)
STRIPE_WEBHOOK_SECRET                  # Server-side only
```
