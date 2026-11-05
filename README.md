# Studymo Web

The web app for Studymo, an AI study tool. Students upload lecture material (PDFs, audio, YouTube videos, web pages, or their own notes) and Studymo turns it into notes, flashcards, quizzes, practice exams, podcasts, and study plans, with an AI tutor that knows what they're weak at.

This repo is the Next.js frontend. All AI processing, data storage, and billing happen in the separate Studymo API, which this app talks to over HTTP.

## Features

- **Document library**: upload a PDF, audio recording, YouTube link, or web page, or start a blank note. Each upload is processed in the background into notes, flashcards, and a quiz.
- **Notes editor**: rich-text editor with autosave, AI "simplify" on selected text, and public share links.
- **Flashcards and quizzes**: generated from each document. Wrong answers are tracked as weak topics.
- **Practice exams**: timed exams that span several documents, with progress saved as you go and AI grading for short answers.
- **AI tutor**: streaming chat with five teaching modes. It can see your notes, weak topics, and active study plan.
- **Study plans**: a day-by-day schedule built from your documents, test date, and weak topics.
- **Podcasts**: turns a document's notes into a spoken audio lecture.
- **Tasks, study timer, and analytics**: to-dos, focus sessions, quiz history, and an activity heatmap with streaks.
- **Free tier and subscriptions**: fixed free quotas, with a paywall that opens when a quota runs out. Checkout is handled by Stripe through the API.

## Tech stack

