import { useSQLiteContext } from 'expo-sqlite';
import { StyleSheet, View } from 'react-native';

import { IconButton } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ProgressBar } from '@/components/ui/controls';
import { Icon, type IconName } from '@/components/ui/icon';
import { AppText } from '@/components/ui/text';
import { Radius, Spacing, type ThemeColor } from '@/constants/theme';
import { addWater } from '@/data/repos/activity-logs';
import type { Insight } from '@/features/coach/types';
import { formatMl } from '@/features/health/units';
import { useTheme } from '@/hooks/use-theme';
import type { DateKey } from '@/lib/date';

export function Stat({ label, value, icon, color }: { label: string; value: string; icon: IconName; color: ThemeColor }) {
  const t = useTheme();
  return (
    <View style={styles.stat}>
      <View style={styles.statLabel}>
        <Icon name={icon} size={13} color={t[color]} />
        <AppText variant="label">{label}</AppText>
      </View>
      <AppText variant="number">{value}</AppText>
    </View>
  );
}

const GLASS = 250;

export function WaterCard({ date, ml, goal }: { date: DateKey; ml: number; goal: number }) {
  const db = useSQLiteContext();
  const t = useTheme();
  const glasses = Math.round(ml / GLASS);
  const goalGlasses = Math.round(goal / GLASS);
  return (
    <Card>
      <View style={styles.rowBetween}>
        <View style={{ gap: 2 }}>
          <View style={styles.statLabel}>
            <Icon name="water" size={13} color={t.water} />
            <AppText variant="label">Water</AppText>
          </View>
          <AppText variant="number">
            {formatMl(ml)}
            <AppText variant="caption"> / {formatMl(goal)}</AppText>
          </AppText>
        </View>
        <View style={styles.row}>
          <IconButton icon="remove" label="Remove a glass of water" onPress={() => addWater(db, date, -GLASS)} />
          <IconButton icon="add" label="Add a glass of water" tone="accent" onPress={() => addWater(db, date, GLASS)} />
        </View>
      </View>
      <View style={styles.glasses} accessible accessibilityLabel={`${glasses} of ${goalGlasses} glasses`}>
        {Array.from({ length: Math.max(goalGlasses, glasses) }, (_, i) => (
          <View key={i} style={[styles.glass, { backgroundColor: i < glasses ? t.water : t.track }]} />
        ))}
      </View>
    </Card>
  );
}

const TONE: Record<Insight['tone'], { icon: IconName; color: ThemeColor }> = {
  good: { icon: 'checkCircle', color: 'good' },
  warn: { icon: 'warn', color: 'warn' },
  info: { icon: 'bolt', color: 'accent' },
};

export function InsightCard({ insight }: { insight: Insight }) {
  const t = useTheme();
  const tone = TONE[insight.tone];
  return (
    <Card tone="glass" style={styles.insight}>
      <View style={[styles.insightIcon, { backgroundColor: t.backgroundSelected }]}>
        <Icon name={tone.icon} size={16} color={t[tone.color]} />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <AppText variant="title">{insight.title}</AppText>
        <AppText variant="caption">{insight.body}</AppText>
      </View>
    </Card>
  );
}

export function GoalBar({ label, value, max, color, suffix }: { label: string; value: number; max: number; color: ThemeColor; suffix: string }) {
  return (
    <View style={{ gap: 6 }}>
      <View style={styles.rowBetween}>
        <AppText variant="caption">{label}</AppText>
        <AppText variant="caption" color="text">
          {Math.round(value)} / {Math.round(max)} {suffix}
        </AppText>
      </View>
      <ProgressBar value={value} max={max} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: Spacing.two, alignItems: 'center' },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  stat: { flex: 1, gap: 2, alignItems: 'center' },
  statLabel: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  glasses: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginTop: Spacing.three },
  glass: { width: 18, height: 26, borderRadius: 5 },
  insight: { flexDirection: 'row', gap: Spacing.three, alignItems: 'flex-start' },
  insightIcon: { width: 32, height: 32, borderRadius: Radius.pill, alignItems: 'center', justifyContent: 'center' },
});
