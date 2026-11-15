import type { Href } from 'expo-router';
import { TabList, Tabs, TabSlot, TabTrigger, type TabTriggerSlotProps } from 'expo-router/ui';
import { Pressable, StyleSheet, View } from 'react-native';

import { Icon, type IconName } from '@/components/ui/icon';
import { AppText } from '@/components/ui/text';
import { MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { HOME_HREF } from '@/lib/routes';

const TABS: { name: string; href: Href; label: string; icon: IconName }[] = [
  { name: 'index', href: HOME_HREF, label: 'Today', icon: 'home' },
  { name: 'log', href: '/log', label: 'Log', icon: 'log' },
  { name: 'progress', href: '/progress', label: 'Progress', icon: 'progress' },
  { name: 'coach', href: '/coach', label: 'Coach', icon: 'coach' },
  { name: 'profile', href: '/profile', label: 'Profile', icon: 'profile' },
];

/** Web: floating glass bottom bar (mobile-first), centered on wide screens. */
export default function AppTabs() {
  const t = useTheme();
  return (
    <Tabs>
      <TabSlot style={{ height: '100%' }} />
      {/* Tabs only finds triggers when TabList is its direct child and TabTriggers are TabList's direct children. */}
      <TabList style={[styles.bar, { backgroundColor: t.backgroundElement, borderColor: t.hairline }]}>
        {TABS.map((tab) => (
          <TabTrigger key={tab.name} name={tab.name} href={tab.href} asChild>
            <TabButton icon={tab.icon}>{tab.label}</TabButton>
          </TabTrigger>
        ))}
      </TabList>
    </Tabs>
  );
}

function TabButton({ children, isFocused, icon, ref: _ref, ...props }: TabTriggerSlotProps & { icon: IconName }) {
  const t = useTheme();
  return (
    <Pressable {...props} style={({ pressed }) => [styles.btn, pressed && { opacity: 0.7 }]}>
      <View style={[styles.pill, isFocused && { backgroundColor: 'rgba(52,168,83,0.14)' }]}>
        <Icon name={icon} size={20} color={isFocused ? t.accent : t.textSecondary} />
      </View>
      <AppText variant="caption" style={{ fontSize: 11, color: isFocused ? t.text : t.textSecondary }}>
        {children}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bar: {
    // Floating bar: inset from the edges, capped width, centered via auto margins.
    position: 'absolute',
    bottom: Spacing.three,
    left: Spacing.three,
    right: Spacing.three,
    marginHorizontal: 'auto',
    flexDirection: 'row',
    maxWidth: MaxContentWidth,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.one,
  },
  btn: { flex: 1, alignItems: 'center', gap: 2 },
  pill: { paddingHorizontal: 16, paddingVertical: 4, borderRadius: Radius.pill },
});