- [Next.js 14](https://nextjs.org) (App Router) + TypeScript
- Tailwind CSS, Radix UI primitives, shadcn/ui-style components
- Firebase Authentication (email/password, Google, Apple)
- TipTap (notes editor), react-pdf (PDF preview), framer-motion (animation)
- Mixpanel and Google Analytics (both optional)
- Deployed on Vercel

## Getting started

### Prerequisites

- Node.js 18.17 or newer, and npm
- The **Studymo API** running locally or deployed somewhere you can reach. The app expects it at `http://localhost:4001` by default.
- A **Firebase project** with a Web app registered and these sign-in providers enabled under Authentication → Sign-in method:
  - Email/Password
  - Google
  - Apple (optional; only needed if you use the Apple button)

The API must use the same Firebase project, because it verifies the ID tokens this app sends.

### 1. Install

```bash
git clone https://github.com/LarrySimiyu/studymo-web.git
cd studymo-web
npm install
```

`npm install` also copies the PDF.js worker into `public/` (see the `postinstall` script). The PDF viewer needs it.

### 2. Configure environment variables

Create `.env.local` in the project root:

```bash
# Backend
NEXT_PUBLIC_API_URL=http://localhost:4001

# Firebase (Project settings → General → Your apps → Web app config)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Analytics (optional; leave blank to disable)
NEXT_PUBLIC_MIXPANEL_TOKEN=
NEXT_PUBLIC_GA_MEASUREMENT_ID=
```

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Yes | Base URL of the Studymo API. Falls back to `http://localhost:4001`. |
| `NEXT_PUBLIC_FIREBASE_*` | Yes | Your Firebase Web app config. These values are public by design. |
| `NEXT_PUBLIC_MIXPANEL_TOKEN` | No | Enables Mixpanel event tracking. |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | No | Enables Google Analytics. |

No server secrets live in this app. Stripe keys, the Anthropic key, and database credentials all belong to the API.

### 3. Run

```bash
npm run dev
```

Open [http://localhost:3002](http://localhost:3002).

If the browser shows CORS errors, add `http://localhost:3002` to the API's `ALLOWED_ORIGINS` environment variable.

### Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server on port 3002 |
| `npm run build` | Production build |
| `npm run start` | Serve the production build on port 4000 |
| `npm run lint` | ESLint via `next lint` |

Stop the dev server before running `npm run build`. Both write to `.next/`, and the build clobbers the dev server's chunks.

## Project structure

```
app/                 Routes (App Router)
  dashboard/         Signed-in app, one folder per feature
  blog/              Blog index, post pages, and post content (posts/*.tsx)
  landing/[segment]/ Audience-specific landing pages
  notes/shared/      Public view of a shared note (no auth)
  onboarding/        Post-signup questionnaire
  pricing/           Plans page
components/
  ui/                Shared primitives (Button, Dialog, Input, tabs, badges, ...)
  dashboard/         Sidebar, page shell, headers, cards, heatmap
  library/           Document viewer and its tabs
  upload/            Upload dialog, upload state machine, one form per upload type
  tutor/             Chat surface, input, message bubbles, context picker
  pricing/           Pricing grid and paywall modal
  ...                One folder per remaining feature
context/             React providers (auth, library, tutor sessions, study timer, assistant)
hooks/               Shared hooks (useAuth, useUsage, useTutorChat, usePlanCheckout, ...)
lib/
  api.ts             Fetch client: auth header, GET cache, free-tier paywall interceptor
  api/               One module per API domain (documents, tutor, studyPlan, billing, ...)
  firebase.ts        Firebase app and auth setup
  analytics.ts       Mixpanel wrapper
```

## Where things live

| Feature | Route | Main code |
|---|---|---|
| Home dashboard | `app/dashboard/home` | `components/dashboard/` (planning panel, quiz stats, recommended actions) |
| Document library | `app/dashboard/library` (list in `layout.tsx`, note in `[id]`) | `components/library/DocumentDetail.tsx` |
| Uploads | Opened from the library | `components/upload/UploadDialog.tsx`, `components/upload/useUploadFlow.ts` |
| Flashcards | `app/dashboard/flashcards` | `components/flashcards/FlipCard.tsx` |
| Quizzes | `app/dashboard/quizzes` | `components/quiz/QuizRunner.tsx` |
| Practice exams | `app/dashboard/practice-exams` | `app/dashboard/practice-exams/[id]/page.tsx` |
| AI tutor | `app/dashboard/tutor` (`/dashboard` redirects here) | `components/tutor/TutorSurface.tsx`, `hooks/useTutorChat.ts` |
| Tutor inside a note | Library → AI Tutor | `components/library/TutorPanel.tsx` |
| Study plans | `app/dashboard/study-plan` | `components/dashboard/PlanCard.tsx`, `components/dashboard/PlanCalendar.tsx` |
| Weak topics | `app/dashboard/weak-topics` | `components/dashboard/WeakTopicItem.tsx` |
| Podcasts | `app/dashboard/podcasts` | `components/podcast/` |
| Tasks | `app/dashboard/tasks` | `components/tasks/TasksPanel.tsx` |
| Analytics | `app/dashboard/analytics` | `components/dashboard/ActivityHeatmap.tsx` |
| Settings and billing | `app/dashboard/settings` | `lib/api/billing.ts` |
| Pricing and paywall | `app/pricing` | `components/pricing/PricingGrid.tsx`, `components/pricing/PaywallModal.tsx`, `hooks/usePlanCheckout.ts` |
| Auth | `app/sign-in`, `app/sign-up` | `context/AuthContext.tsx`, `lib/firebase.ts` |

## How it fits together

- **Auth**: Firebase handles sign-in in the browser. Every API request sends the user's Firebase ID token as `Authorization: Bearer <token>`, and the API verifies it.
- **API calls**: components never call `fetch` directly. They go through `lib/api/*`, which wraps `lib/api.ts`. GET responses are cached for 5 minutes. Call `invalidatePrefix('/resource')` from `lib/apiCache.ts` after a mutation that changes cached data.
- **Free tier**: the API enforces quotas. When a request returns `403 free_limit_reached`, `lib/api.ts` opens the paywall automatically. Usage counts come from `hooks/useUsage`.
- **Background processing**: after an upload, the app watches the document's status through a server-sent events stream (`/documents/:id/status-stream`), with polling as a fallback.

## Deploying

The app deploys to Vercel as a standard Next.js project:

1. Import the repo in Vercel.
2. Set the environment variables above, with `NEXT_PUBLIC_API_URL` pointing at your deployed API.
3. Add your Vercel domain to the API's `ALLOWED_ORIGINS` and to Firebase → Authentication → Settings → Authorized domains.
