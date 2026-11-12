/**
 * Synchronous key-value storage (web): localStorage.
 * expo-sqlite's sync API on web needs SharedArrayBuffer (cross-origin isolation
 * + secure context), which isn't available on LAN IPs, Safari, or static hosts.
 */
const ls = () => (typeof localStorage === 'undefined' ? null : localStorage);

export const kv = {
  get: (key: string): string | null => ls()?.getItem(key) ?? null,
  set: (key: string, value: string) => ls()?.setItem(key, value),
  remove: (key: string) => ls()?.removeItem(key),
};
