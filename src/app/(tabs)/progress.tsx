import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { StyleSheet, View } from 'react-native';

import { WeekBars } from '@/components/charts/week-bars';
import { Stat } from '@/components/dashboard';
import { Button, IconButton } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { EmptyState, Screen, SectionHeader } from '@/components/ui/screen';
import { AppText } from '@/components/ui/text';
import { Spacing } from '@/constants/theme';
import { useSettings } from '@/data/profile-store';
import { deleteWeight } from '@/data/repos/activity-logs';
import { formatWeight, weightIn, weightUnit } from '@/features/health/units';
import { usePlan, useWeek, useWeights } from '@/hooks/use-fit-data';
import { useTheme } from '@/hooks/use-theme';
import { friendlyDay } from '@/lib/date';
import { confirmAction } from '@/lib/feedback';

export default function ProgressScreen() {
  const t = useTheme();
  const db = useSQLiteContext();
  const plan = usePlan();
  const { units } = useSettings();
  const { data: week } = useWeek();
  const { data: weights } = useWeights();
  if (!plan) return null;

  const logged = week.filter((d) => d.eaten > 0);
  const avg = logged.length ? Math.round(logged.reduce((s, d) => s + d.eaten, 0) / logged.length) : 0;
  const onTarget = logged.filter((d) => Math.abs(d.eaten - d.burned - plan.calorieTarget) <= plan.calorieTarget * 0.1).length;
  const burned = week.reduce((s, d) => s + d.burned, 0);

  const first = weights[weights.length - 1];
  const latest = weights[0];
  const change = first && latest ? latest.kg - first.kg : 0;

  return (
    <Screen>
      <AppText variant="display">Progress</AppText>

      <Card style={{ gap: Spacing.three }}>
        <View>
          <AppText variant="label">Last 7 days</AppText>
          <AppText variant="h2">Calories eaten</AppText>
        </View>
        <WeekBars days={week} target={plan.calorieTarget} />
        <View style={styles.stats}>
          <Stat label="Daily avg" value={avg ? avg.toLocaleString('en-US') : '—'} icon="food" color="accent" />
          <Stat label="On target" value={`${onTarget}/7`} icon="checkCircle" color="good" />
          <Stat label="Burned" value={burned.toLocaleString('en-US')} icon="flame" color="burn" />
        </View>
      </Card>

      <SectionHeader title="Weight history" action={<Button label="Log weight" icon="scale" variant="ghost" onPress={() => router.push('/log-weight')} />} />

      {latest ? (
        <Card style={styles.summary}>
          <View style={{ flex: 1 }}>
            <AppText variant="label">Current</AppText>
            <AppText variant="display">
              {weightIn(latest.kg, units)}
              <AppText variant="h2" color="textSecondary">
                {' '}
                {weightUnit(units)}
              </AppText>
            </AppText>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <AppText variant="label">Since start</AppText>
            <View style={styles.delta}>
              {Math.abs(change) >= 0.05 && <Icon name={change < 0 ? 'down' : 'up'} size={16} color={change < 0 === (plan.goal !== 'gain') ? t.good : t.warn} />}
              <AppText variant="number">
                {change > 0 ? '+' : ''}
                {formatWeight(change, units)}
              </AppText>
            </View>
            <AppText variant="caption">target {formatWeight(plan.targetWeightKg, units)}</AppText>
          </View>
        </Card>
      ) : null}

      <Card padded={false}>
        {weights.length === 0 ? (
          <EmptyState icon="scale" title="No weigh-ins yet" body="Log your weight weekly to track the trend." />
        ) : (
          weights.map((w, i) => {
            const prev = weights[i + 1];
            const d = prev ? w.kg - prev.kg : 0;
            return (
              <View key={w.id} style={[styles.row, i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: t.hairline }]}>
                <View style={{ flex: 1 }}>
                  <AppText variant="title">{formatWeight(w.kg, units)}</AppText>
                  <AppText variant="caption">
                    {friendlyDay(w.date)}
                    {w.note ? ` · ${w.note}` : ''}
                  </AppText>
                </View>
                {prev && Math.abs(d) >= 0.05 ? (
                  <AppText variant="caption" style={{ color: d < 0 ? t.good : t.warn }}>
                    {d > 0 ? '+' : ''}
                    {formatWeight(d, units)}
                  </AppText>
                ) : null}
                <IconButton
                  icon="close"
                  tone="plain"
                  size={32}
                  label="Delete weigh-in"
                  onPress={async () => {
                    if (await confirmAction('Delete weigh-in?', `${formatWeight(w.kg, units)} on ${friendlyDay(w.date)}`)) deleteWeight(db, w.id);
                  }}
                />
              </View>
            );
          })
        )}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  stats: { flexDirection: 'row' },
  summary: { flexDirection: 'row', alignItems: 'center' },
  delta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, paddingVertical: Spacing.three - 2, paddingHorizontal: Spacing.three + 4 },
});
