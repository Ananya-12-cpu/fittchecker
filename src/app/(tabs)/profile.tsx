import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { Button, IconButton } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Segmented } from '@/components/ui/controls';
import { EmptyState, Screen, SectionHeader } from '@/components/ui/screen';
import { AppText } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import { wipeAllData } from '@/data/db';
import { clearProfile, updateSettings, useProfile, useSettings } from '@/data/profile-store';
import { deleteCustomFood } from '@/data/repos/custom-foods';
import { invalidate } from '@/data/events';
import { ageFrom } from '@/features/health/energy';
import { ACTIVITY_LEVELS, GOALS } from '@/features/health/types';
import { formatHeight, formatWeight } from '@/features/health/units';
import { useCustomFoods } from '@/hooks/use-fit-data';
import { useTheme } from '@/hooks/use-theme';
import { confirmAction } from '@/lib/feedback';
import { enter, listLayout, rowIn, rowOut } from '@/lib/motion';

export default function ProfileScreen() {
  const t = useTheme();
  const db = useSQLiteContext();
  const profile = useProfile();
  const settings = useSettings();
  const { data: customFoods } = useCustomFoods();
  if (!profile) return null;

  const initials = (profile.name || 'You')
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const rows: [string, string][] = [
    ['Age', `${ageFrom(profile.birthYear)} years`],
    ['Sex', profile.sex === 'male' ? 'Male' : 'Female'],
    ['Height', formatHeight(profile.heightCm, settings.units)],
    ['Weight', formatWeight(profile.weightKg, settings.units)],
    ['Activity', ACTIVITY_LEVELS.find((a) => a.id === profile.activity)?.label ?? ''],
    ['Goal', GOALS.find((g) => g.id === profile.goal)?.label ?? ''],
    ['Target', profile.targetWeightKg ? formatWeight(profile.targetWeightKg, settings.units) : 'Coach decides'],
  ];

  const reset = async () => {
    const ok = await confirmAction('Reset everything?', 'This permanently deletes your profile, logs, weigh-ins and custom foods.', 'Reset');
    if (!ok) return;
    await wipeAllData(db);
    clearProfile();
    invalidate();
    router.replace('/onboarding');
  };

  return (
    <Screen>
      <Animated.View entering={enter(0)} style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: t.accent }]}>
          <AppText variant="h1" style={{ color: t.onAccent }}>
            {initials}
          </AppText>
        </View>
        <View style={{ flex: 1 }}>
          <AppText variant="h1">{profile.name || 'Your profile'}</AppText>
          <AppText variant="caption">All data is stored on this device</AppText>
        </View>
      </Animated.View>

      <Card index={1} padded={false}>
        {rows.map(([k, v], i) => (
          <View key={k} style={[styles.row, i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: t.hairline }]}>
            <AppText variant="body" color="textSecondary">
              {k}
            </AppText>
            <AppText variant="title">{v}</AppText>
          </View>
        ))}
      </Card>
      <Button label="Edit profile" icon="edit" variant="secondary" onPress={() => router.push('/edit-profile')} />

      <SectionHeader title="Units" />
      <Segmented
        options={[
          { id: 'metric', label: 'Metric · cm / kg' },
          { id: 'imperial', label: 'Imperial · ft / lb' },
        ]}
        value={settings.units}
        onChange={(units) => updateSettings({ units })}
      />

      <SectionHeader title="BMI scale" />
      <Segmented
        options={[
          { id: 'who', label: 'WHO standard' },
          { id: 'asian', label: 'Asian cut-offs' },
        ]}
        value={settings.bmiScale}
        onChange={(bmiScale) => updateSettings({ bmiScale })}
      />
      <AppText variant="caption">
        Asian cut-offs (overweight from 23, obese from 27.5) better reflect health risk for South & East Asian populations.
      </AppText>

      <SectionHeader title="My foods" action={<Button label="New" icon="add" variant="ghost" onPress={() => router.push('/custom-food')} />} />
      <Card index={1} padded={false}>
        {customFoods.length === 0 ? (
          <EmptyState icon="food" title="No custom foods" body="Add home recipes or packaged foods from their label." />
        ) : (
          customFoods.map((f, i) => {
            const [unit, grams] = Object.entries(f.units)[0] ?? ['g', 100];
            return (
              <Animated.View key={f.id} entering={rowIn} exiting={rowOut} layout={listLayout} style={[styles.row, i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: t.hairline }]}>
                <View style={{ flex: 1 }}>
                  <AppText variant="title">{f.name}</AppText>
                  <AppText variant="caption">
                    1 {unit} ({grams} g) · {Math.round((f.kcal * grams) / 100)} kcal
                  </AppText>
                </View>
                <IconButton
                  icon="trash"
                  tone="plain"
                  size={32}
                  label={`Delete ${f.name}`}
                  onPress={async () => {
                    if (await confirmAction('Delete food?', `${f.name} will be removed from your foods. Past logs stay.`)) deleteCustomFood(db, f.id);
                  }}
                />
              </Animated.View>
            );
          })
        )}
      </Card>

      <SectionHeader title="Data" />
      <Button label="Reset all data" icon="reset" variant="danger" onPress={reset} />
      <AppText variant="caption" center>
        FitChecker v1.0 · general wellness guidance, not medical advice
      </AppText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, marginBottom: Spacing.one },
  avatar: { width: 64, height: 64, borderRadius: Radius.pill, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.three, paddingVertical: 14, paddingHorizontal: Spacing.three + 4 },
});
