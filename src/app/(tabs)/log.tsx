import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { IconButton } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { EmptyState, Screen } from '@/components/ui/screen';
import { AppText } from '@/components/ui/text';
import { Spacing } from '@/constants/theme';
import { deleteExercise } from '@/data/repos/activity-logs';
import { deleteFoodEntry } from '@/data/repos/food-log';
import { sumNutrition, unitLabel } from '@/features/food/nutrition';
import { MEALS } from '@/features/food/types';
import { useDay, usePlan } from '@/hooks/use-fit-data';
import { useTheme } from '@/hooks/use-theme';
import { addDays, friendlyDay, toDateKey } from '@/lib/date';
import { confirmAction } from '@/lib/feedback';

export default function LogScreen() {
  const t = useTheme();
  const db = useSQLiteContext();
  const plan = usePlan();
  const [date, setDate] = useState(toDateKey());
  const day = useDay(date);
  const isFuture = date >= toDateKey();

  const net = day.summary.eatenKcal - day.summary.burnedKcal;
  const fmtQty = (q: number) => (Number.isInteger(q) ? String(q) : q.toFixed(1));

  return (
    <Screen>
      <AppText variant="display">Log</AppText>

      <View style={styles.dateRow}>
        <IconButton icon="left" label="Previous day" onPress={() => setDate((d) => addDays(d, -1))} />
        <View style={{ alignItems: 'center' }}>
          <AppText variant="h2">{friendlyDay(date)}</AppText>
          <AppText variant="caption">
            {Math.round(net).toLocaleString('en-US')} net · {plan ? plan.calorieTarget.toLocaleString('en-US') : '—'} target
          </AppText>
        </View>
        <IconButton icon="right" label="Next day" onPress={() => !isFuture && setDate((d) => addDays(d, 1))} disabled={isFuture} />
      </View>

      {MEALS.map((meal) => {
        const items = day.food.filter((f) => f.meal === meal.id);
        const total = sumNutrition(items);
        return (
          <Card key={meal.id} style={{ gap: Spacing.two }}>
            <View style={styles.rowBetween}>
              <View>
                <AppText variant="h2">{meal.label}</AppText>
                <AppText variant="caption">
                  {total.kcal} kcal · P {Math.round(total.protein)} · C {Math.round(total.carbs)} · F {Math.round(total.fat)}
                </AppText>
              </View>
              <IconButton
                icon="add"
                tone="accent"
                label={`Add food to ${meal.label}`}
                onPress={() => router.push({ pathname: '/add-food', params: { date, meal: meal.id } })}
              />
            </View>
            {items.map((item) => (
              <View key={item.id} style={[styles.item, { borderTopColor: t.hairline }]}>
                <View style={{ flex: 1 }}>
                  <AppText variant="title" numberOfLines={1}>
                    {item.foodName}
                  </AppText>
                  <AppText variant="caption">
                    {fmtQty(item.quantity)} {unitLabel(item.unit, item.quantity)}
                    {item.unit !== 'g' && item.unit !== 'ml' ? ` · ${Math.round(item.grams)} g` : ''}
                  </AppText>
                </View>
                <AppText variant="number" style={{ fontSize: 17 }}>
                  {Math.round(item.kcal)}
                </AppText>
                <IconButton
                  icon="close"
                  tone="plain"
                  size={32}
                  label={`Delete ${item.foodName}`}
                  onPress={async () => {
                    if (await confirmAction('Remove item?', `${item.foodName} will be removed from ${meal.label}.`, 'Remove')) {
                      deleteFoodEntry(db, item.id);
                    }
                  }}
                />
              </View>
            ))}
          </Card>
        );
      })}

      <Card style={{ gap: Spacing.two }}>
        <View style={styles.rowBetween}>
          <View>
            <AppText variant="h2">Exercise</AppText>
            <AppText variant="caption">
              {day.summary.exerciseMinutes} min · {day.summary.burnedKcal} kcal burned
            </AppText>
          </View>
          <IconButton icon="add" tone="accent" label="Add exercise" onPress={() => router.push({ pathname: '/add-exercise', params: { date } })} />
        </View>
        {day.exercise.length === 0 ? (
          <EmptyState icon="run" title="No activity yet" body="Walks, gym, yoga, sports — it all counts." />
        ) : (
          day.exercise.map((e) => (
            <View key={e.id} style={[styles.item, { borderTopColor: t.hairline }]}>
              <Icon name="flame" size={16} color={t.burn} />
              <View style={{ flex: 1 }}>
                <AppText variant="title">{e.name}</AppText>
                <AppText variant="caption">{Math.round(e.minutes)} min</AppText>
              </View>
              <AppText variant="number" style={{ fontSize: 17, color: t.burn }}>
                −{Math.round(e.kcal)}
              </AppText>
              <IconButton
                icon="close"
                tone="plain"
                size={32}
                label={`Delete ${e.name}`}
                onPress={async () => {
                  if (await confirmAction('Remove activity?', `${e.name} will be removed.`, 'Remove')) deleteExercise(db, e.id);
                }}
              />
            </View>
          ))
        )}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  dateRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingTop: Spacing.two + 2,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
