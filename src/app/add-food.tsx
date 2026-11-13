import { router, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, IconButton } from '@/components/ui/button';
import { PressScale } from '@/components/ui/press-scale';
import { Card } from '@/components/ui/card';
import { Chip, Field, Segmented, Stepper } from '@/components/ui/controls';
import { Icon } from '@/components/ui/icon';
import { EmptyState, Screen, SectionHeader } from '@/components/ui/screen';
import { AppText } from '@/components/ui/text';
import { MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { addFoodEntries, recentFoodIds } from '@/data/repos/food-log';
import { nutritionFor } from '@/features/food/nutrition';
import { searchFoods } from '@/features/food/search';
import { CATEGORY_LABELS, mealForHour, MEALS, type Food, type FoodCategory, type Meal } from '@/features/food/types';
import { useAllFoods } from '@/hooks/use-fit-data';
import { useDbQuery } from '@/hooks/use-query';
import { useTheme } from '@/hooks/use-theme';
import { toDateKey } from '@/lib/date';
import { success } from '@/lib/feedback';
import { listLayout, rowIn, rowOut } from '@/lib/motion';

const isDrink = (f: Food) => f.category === 'drinks';
const baseUnit = (f: Food) => (isDrink(f) ? 'ml' : 'g');

function unitsOf(f: Food) {
  return Array.from(new Set([...Object.keys(f.units).filter((u) => u !== 'g'), baseUnit(f)]));
}
const defaultQty = (unit: string) => (unit === 'g' || unit === 'ml' ? 100 : 1);
const fmtQty = (q: number) => (Number.isInteger(q) ? String(q) : q.toFixed(1));

/** One food on the plate being built for a meal. */
interface PlateItem {
  key: number;
  food: Food;
  unit: string;
  qty: number;
}

/** The item currently open in the detail view. `key` is set when editing an existing plate item. */
type Draft = Omit<PlateItem, 'key'> & { key?: number };

export default function AddFood() {
  const params = useLocalSearchParams<{ date?: string; meal?: Meal }>();
  const date = params.date ?? toDateKey();
  const db = useSQLiteContext();
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const foods = useAllFoods();
  const { data: recentIds } = useDbQuery((d) => recentFoodIds(d), [], [] as string[]);

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<FoodCategory | 'all'>('all');
  const [draft, setDraft] = useState<Draft | null>(null);
  const [plate, setPlate] = useState<PlateItem[]>([]);
  const [meal, setMeal] = useState<Meal>(params.meal ?? mealForHour());
  const [saving, setSaving] = useState(false);
  const nextKey = useRef(1);

  const results = useMemo(() => {
    const pool = category === 'all' ? foods : foods.filter((f) => f.category === category);
    return searchFoods(pool, query);
  }, [foods, query, category]);

  const recents = recentIds.map((id) => foods.find((f) => f.id === id)).filter(Boolean) as Food[];
  const categories = useMemo(() => Array.from(new Set(foods.map((f) => f.category))), [foods]);

  const plateItems = useMemo(() => plate.map((p) => ({ ...p, n: nutritionFor(p.food, p.unit, p.qty) })), [plate]);
  const totals = useMemo(
    () =>
      plateItems.reduce(
        (acc, { n }) => ({ kcal: acc.kcal + n.kcal, protein: acc.protein + n.protein, carbs: acc.carbs + n.carbs, fat: acc.fat + n.fat }),
        { kcal: 0, protein: 0, carbs: 0, fat: 0 },
      ),
    [plateItems],
  );
  const mealLabel = MEALS.find((m) => m.id === meal)?.label ?? 'meal';

  const pick = (f: Food) => {
    const u = f.defaultUnit === 'g' ? baseUnit(f) : f.defaultUnit;
    setDraft({ food: f, unit: u, qty: defaultQty(u) });
  };

  const removeItem = (key: number) => setPlate((p) => p.filter((i) => i.key !== key));

  const logPlate = async () => {
    if (plateItems.length === 0 || saving) return;
    setSaving(true);
    try {
      await addFoodEntries(
        db,
        plateItems.map(({ food, unit, qty, n }) => ({ date, meal, foodId: food.id, foodName: food.name, unit, quantity: qty, ...n })),
      );
      success();
      router.dismissTo('/log');
    } finally {
      setSaving(false);
    }
  };

  if (draft) {
    const { food, unit, qty } = draft;
    const n = nutritionFor(food, unit, qty);
    const editing = draft.key !== undefined;
    const save = () => {
      if (editing) {
        setPlate((p) => p.map((i) => (i.key === draft.key ? { ...i, unit, qty } : i)));
      } else {
        setPlate((p) => [...p, { key: nextKey.current++, food, unit, qty }]);
        setQuery('');
      }
      success();
      setDraft(null);
    };
    return (
      <Screen tab={false}>
        <Pressable onPress={() => setDraft(null)} accessibilityRole="button" style={styles.back}>
          <Icon name="left" size={16} color={t.accent} />
          <AppText variant="title" color="accent">
            {plate.length > 0 ? `Your plate (${plate.length})` : 'All foods'}
          </AppText>
        </Pressable>

        <View style={{ gap: 2 }}>
          <AppText variant="label">{CATEGORY_LABELS[food.category]}</AppText>
          <AppText variant="h1">{food.name}</AppText>
          <AppText variant="caption">
            {food.kcal} kcal per 100 {baseUnit(food)}
          </AppText>
        </View>

        <Segmented
          options={unitsOf(food).map((u) => ({ id: u, label: food.units[u] ? `${u} · ${food.units[u]}${baseUnit(food)}` : u }))}
          value={unit}
          onChange={(u) => setDraft({ ...draft, unit: u, qty: defaultQty(u) })}
        />

        <Card index={1}>
          <Stepper
            value={qty}
            onChange={(q) => setDraft({ ...draft, qty: q })}
            step={unit === 'g' || unit === 'ml' ? 10 : 0.5}
            min={0}
            max={5000}
            suffix={unit}
          />
        </Card>

        <Card index={2} tone="accent" style={styles.preview}>
          <View>
            <AppText variant="label" style={{ color: t.onAccent, opacity: 0.7 }}>
              {n.grams} {baseUnit(food)} total
            </AppText>
            <AppText variant="hero" style={{ color: t.onAccent }}>
              {n.kcal}
              <AppText variant="h2" style={{ color: t.onAccent }}>
                {' '}kcal
              </AppText>
            </AppText>
          </View>
          <View style={styles.macroRow}>
            {(['protein', 'carbs', 'fat'] as const).map((k) => (
              <View key={k} style={{ flex: 1 }}>
                <AppText variant="label" style={{ color: t.onAccent, opacity: 0.7 }}>
                  {k}
                </AppText>
                <AppText variant="number" style={{ color: t.onAccent }}>
                  {n[k]}g
                </AppText>
              </View>
            ))}
          </View>
        </Card>

        <Button
          label={editing ? 'Update item' : 'Add to plate'}
          icon={editing ? 'check' : 'add'}
          size="lg"
          disabled={n.kcal <= 0 && n.grams <= 0}
          onPress={save}
        />
        {editing && (
          <Button
            label="Remove from plate"
            icon="trash"
            variant="danger"
            onPress={() => {
              removeItem(draft.key!);
              setDraft(null);
            }}
          />
        )}
      </Screen>
    );
  }

  const barHeight = 56 + Spacing.three * 2 + insets.bottom;

  return (
    <View style={{ flex: 1, backgroundColor: t.background }}>
      <Screen tab={false} contentContainerStyle={plate.length > 0 ? { paddingBottom: barHeight + Spacing.four } : undefined}>
        <SectionHeader title="Meal" />
        <View style={styles.chips}>
          {MEALS.map((m) => (
            <Chip key={m.id} label={m.label} selected={meal === m.id} onPress={() => setMeal(m.id)} />
          ))}
        </View>

        {plateItems.length > 0 && (
          <Card index={0} style={{ gap: Spacing.two }}>
            <View style={styles.plateHeader}>
              <AppText variant="label">Your plate · {plateItems.length} item{plateItems.length === 1 ? '' : 's'}</AppText>
              <AppText variant="caption">
                P {Math.round(totals.protein)}g · C {Math.round(totals.carbs)}g · F {Math.round(totals.fat)}g
              </AppText>
            </View>
            {plateItems.map((item) => (
              <Animated.View key={item.key} entering={rowIn} exiting={rowOut} layout={listLayout} style={[styles.plateRow, { borderColor: t.hairline }]}>
                <Pressable
                  style={{ flex: 1 }}
                  accessibilityRole="button"
                  accessibilityLabel={`Edit ${item.food.name}`}
                  onPress={() => setDraft({ key: item.key, food: item.food, unit: item.unit, qty: item.qty })}
                >
                  <AppText variant="title" numberOfLines={1}>
                    {item.food.name}
                  </AppText>
                  <AppText variant="caption" numberOfLines={1}>
                    {fmtQty(item.qty)} {item.unit} · {Math.round(item.n.kcal)} kcal
                  </AppText>
                </Pressable>
                <IconButton icon="close" label={`Remove ${item.food.name}`} size={32} onPress={() => removeItem(item.key)} />
              </Animated.View>
            ))}
          </Card>
        )}

        <SectionHeader title={plate.length > 0 ? 'Add another food' : 'Add food'} />
        <Field
          value={query}
          onChangeText={setQuery}
          placeholder="Search 200+ foods — roti, dal, eggs…"
          autoFocus={plate.length === 0}
          autoCorrect={false}
          returnKeyType="search"
        />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
          <Chip label="All" selected={category === 'all'} onPress={() => setCategory('all')} />
          {categories.map((c) => (
            <Chip key={c} label={CATEGORY_LABELS[c]} selected={category === c} onPress={() => setCategory(c)} />
          ))}
        </ScrollView>

        {!query && category === 'all' && recents.length > 0 && (
          <>
            <SectionHeader title="Recent" />
            <View style={styles.chips}>
              {recents.map((f) => (
                <Chip key={f.id} label={f.name} onPress={() => pick(f)} />
              ))}
            </View>
            <SectionHeader title="All foods" />
          </>
        )}

        {results.length === 0 ? (
          <EmptyState icon="search" title="No match" body="Try another spelling, or create it as a custom food." />
        ) : (
          <View style={{ gap: Spacing.two }}>
            {results.map((f) => (
              <PressScale
                key={f.id}
                onPress={() => pick(f)}
                accessibilityRole="button"
                accessibilityLabel={`${f.name}, ${f.kcal} kilocalories per 100 grams`}
                to={0.98}
                style={[styles.result, { backgroundColor: t.backgroundElement, borderColor: t.hairline }]}
              >
                <View style={{ flex: 1 }}>
                  <AppText variant="title" numberOfLines={1}>
                    {f.name}
                  </AppText>
                  <AppText variant="caption" numberOfLines={1}>
                    {f.isCustom ? 'My food · ' : ''}
                    {Object.entries(f.units)
                      .filter(([u]) => u !== 'g')
                      .map(([u, g]) => `1 ${u} ≈ ${Math.round(nutritionFor(f, u, 1).kcal)} kcal (${g}${baseUnit(f)})`)[0] ?? `${f.kcal} kcal / 100 ${baseUnit(f)}`}
                  </AppText>
                </View>
                <Icon name="add" size={18} color={t.accent} />
              </PressScale>
            ))}
          </View>
        )}

        <Button label="Create custom food" icon="edit" variant="ghost" onPress={() => router.push('/custom-food')} />
      </Screen>

      {plate.length > 0 && (
        <Animated.View entering={FadeInDown.duration(240)} exiting={FadeOutDown.duration(160)} style={[styles.bar, { backgroundColor: t.background, borderColor: t.hairline, paddingBottom: Spacing.three + insets.bottom }]}>
          <View style={styles.barInner}>
            <Button
              label={saving ? 'Saving…' : `Log ${plate.length} to ${mealLabel} · ${Math.round(totals.kcal)} kcal`}
              icon="check"
              size="lg"
              disabled={saving}
              onPress={logPlate}
            />
          </View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  back: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  chipRow: { flexDirection: 'row', gap: Spacing.two },
  preview: { gap: Spacing.three },
  macroRow: { flexDirection: 'row', gap: Spacing.three },
  plateHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.two },
  plateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingTop: Spacing.two,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  result: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.three - 2,
    paddingHorizontal: Spacing.three + 2,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: Spacing.three,
    paddingHorizontal: Spacing.three + 4,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  barInner: { width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center' },
});
