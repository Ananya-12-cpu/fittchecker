import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInRight, ReduceMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  ActivityPicker,
  BasicsFields,
  BodyFields,
  convertDraftUnits,
  EMPTY_DRAFT,
  GoalPicker,
  validateDraft,
  type ProfileDraft,
} from '@/components/profile-form';
import { Button } from '@/components/ui/button';
import { parseNum } from '@/components/ui/controls';
import { AppText } from '@/components/ui/text';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { saveProfile, updateSettings, useSettings } from '@/data/profile-store';
import { addWeight } from '@/data/repos/activity-logs';
import { useTheme } from '@/hooks/use-theme';
import { toDateKey } from '@/lib/date';
import { success } from '@/lib/feedback';
import { HOME_HREF } from '@/lib/routes';

const STEPS = [
  { kicker: 'Step 1 of 4', title: "Let's get to know you", sub: 'Your numbers stay on this device. No account needed.' },
  { kicker: 'Step 2 of 4', title: 'Your body today', sub: 'Height and weight power your BMI and calorie budget.' },
  { kicker: 'Step 3 of 4', title: 'How active are you?', sub: 'Be honest — it sets your daily energy burn.' },
  { kicker: 'Step 4 of 4', title: "What's the goal?", sub: 'The coach will adjust it if your BMI calls for a safer path.' },
];

export default function Onboarding() {
  const t = useTheme();
  const db = useSQLiteContext();
  const insets = useSafeAreaInsets();
  const { units } = useSettings();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<ProfileDraft>(EMPTY_DRAFT);
  const [error, setError] = useState<string | null>(null);
  const set = (patch: Partial<ProfileDraft>) => {
    setError(null);
    setDraft((d) => ({ ...d, ...patch }));
  };

  const next = async () => {
    if (step === 0) {
      const age = parseNum(draft.age);
      if (!(age >= 13 && age <= 100)) return setError('Enter an age between 13 and 100.');
    }
    if (step === 1 || step === 3) {
      const res = validateDraft(draft, units);
      if (!res.ok) return setError(res.error);
      if (step === 3) {
        saveProfile(res.profile);
        await addWeight(db, toDateKey(), res.profile.weightKg, 'Starting weight');
        success();
        router.replace(HOME_HREF);
        return;
      }
    }
    setError(null);
    setStep((s) => s + 1);
  };

  const s = STEPS[step];

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: t.background }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.page, { paddingTop: insets.top + Spacing.three, paddingBottom: insets.bottom + Spacing.three }]}>
        <View style={styles.progress}>
          {STEPS.map((_, i) => (
            <View key={i} style={[styles.dot, { backgroundColor: i <= step ? t.accent : t.track }]} />
          ))}
        </View>

        {step === 0 && (
          <View style={styles.brand}>
            <AppText variant="display">
              Fit<AppText variant="display" color="accent">Checker</AppText>
            </AppText>
            <AppText variant="caption">Calories · BMI · a plan that fits you</AppText>
          </View>
        )}

        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Animated.View key={step} entering={FadeInRight.duration(280).reduceMotion(ReduceMotion.System)} style={styles.stepBody}>
          <View style={{ gap: Spacing.one }}>
            <AppText variant="label" color="accent">
              {s.kicker}
            </AppText>
            <AppText variant="h1">{s.title}</AppText>
            <AppText variant="body" color="textSecondary">
              {s.sub}
            </AppText>
          </View>

          {step === 0 && <BasicsFields draft={draft} set={set} />}
          {step === 1 && (
            <BodyFields
              draft={draft}
              set={set}
              units={units}
              onUnitsChange={(u) => {
                setDraft((d) => convertDraftUnits(d, u));
                updateSettings({ units: u });
              }}
            />
          )}
          {step === 2 && <ActivityPicker draft={draft} set={set} />}
          {step === 3 && <GoalPicker draft={draft} set={set} units={units} />}

          {error ? (
            <AppText variant="caption" color="danger" accessibilityRole="alert">
              {error}
            </AppText>
          ) : null}
          </Animated.View>
        </ScrollView>

        <View style={styles.actions}>
          {step > 0 && <Button label="Back" variant="secondary" onPress={() => setStep((x) => x - 1)} style={{ flex: 1 }} size="lg" />}
          <Button
            label={step === STEPS.length - 1 ? 'Build my plan' : 'Continue'}
            icon={step === STEPS.length - 1 ? 'bolt' : undefined}
            onPress={next}
            style={{ flex: 2 }}
            size="lg"
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center', paddingHorizontal: Spacing.three + 4, gap: Spacing.three },
  progress: { flexDirection: 'row', gap: 6 },
  dot: { flex: 1, height: 4, borderRadius: 2 },
  brand: { marginTop: Spacing.three, gap: 2 },
  body: { gap: Spacing.four, paddingVertical: Spacing.three },
  stepBody: { gap: Spacing.four },
  actions: { flexDirection: 'row', gap: Spacing.three },
});
