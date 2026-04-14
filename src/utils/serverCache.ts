type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

export function createTtlCache<T>(defaultTtlMs: number) {
  const store = new Map<string, CacheEntry<T>>();

  return {
    get(key: string): T | undefined {
      const entry = store.get(key);
      if (!entry) return undefined;
      if (Date.now() > entry.expiresAt) {
        store.delete(key);
        return undefined;
      }
      return entry.value;
    },
    set(key: string, value: T, ttlMs = defaultTtlMs): void {
      store.set(key, { value, expiresAt: Date.now() + ttlMs });
    },
  };
}
