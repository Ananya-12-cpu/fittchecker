import { SymbolView, type AndroidSymbol } from 'expo-symbols';
import type { SFSymbol } from 'sf-symbols-typescript';

import { useTheme } from '@/hooks/use-theme';

/** One name → SF Symbol on iOS, Material Symbol on Android & web. */
export const ICONS = {
  home: { ios: 'flame.fill', md: 'local_fire_department' },
  log: { ios: 'fork.knife', md: 'restaurant' },
  progress: { ios: 'chart.bar.fill', md: 'bar_chart' },
  coach: { ios: 'sparkles', md: 'psychology' },
  profile: { ios: 'person.crop.circle.fill', md: 'person' },
  add: { ios: 'plus', md: 'add' },
  remove: { ios: 'minus', md: 'remove' },
  close: { ios: 'xmark', md: 'close' },
  left: { ios: 'chevron.left', md: 'chevron_left' },
  right: { ios: 'chevron.right', md: 'chevron_right' },
  flame: { ios: 'flame.fill', md: 'local_fire_department' },
  water: { ios: 'drop.fill', md: 'water_drop' },
  dumbbell: { ios: 'dumbbell.fill', md: 'fitness_center' },
  run: { ios: 'figure.run', md: 'directions_run' },
  walk: { ios: 'figure.walk', md: 'directions_walk' },
  yoga: { ios: 'figure.mind.and.body', md: 'self_improvement' },
  search: { ios: 'magnifyingglass', md: 'search' },
  check: { ios: 'checkmark', md: 'check' },
  checkCircle: { ios: 'checkmark.circle.fill', md: 'check_circle' },
  trash: { ios: 'trash', md: 'delete' },
  scale: { ios: 'scalemass.fill', md: 'monitor_weight' },
  heart: { ios: 'heart.fill', md: 'favorite' },
  bolt: { ios: 'bolt.fill', md: 'bolt' },
  moon: { ios: 'moon.fill', md: 'bedtime' },
  down: { ios: 'arrow.down.right', md: 'trending_down' },
  up: { ios: 'arrow.up.right', md: 'trending_up' },
  info: { ios: 'info.circle.fill', md: 'info' },
  warn: { ios: 'exclamationmark.triangle.fill', md: 'warning' },
  edit: { ios: 'pencil', md: 'edit' },
  reset: { ios: 'arrow.counterclockwise', md: 'restart_alt' },
  calendar: { ios: 'calendar', md: 'calendar_today' },
  food: { ios: 'carrot.fill', md: 'nutrition' },
} as const satisfies Record<string, { ios: SFSymbol; md: AndroidSymbol }>;

export type IconName = keyof typeof ICONS;

export function Icon({ name, size = 20, color }: { name: IconName; size?: number; color?: string }) {
  const theme = useTheme();
  const i = ICONS[name];
  return (
    <SymbolView
      name={{ ios: i.ios, android: i.md, web: i.md }}
      size={size}
      tintColor={color ?? theme.text}
      weight="semibold"
    />
  );
}
