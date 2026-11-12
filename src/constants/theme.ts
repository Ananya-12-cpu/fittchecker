/**
 * FitChecker design tokens — "dark-first neon".
 * Charcoal base, electric-lime accent, bold numerals, glass cards.
 * A light palette exists for system light mode, but dark is the hero.
 */

import '@/global.css';

import { Platform } from 'react-native';

const shared = {
  accent: '#C6FF3D',
  onAccent: '#0B0C0F',
  protein: '#3DDCFF',
  carbs: '#FFB547',
  fat: '#FF5FA2',
  water: '#4D9CFF',
  burn: '#FF7A45',
  good: '#4ADE80',
  warn: '#FBBF24',
  danger: '#F87171',
} as const;

export const Colors = {
  dark: {
    ...shared,
    text: '#F5F7FA',
    textSecondary: '#9AA0AA',
    textMuted: '#5C626C',
    background: '#0B0C0F',
    backgroundElement: '#15171C',
    backgroundSelected: '#22252C',
    glass: 'rgba(255,255,255,0.06)',
    hairline: 'rgba(255,255,255,0.10)',
    track: 'rgba(255,255,255,0.08)',
  },
  light: {
    ...shared,
    accent: '#7BB800',
    onAccent: '#FFFFFF',
    text: '#0B0C0F',
    textSecondary: '#5A606A',
    textMuted: '#9AA0AA',
    background: '#F6F7F4',
    backgroundElement: '#FFFFFF',
    backgroundSelected: '#ECEEE8',
    glass: 'rgba(11,12,15,0.04)',
    hairline: 'rgba(11,12,15,0.08)',
    track: 'rgba(11,12,15,0.07)',
  },
} as const;

export type Palette = { [K in keyof typeof Colors.dark]: string };
export type ThemeColor = keyof Palette;

/** Bold display face for headings & numerals (loaded in the root layout). */
export const DisplayFont = {
  bold: 'SpaceGrotesk_700Bold',
  semibold: 'SpaceGrotesk_600SemiBold',
  medium: 'SpaceGrotesk_500Medium',
} as const;

export const Fonts = Platform.select({
  ios: { sans: 'system-ui', serif: 'ui-serif', rounded: 'ui-rounded', mono: 'ui-monospace' },
  default: { sans: 'normal', serif: 'serif', rounded: 'normal', mono: 'monospace' },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const Radius = {
  sm: 12,
  md: 16,
  lg: 24,
  pill: 999,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 640;
