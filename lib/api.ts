import { auth } from './firebase';
import { cacheGet, cacheSet, invalidatePrefix } from './apiCache';
import { emitContentChanged, emitUsageChanged } from './contentEvents';
import { showPaywall } from './paywall';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4001';

// Mutating any of these changes a number the sidebar shows.
const CONTENT_PREFIXES = new Set([
  '/documents',
  '/notes',
  '/folders',
  '/flashcards',
  '/quizzes',
  '/podcasts',
  '/practice-exams',
]);

function afterMutation(path: string): void {
  const basePath = '/' + path.split('?')[0].split('/')[1];
  invalidatePrefix(basePath);
  if (CONTENT_PREFIXES.has(basePath)) emitContentChanged();
  invalidatePrefix('/billing');
  emitUsageChanged();
}

type ApiResponse<T> = {
  data: T | null;
  error: string | null;
};

/** Every free-tier rejection shares one shape, so the paywall is raised here
 *  once rather than at each of the dozen generate call sites. */
function isFreeLimit(status: number, body: { error?: string }): boolean {
  return status === 403 && body.error === 'free_limit_reached';
}

function raisePaywallOnLimit(status: number, body: { error?: string; limit?: string }): void {
  if (!isFreeLimit(status, body)) return;
  showPaywall(body.limit ?? 'free_limit');
}

/** The raw `free_limit_reached` code would otherwise render as the error line on
 *  whichever form the user was in when the paywall opened over it. */
function errorMessage(status: number, body: { error?: string }): string {
  if (isFreeLimit(status, body)) return "You've hit your free plan limit — upgrade to keep going.";
  return body.error ?? `HTTP ${status}`;
}

async function getIdToken(): Promise<string> {
  const user = auth.currentUser;
  if (!user) throw new Error('No authenticated user');
  return user.getIdToken();
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  signal?: AbortSignal
): Promise<ApiResponse<T>> {
  const isGet = method === 'GET';

  // Return cached data immediately for GET requests
  if (isGet) {
    const cached = cacheGet<T>(path);
    if (cached !== null) return { data: cached, error: null };
  }

  try {
    const token = await getIdToken();
    const response = await fetch(`${API_URL}${path}`, {
      method,
      signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const errorData = (await response.json().catch(() => ({}))) as { error?: string; limit?: string };
      raisePaywallOnLimit(response.status, errorData);
      return { data: null, error: errorMessage(response.status, errorData) };
    }

    // Invalidate related GET cache on mutations before reading body
    if (!isGet) afterMutation(path);

    // 204/205 — no body, nothing to parse
    if (response.status === 204 || response.status === 205) {
      return { data: null, error: null };
    }

    const data = (await response.json()) as T;

    if (isGet && !signal?.aborted) {
      cacheSet(path, data);
    }

    return { data, error: null };
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      return { data: null, error: null };
    }
    const message = err instanceof Error ? err.message : 'An unknown error occurred';
    return { data: null, error: message };
  }
}

async function requestForm<T>(
  method: string,
  path: string,
  body: FormData
): Promise<ApiResponse<T>> {
  try {
    const token = await getIdToken();
    const response = await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        // Do NOT set Content-Type — browser sets it with correct multipart boundary
      },
      body,
    });

    if (!response.ok) {
      const errorData = (await response.json().catch(() => ({}))) as { error?: string; limit?: string };
      raisePaywallOnLimit(response.status, errorData);
      return { data: null, error: errorMessage(response.status, errorData) };
    }

    const data = (await response.json()) as T;

    afterMutation(path);

    return { data, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'An unknown error occurred';
    return { data: null, error: message };
  }
}

export { invalidatePrefix, invalidateAll } from './apiCache';

export const api = {
  get: <T>(path: string, signal?: AbortSignal) => request<T>('GET', path, undefined, signal),
  post: <T>(path: string, body: unknown, signal?: AbortSignal) => request<T>('POST', path, body, signal),
  put: <T>(path: string, body: unknown, signal?: AbortSignal) => request<T>('PUT', path, body, signal),
  patch: <T>(path: string, body: unknown, signal?: AbortSignal) => request<T>('PATCH', path, body, signal),
  delete: <T>(path: string, signal?: AbortSignal) => request<T>('DELETE', path, undefined, signal),
  postForm: <T>(path: string, body: FormData) => requestForm<T>('POST', path, body),
};
