import { NativeTabs } from 'expo-router/unstable-native-tabs';

import { ICONS } from '@/components/ui/icon';
import { useTheme } from '@/hooks/use-theme';

// SDK 57: native tabs live at `expo-router/unstable-native-tabs` (moves to `expo-router/native-tabs` in SDK 58).
const TABS = [
  { name: 'index', label: 'Today', icon: ICONS.home },
  { name: 'log', label: 'Log', icon: ICONS.log },
  { name: 'progress', label: 'Progress', icon: ICONS.progress },
  { name: 'coach', label: 'Coach', icon: ICONS.coach },
  { name: 'profile', label: 'Profile', icon: ICONS.profile },
] as const;

export default function AppTabs() {
  const t = useTheme();
  return (
    <NativeTabs
      backgroundColor={t.background}
      indicatorColor={t.backgroundSelected}
      tintColor={t.accent}
      iconColor={{ default: t.textSecondary, selected: t.accent }}
      labelStyle={{ default: { color: t.textSecondary }, selected: { color: t.text } }}
    >
      {TABS.map((tab) => (
        <NativeTabs.Trigger key={tab.name} name={tab.name}>
          <NativeTabs.Trigger.Label>{tab.label}</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon sf={tab.icon.ios} md={tab.icon.md} />
        </NativeTabs.Trigger>
      ))}
    </NativeTabs>
  );
}
