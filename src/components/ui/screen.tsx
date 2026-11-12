import type { ReactNode } from 'react';
import { Platform, ScrollView, StyleSheet, View, type ScrollViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { Icon, type IconName } from './icon';
import { AppText } from './text';

type ScreenProps = ScrollViewProps & {
  children: ReactNode;
  /** Tab screens draw their own large title under the status bar. */
  tab?: boolean;
};

/** Scrollable, centered, max-width page. */
export function Screen({ children, tab = true, contentContainerStyle, ...rest }: ScreenProps) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const bottom = tab ? BottomTabInset + insets.bottom + (Platform.OS === 'web' ? 96 : Spacing.four) : insets.bottom + Spacing.five;
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: t.background }}
      contentContainerStyle={[
        styles.content,
        { paddingTop: tab ? insets.top + Spacing.three : Spacing.three, paddingBottom: bottom },
        contentContainerStyle,
      ]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      {...rest}
    >
      {children}
    </ScrollView>
  );
}

export function SectionHeader({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <View style={styles.section}>
      <AppText variant="label">{title}</AppText>
      {action}
    </View>
  );
}

export function EmptyState({ icon, title, body }: { icon: IconName; title: string; body?: string }) {
  const t = useTheme();
  return (
    <View style={styles.empty}>
      <View style={[styles.emptyIcon, { backgroundColor: t.backgroundSelected }]}>
        <Icon name={icon} size={22} color={t.textSecondary} />
      </View>
      <AppText variant="title" center>
        {title}
      </AppText>
      {body ? (
        <AppText variant="caption" center>
          {body}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.three + 4,
    gap: Spacing.three,
  },
  section: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: Spacing.two },
  empty: { alignItems: 'center', gap: Spacing.two, paddingVertical: Spacing.four },
  emptyIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
});
