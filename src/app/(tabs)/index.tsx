import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { CalorieRing } from '@/components/charts/calorie-ring';
import { MacroBars } from '@/components/charts/macro-bars';
import { InsightCard, Stat, WaterCard } from '@/components/dashboard';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Screen, SectionHeader } from '@/components/ui/screen';
import { AppText } from '@/components/ui/text';
import { Spacing } from '@/constants/theme';
import { useProfile } from '@/data/profile-store';
import { coach, useDay, usePlan } from '@/hooks/use-fit-data';
import { friendlyDay, greeting, shortDate, toDateKey } from '@/lib/date';

export default function TodayScreen() {
  const profile = useProfile();
  const plan = usePlan();
  const today = toDateKey();
  const day = useDay(today);
  if (!plan || !profile) return null;

  const net = day.summary.eatenKcal - day.summary.burnedKcal;
  const waterGoal = plan.waterMl + (day.summary.exerciseMinutes >= 30 ? 500 : 0);
  const insights = coach.dailyInsights(plan, day.summary).slice(0, 2);
  const fmt = (n: number) => Math.round(n).toLocaleString('en-US');

  return (
    <Screen>
      <View style={styles.header}>
        <AppText variant="label">{shortDate(today)}</AppText>
        <AppText variant="display">
          {greeting()}
          {profile.name ? (
            <AppText variant="display" color="accent">
              {`, ${profile.name.split(' ')[0]}`}
            </AppText>
          ) : null}
        </AppText>
      </View>

      <Card style={styles.hero}>
        <CalorieRing consumed={net} target={plan.calorieTarget} />
        <View style={styles.stats}>
          <Stat label="Eaten" value={fmt(day.summary.eatenKcal)} icon="food" color="accent" />
          <Stat label="Burned" value={fmt(day.summary.burnedKcal)} icon="flame" color="burn" />
          <Stat label="Target" value={fmt(plan.calorieTarget)} icon="bolt" color="textSecondary" />
        </View>
      </Card>

      <View style={styles.actions}>
        <Button label="Add food" icon="add" style={{ flex: 1 }} onPress={() => router.push({ pathname: '/add-food', params: { date: today } })} />
        <Button
          label="Exercise"
          icon="run"
          variant="secondary"
          style={{ flex: 1 }}
          onPress={() => router.push({ pathname: '/add-exercise', params: { date: today } })}
        />
      </View>

      <Card>
        <MacroBars eaten={day.totals} target={plan.macros} />
      </Card>

      <WaterCard date={today} ml={day.summary.waterMl} goal={waterGoal} />

      <SectionHeader title={`Coach · ${friendlyDay(today)}`} />
      {insights.map((i) => (
        <InsightCard key={i.id} insight={i} />
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: 2, marginBottom: Spacing.one },
  hero: { alignItems: 'center', gap: Spacing.four, paddingVertical: Spacing.four },
  stats: { flexDirection: 'row', alignSelf: 'stretch' },
  actions: { flexDirection: 'row', gap: Spacing.three },
});
