/**
 * FitChecker design tokens — "dark-first neon".
 * Charcoal base, electric-lime accent, bold numerals, glass cards.
 * A light palette exists for system light mode, but dark is the hero.
 */

import '@/global.css';

import { Platform } from 'react-native';

const shared = {
  accent: '#34A853', // green
  accentAlt: '#F59E0B', // orange (gradient partner)
  onAccent: '#12160E', // dark text stays readable on the blue/orange gradient stops
  protein: '#34A853',
  carbs: '#3AA0FF', // blue
  fat: '#F97316', // orange
  water: '#86B79A', // sage
  burn: '#F97316',
  good: '#34A853',
  warn: '#F59E0B',
  danger: '#EA580C',
} as const;

export const Colors = {
  dark: {
    ...shared,
    accent: '#4ADE80',
    onAccent: '#13170F',
    text: '#F1F2F0',
    textSecondary: '#A3A7A0',
    textMuted: '#6B6F68',
    background: '#1B1D1A',
    backgroundElement: '#252823',
    backgroundSelected: '#31352E',
    glass: 'rgba(255,255,255,0.06)',
    hairline: 'rgba(255,255,255,0.10)',
    track: 'rgba(255,255,255,0.09)',
  },
  light: {
    ...shared,
    text: '#1F2421',
    textSecondary: '#5C645E',
    textMuted: '#98A09A',
    background: '#E9EBE8', // light gray
    backgroundElement: '#F6F7F5',
    backgroundSelected: '#DADDD8',
    glass: 'rgba(31,36,33,0.04)',
    hairline: 'rgba(31,36,33,0.10)',
    track: 'rgba(31,36,33,0.08)',
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

/** Bold, unusual gradients: green → blue → pink → orange. */
export const Gradients = {
  hero: ['#2FBF71', '#2DA8F0', '#FF5FA2', '#FF8A1F'],
  heroDark: ['#3DDC84', '#4BB5FF', '#FF6FB0', '#FF7A1A'],
  /** Soft wash behind screens (fades into the page background). */
  wash: ['rgba(47,191,113,0.30)', 'rgba(56,160,255,0.18)', 'rgba(255,95,162,0.10)', 'rgba(255,138,31,0)'],
} as const;
