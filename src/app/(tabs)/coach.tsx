import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { BmiGauge } from '@/components/charts/bmi-gauge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icon, type IconName } from '@/components/ui/icon';
import { Screen, SectionHeader } from '@/components/ui/screen';
import { AppText } from '@/components/ui/text';
import { Radius, Spacing, type ThemeColor } from '@/constants/theme';
import { updateProfile, useSettings } from '@/data/profile-store';
import type { Tip, WorkoutDay } from '@/features/coach/types';
import { GOALS } from '@/features/health/types';
import { formatMl, formatWeight } from '@/features/health/units';
import { usePlan } from '@/hooks/use-fit-data';
import { useTheme } from '@/hooks/use-theme';
import { tap } from '@/lib/feedback';

const CATEGORY_COLOR: Record<string, ThemeColor> = {
  underweight: 'water',
  normal: 'good',
  overweight: 'warn',
  obese1: 'danger',
  obese2: 'danger',
  obese3: 'danger',
};

const WORKOUT_ICON: Record<WorkoutDay['kind'], IconName> = { cardio: 'run', strength: 'dumbbell', mobility: 'yoga', rest: 'moon' };

export default function CoachScreen() {
  const t = useTheme();
  const plan = usePlan();
  const { units, bmiScale } = useSettings();
  if (!plan) return null;

  const goalLabel = (id: string) => GOALS.find((g) => g.id === id)?.label ?? id;
  const today = (['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const)[new Date().getDay()];

  return (
    <Screen>
      <AppText variant="display">Coach</AppText>

      <Card style={{ gap: Spacing.three }}>
        <View style={styles.bmiTop}>
          <View>
            <AppText variant="label">Your BMI</AppText>
            <AppText variant="hero">{plan.bmi.toFixed(1)}</AppText>
          </View>
          <View style={[styles.badge, { backgroundColor: t.backgroundSelected }]}>
            <View style={[styles.dot, { backgroundColor: t[CATEGORY_COLOR[plan.category]] }]} />
            <AppText variant="caption" color="text" style={{ fontWeight: '700' }}>
              {plan.categoryLabel}
            </AppText>
          </View>
        </View>
        <BmiGauge bmi={plan.bmi} scale={bmiScale} />
        <AppText variant="caption">
          Healthy range for your height: {formatWeight(plan.healthyRange.min, units)} – {formatWeight(plan.healthyRange.max, units)}
          {bmiScale === 'asian' ? ' (Asian cut-offs)' : ' (WHO)'}
        </AppText>
      </Card>

      <Card tone="accent" style={{ gap: Spacing.two }}>
        <AppText variant="label" style={{ color: t.onAccent, opacity: 0.7 }}>
          Your plan · {goalLabel(plan.goal)}
        </AppText>
        <AppText variant="h1" style={{ color: t.onAccent }}>
          {plan.headline}
        </AppText>
        <AppText variant="body" style={{ color: t.onAccent }}>
          {plan.summary}
        </AppText>
      </Card>

      {plan.goalAdjusted || plan.goal !== plan.recommendedGoal ? (
        <Card tone="glass" style={styles.notice}>
          <Icon name="info" size={18} color={t.warn} />
          <View style={{ flex: 1, gap: Spacing.two }}>
            <AppText variant="caption" color="text">
              {plan.goalAdjusted
                ? `A calorie deficit isn't safe at your BMI, so this plan uses “${goalLabel(plan.goal)}”.`
                : `For your BMI the coach recommends “${goalLabel(plan.recommendedGoal)}”.`}
            </AppText>
            {!plan.goalAdjusted && (
              <Button
                label={`Switch to ${goalLabel(plan.recommendedGoal)}`}
                variant="secondary"
                onPress={() => updateProfile({ goal: plan.recommendedGoal, targetWeightKg: undefined })}
              />
            )}
          </View>
        </Card>
      ) : null}

      <View style={styles.grid}>
        <Metric label="Daily calories" value={plan.calorieTarget.toLocaleString('en-US')} unit="kcal" color="accent" />
        <Metric label="Protein" value={String(plan.macros.protein)} unit="g / day" color="protein" />
        <Metric label="Water" value={formatMl(plan.waterMl)} unit="per day" color="water" />
        <Metric
          label={plan.etaWeeks ? 'Time to target' : 'Target weight'}
          value={plan.etaWeeks ? `${plan.etaWeeks}` : formatWeight(plan.targetWeightKg, units)}
          unit={plan.etaWeeks ? `weeks → ${formatWeight(plan.targetWeightKg, units)}` : ''}
          color="burn"
        />
      </View>
      <AppText variant="caption">
        BMR {plan.bmr} · TDEE {plan.tdee} kcal
        {plan.weeklyRateKg !== 0 ? ` · ${plan.weeklyRateKg > 0 ? '+' : ''}${formatWeight(plan.weeklyRateKg, units)}/week` : ''}
        {plan.calorieClamped ? ' · raised to a safe minimum' : ''}
      </AppText>

      <SectionHeader title="This week's training" />
      <Card padded={false}>
        {plan.workouts.map((w, i) => {
          const isToday = w.day === today;
          return (
            <View
              key={w.day}
              style={[styles.workout, i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: t.hairline }, isToday && { backgroundColor: 'rgba(198,255,61,0.07)' }]}
            >
              <AppText variant="label" style={{ width: 34, color: isToday ? t.accent : t.textSecondary }}>
                {w.day}
              </AppText>
              <Icon name={WORKOUT_ICON[w.kind]} size={18} color={w.kind === 'rest' ? t.textMuted : t.accent} />
              <AppText variant="title" style={{ flex: 1 }}>
                {w.title}
              </AppText>
              {w.minutes > 0 && <AppText variant="caption">{w.minutes} min</AppText>}
            </View>
          );
        })}
      </Card>

      <TipSection title="Diet remedies" tips={plan.diet} initiallyOpen />
      <TipSection title="Exercise guidance" tips={plan.exerciseNotes} />
      <TipSection title="Daily habits" tips={plan.habits} />

      <Card tone="glass">
        <AppText variant="caption">
          FitChecker gives general wellness guidance, not medical advice. Talk to a doctor before starting a new diet or exercise
          program — especially if you are pregnant, have a medical condition or take medication.
        </AppText>
      </Card>

      <Button label="Update my details" icon="edit" variant="secondary" onPress={() => router.push('/edit-profile')} />
    </Screen>
  );
}

function Metric({ label, value, unit, color }: { label: string; value: string; unit: string; color: ThemeColor }) {
  const t = useTheme();
  return (
    <Card style={styles.metric}>
      <View style={[styles.bar, { backgroundColor: t[color] }]} />
      <AppText variant="label">{label}</AppText>
      <AppText variant="h1" numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </AppText>
      <AppText variant="caption" numberOfLines={1}>
        {unit}
      </AppText>
    </Card>
  );
}

function TipSection({ title, tips, initiallyOpen = false }: { title: string; tips: Tip[]; initiallyOpen?: boolean }) {
  const t = useTheme();
  const [open, setOpen] = useState(initiallyOpen);
  return (
    <Card style={{ gap: Spacing.three }}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        onPress={() => {
          tap();
          setOpen((o) => !o);
        }}
        style={styles.tipHeader}
      >
        <AppText variant="h2">{title}</AppText>
        <AppText variant="caption">{open ? 'Hide' : `${tips.length} tips`}</AppText>
      </Pressable>
      {open &&
        tips.map((tip, i) => (
          <View key={tip.title} style={styles.tip}>
            <AppText variant="number" style={{ color: t.accent, width: 28, fontSize: 16 }}>
              {String(i + 1).padStart(2, '0')}
            </AppText>
            <View style={{ flex: 1, gap: 2 }}>
              <AppText variant="title">{tip.title}</AppText>
              <AppText variant="caption">{tip.body}</AppText>
            </View>
          </View>
        ))}
    </Card>
  );
}

const styles = StyleSheet.create({
  bmiTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.pill },
  dot: { width: 8, height: 8, borderRadius: 4 },
  notice: { flexDirection: 'row', gap: Spacing.three, alignItems: 'flex-start' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.three },
  metric: { flexBasis: '46%', flexGrow: 1, gap: 2 },
  bar: { width: 24, height: 4, borderRadius: 2, marginBottom: Spacing.two },
  workout: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, paddingVertical: Spacing.three - 2, paddingHorizontal: Spacing.three + 4 },
  tipHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tip: { flexDirection: 'row', gap: Spacing.two },
});
