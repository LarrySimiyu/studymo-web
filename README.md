# boilerplate-web

Next.js 14 App Router frontend for AI-powered web apps. Includes Firebase Auth, Stripe subscriptions, a typed API client, and a complete landing page + dashboard shell.

## Stack

- **Framework**: Next.js 14 App Router + TypeScript (strict)
- **Styling**: Tailwind CSS + shadcn/ui components
- **Auth**: Firebase Auth (email/password)
- **Payments**: Stripe (checkout + webhooks)
- **Deploy**: Vercel

## Quick Start

### 1. Clone and install

```bash
git clone <repo-url>
cd boilerplate-web
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Fill in all values in `.env.local`.

### 3. Run in development

```bash
npm run dev
```

App starts at `http://localhost:3001` (or 3000 if the API is not running).

## Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase Web API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID |
| `NEXT_PUBLIC_API_URL` | Backend API URL (boilerplate-api) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key (safe for browser) |
| `STRIPE_SECRET_KEY` | Stripe secret key (server only) |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |

## Key Patterns

### Making authenticated API calls

```typescript
import { api } from '@/lib/api';

const { data, error } = await api.get<MyType>('/some-endpoint');
const { data, error } = await api.post<ResponseType>('/endpoint', { key: 'value' });
```

The `api` wrapper automatically attaches the Firebase ID token as a Bearer header.

### Protecting routes

Wrap your page/layout with the dashboard layout — it redirects to `/sign-in` if no user is authenticated.

## Deploying to Vercel

1. Push repo to GitHub
2. Import project in Vercel dashboard
3. Set all environment variables
4. Vercel auto-deploys on push
