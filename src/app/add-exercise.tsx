import { router, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Chip, Stepper } from '@/components/ui/controls';
import { Screen, SectionHeader } from '@/components/ui/screen';
import { AppText } from '@/components/ui/text';
import { Spacing } from '@/constants/theme';
import { useProfile } from '@/data/profile-store';
import { addExercise } from '@/data/repos/activity-logs';
import { ACTIVITIES, type Activity } from '@/features/exercise/activities';
import { kcalBurned } from '@/features/exercise/burn';
import { useTheme } from '@/hooks/use-theme';
import { toDateKey } from '@/lib/date';
import { success } from '@/lib/feedback';

const KIND_LABELS: Record<Activity['kind'], string> = {
  cardio: 'Cardio',
  strength: 'Strength',
  mobility: 'Mobility',
  sport: 'Sports',
  daily: 'Everyday',
};

export default function AddExercise() {
  const { date = toDateKey() } = useLocalSearchParams<{ date?: string }>();
  const db = useSQLiteContext();
  const t = useTheme();
  const profile = useProfile();
  const [activity, setActivity] = useState<Activity>(ACTIVITIES[1]);
  const [minutes, setMinutes] = useState(30);

  const kcal = kcalBurned(activity.met, profile?.weightKg ?? 70, minutes);
  const kinds = Object.keys(KIND_LABELS) as Activity['kind'][];

  const save = async () => {
    await addExercise(db, { date, activityId: activity.id, name: activity.name, minutes, kcal });
    success();
    router.back();
  };

  return (
    <Screen tab={false}>
      {kinds.map((kind) => (
        <View key={kind} style={{ gap: Spacing.two }}>
          <SectionHeader title={KIND_LABELS[kind]} />
          <View style={styles.chips}>
            {ACTIVITIES.filter((a) => a.kind === kind).map((a) => (
              <Chip key={a.id} label={a.name} selected={a.id === activity.id} onPress={() => setActivity(a)} />
            ))}
          </View>
        </View>
      ))}

      <SectionHeader title="Duration" />
      <Card index={1}>
        <Stepper value={minutes} onChange={setMinutes} step={5} min={0} max={600} suffix="minutes" />
      </Card>

      <Card index={2} tone="accent" style={{ gap: 2 }}>
        <AppText variant="label" style={{ color: t.onAccent, opacity: 0.7 }}>
          {activity.name} · MET {activity.met}
        </AppText>
        <AppText variant="hero" style={{ color: t.onAccent }}>
          {kcal}
          <AppText variant="h2" style={{ color: t.onAccent }}>
            {' '}kcal burned
          </AppText>
        </AppText>
      </Card>

      <Button label="Log activity" icon="check" size="lg" disabled={minutes <= 0} onPress={save} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
});
