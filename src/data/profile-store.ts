import { kv } from './kv';
import { useSyncExternalStore } from 'react';

import { DEFAULT_SETTINGS, type Profile, type Settings } from '@/features/health/types';

/**
 * Profile + settings live in a sync key-value store (sqlite kv on native, localStorage on web),
 * cached in memory and exposed through useSyncExternalStore so every screen
 * re-renders on change without a state library.
 */
const PROFILE_KEY = 'fitchecker.profile.v1';
const SETTINGS_KEY = 'fitchecker.settings.v1';

function read<T>(key: string): T | null {
  try {
    const raw = kv.get(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

let profile: Profile | null = read<Profile>(PROFILE_KEY);
let settings: Settings = { ...DEFAULT_SETTINGS, ...(read<Settings>(SETTINGS_KEY) ?? {}) };

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
};

export function getProfile() {
  return profile;
}

export function saveProfile(next: Profile) {
  profile = next;
  kv.set(PROFILE_KEY, JSON.stringify(next));
  emit();
}

export function updateProfile(patch: Partial<Profile>) {
  if (!profile) return;
  saveProfile({ ...profile, ...patch });
}

export function getSettings() {
  return settings;
}

export function updateSettings(patch: Partial<Settings>) {
  settings = { ...settings, ...patch };
  kv.set(SETTINGS_KEY, JSON.stringify(settings));
  emit();
}

export function clearProfile() {
  profile = null;
  settings = { ...DEFAULT_SETTINGS };
  kv.remove(PROFILE_KEY);
  kv.remove(SETTINGS_KEY);
  emit();
}

export function useProfile() {
  return useSyncExternalStore(subscribe, getProfile, getProfile);
}

export function useSettings() {
  return useSyncExternalStore(subscribe, getSettings, getSettings);
}
