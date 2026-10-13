/**
 * The demo keeps its state in the browser so a refresh doesn't lose the bag or an order.
 * Storage can be missing or blocked (private windows, previews), so every call is guarded
 * and the site works without it. Swap these for the real backend.
 */
export function load<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function save(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* Storage is optional. */
  }
}

/**
 * A value kept in storage that React reads with useSyncExternalStore: the server and the
 * first client render see `fallback`, then the saved value, with no effect in between.
 */
export function persisted<T>(key: string, fallback: T) {
  let value: T | undefined;
  const listeners = new Set<() => void>();
  // Objects are merged over the fallback, so fields added later get their default on old saves.
  const read = () => {
    const v = load(key, fallback);
    return fallback && typeof fallback === "object" && !Array.isArray(fallback) ? { ...fallback, ...v } : v;
  };
  const get = () => (value ??= read());
  return {
    get,
    getServer: () => fallback,
    set(next: T | ((v: T) => T)) {
      value = typeof next === "function" ? (next as (v: T) => T)(get()) : next;
      save(key, value);
      listeners.forEach((l) => l());
    },
    subscribe(l: () => void) {
      listeners.add(l);
      return () => { listeners.delete(l); };
    },
  };
}

const never = () => () => {};
/** True once running in the browser after hydration: for "loading" states that wait on storage. */
export const hydrated = [never, () => true, () => false] as const;
