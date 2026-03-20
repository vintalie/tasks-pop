/**
 * Offline cache for API data.
 * Stores responses in localStorage for offline access.
 * Syncs when online.
 */

const CACHE_PREFIX = 'tasks-pop-cache-';
const CACHE_VERSION = 1;
const MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24h

interface CacheEntry<T> {
  data: T;
  fetchedAt: number;
  version: number;
}

function storageKey(key: string): string {
  return `${CACHE_PREFIX}${key}`;
}

export function getCached<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(storageKey(key));
    if (!raw) return null;
    const entry = JSON.parse(raw) as CacheEntry<T>;
    if (entry.version !== CACHE_VERSION) return null;
    if (Date.now() - entry.fetchedAt > MAX_AGE_MS) return null;
    return entry.data;
  } catch {
    return null;
  }
}

export function setCached<T>(key: string, data: T): void {
  try {
    const entry: CacheEntry<T> = {
      data,
      fetchedAt: Date.now(),
      version: CACHE_VERSION,
    };
    localStorage.setItem(storageKey(key), JSON.stringify(entry));
  } catch {
    // localStorage full - ignore
  }
}

export function invalidateCache(key?: string): void {
  if (key) {
    localStorage.removeItem(storageKey(key));
    return;
  }
  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k?.startsWith(CACHE_PREFIX)) keys.push(k);
  }
  keys.forEach((k) => localStorage.removeItem(k));
}
