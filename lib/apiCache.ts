/**
 * Simple in-memory cache for GET API responses.
 * Keyed by URL path. Mutations to a path prefix invalidate matching entries.
 */

const TTL_MS = 5 * 60 * 1000; // 5 minutes

interface CacheEntry {
  data: unknown;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();

export function cacheGet<T>(path: string): T | null {
  const entry = cache.get(path);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(path);
    return null;
  }
  return entry.data as T;
}

export function cacheSet(path: string, data: unknown): void {
  cache.set(path, { data, expiresAt: Date.now() + TTL_MS });
}

/**
 * Invalidate all cache entries whose key starts with the given prefix.
 * e.g. invalidatePrefix('/tasks') clears '/tasks', '/tasks?completed=true', etc.
 */
export function invalidatePrefix(prefix: string): void {
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) cache.delete(key);
  }
}

export function invalidateAll(): void {
  cache.clear();
}
