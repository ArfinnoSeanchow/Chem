type CacheEntry<T> = { expiresAt: number; value: T };

const cache = new Map<string, CacheEntry<unknown>>();
const MAX_ENTRIES = 250;
const TTL_MS = 60_000;

function prune() {
  const now = Date.now();
  for (const [key, entry] of cache) {
    if (entry.expiresAt <= now) cache.delete(key);
  }
  while (cache.size > MAX_ENTRIES) {
    const first = cache.keys().next().value;
    if (!first) break;
    cache.delete(first);
  }
}

export function getCached<T>(key: string): T | undefined {
  const entry = cache.get(key);
  if (!entry) return undefined;
  if (entry.expiresAt <= Date.now()) {
    cache.delete(key);
    return undefined;
  }
  return entry.value as T;
}

export function setCached<T>(key: string, value: T, ttl = TTL_MS) {
  prune();
  cache.set(key, { expiresAt: Date.now() + ttl, value });
}

export function cacheKey(...parts: string[]) {
  return parts.map((part) => part.trim().toLowerCase()).join("::");
}
