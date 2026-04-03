import { auth } from './firebase';
import { cacheGet, cacheSet, invalidatePrefix } from './apiCache';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

type ApiResponse<T> = {
  data: T | null;
  error: string | null;
};

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
      const errorData = (await response.json().catch(() => ({}))) as { error?: string };
      return { data: null, error: errorData.error ?? `HTTP ${response.status}` };
    }

    const data = (await response.json()) as T;

    if (isGet && !signal?.aborted) {
      cacheSet(path, data);
    }

    // Invalidate related GET cache on mutations
    if (!isGet) {
      // Use top-level resource (e.g. '/notes' from '/notes/abc123') so mutations
      // correctly invalidate GET endpoints that use different IDs (note ID vs document ID)
      const segments = path.split('?')[0].split('/');
      const basePath = '/' + segments[1];
      invalidatePrefix(basePath);
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
      const errorData = (await response.json().catch(() => ({}))) as { error?: string };
      return { data: null, error: errorData.error ?? `HTTP ${response.status}` };
    }

    const data = (await response.json()) as T;
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
