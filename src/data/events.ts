import { useSyncExternalStore } from 'react';

/**
 * Tiny invalidation bus: any write bumps the version, and every data hook
 * that reads `useDataVersion()` re-queries. Cheap and enough for on-device data.
 */
let version = 0;
const listeners = new Set<() => void>();

export function invalidate() {
  version += 1;
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useDataVersion() {
  return useSyncExternalStore(subscribe, () => version, () => version);
}
