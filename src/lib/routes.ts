import type { Href } from 'expo-router';

/**
 * The Today tab (`src/app/(tabs)/index.tsx`) is served at "/". The typed-routes generator
 * currently lists it as "/index", so we pin the canonical href here in one place.
 */
export const HOME_HREF = '/' as Href;
