import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Field, parseNum } from '@/components/ui/controls';
import { Screen, SectionHeader } from '@/components/ui/screen';
import { AppText } from '@/components/ui/text';
import { Spacing } from '@/constants/theme';
import { addCustomFood } from '@/data/repos/custom-foods';
import { per100gFromServing } from '@/features/food/nutrition';
import { success } from '@/lib/feedback';

/** Users enter values from a nutrition label *per serving*; we store per 100 g. */
export default function CustomFood() {
  const db = useSQLiteContext();
  const [name, setName] = useState('');
  const [serving, setServing] = useState('serving');
  const [grams, setGrams] = useState('');
  const [kcal, setKcal] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    const g = parseNum(grams);
    const k = parseNum(kcal);
    const unit = serving.trim().toLowerCase() || 'serving';
    if (!name.trim()) return setError('Give the food a name.');
    if (!(g > 0 && g <= 5000)) return setError('Serving size must be between 1 and 5000 g.');
    if (!(k >= 0 && k <= 5000)) return setError('Calories per serving look off.');
    if (unit === 'g' || unit === 'ml') return setError('Use a serving name like "piece", "bowl" or "pack".');
    const macro = (s: string) => (Number.isNaN(parseNum(s)) ? 0 : Math.max(0, parseNum(s)));
    const per100 = per100gFromServing(g, { kcal: k, protein: macro(protein), carbs: macro(carbs), fat: macro(fat) });
    await addCustomFood(db, { name: name.trim(), ...per100, units: { [unit]: g }, defaultUnit: unit });
    success();
    router.back();
  };

  return (
    <Screen tab={false}>
      <AppText variant="body" color="textSecondary">
        Copy the numbers from a nutrition label or your recipe. We convert them for any quantity you log.
      </AppText>
      <Field label="Name" value={name} onChangeText={setName} placeholder="Mom's poha, protein bar…" autoCapitalize="sentences" />
      <View style={styles.row}>
        <Field style={{ flex: 1 }} label="Serving name" value={serving} onChangeText={setServing} placeholder="piece" autoCapitalize="none" />
        <Field style={{ flex: 1 }} label="Serving size" value={grams} onChangeText={setGrams} keyboardType="decimal-pad" suffix="g" placeholder="40" />
      </View>
      <SectionHeader title="Per serving" />
      <Field label="Calories" value={kcal} onChangeText={setKcal} keyboardType="decimal-pad" suffix="kcal" placeholder="180" />
      <View style={styles.row}>
        <Field style={{ flex: 1 }} label="Protein" value={protein} onChangeText={setProtein} keyboardType="decimal-pad" suffix="g" placeholder="0" />
        <Field style={{ flex: 1 }} label="Carbs" value={carbs} onChangeText={setCarbs} keyboardType="decimal-pad" suffix="g" placeholder="0" />
        <Field style={{ flex: 1 }} label="Fat" value={fat} onChangeText={setFat} keyboardType="decimal-pad" suffix="g" placeholder="0" />
      </View>
      {error ? (
        <AppText variant="caption" color="danger" accessibilityRole="alert">
          {error}
        </AppText>
      ) : null}
      <Button label="Save food" icon="check" size="lg" onPress={save} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: Spacing.three },
});
