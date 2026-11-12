import { StyleSheet, View } from 'react-native';

import { ProgressBar } from '@/components/ui/controls';
import { AppText } from '@/components/ui/text';
import { Spacing } from '@/constants/theme';
import type { Macros } from '@/features/health/macros';

const ROWS = [
  { key: 'protein', label: 'Protein', color: 'protein' },
  { key: 'carbs', label: 'Carbs', color: 'carbs' },
  { key: 'fat', label: 'Fat', color: 'fat' },
] as const;

export function MacroBars({ eaten, target }: { eaten: Macros; target: Macros }) {
  return (
    <View style={styles.row}>
      {ROWS.map((r) => (
        <View key={r.key} style={styles.col} accessible accessibilityLabel={`${r.label} ${Math.round(eaten[r.key])} of ${target[r.key]} grams`}>
          <AppText variant="label">{r.label}</AppText>
          <AppText variant="number">
            {Math.round(eaten[r.key])}
            <AppText variant="caption"> / {target[r.key]}g</AppText>
          </AppText>
          <ProgressBar value={eaten[r.key]} max={target[r.key]} color={r.color} height={6} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: Spacing.three },
  col: { flex: 1, gap: Spacing.one + 2 },
});
