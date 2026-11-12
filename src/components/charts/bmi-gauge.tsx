import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/text';
import { Spacing } from '@/constants/theme';
import { BMI_THRESHOLDS } from '@/features/health/bmi';
import type { BmiScale } from '@/features/health/types';
import { useTheme } from '@/hooks/use-theme';

const MIN = 15;
const MAX = 40;

/** Segmented horizontal BMI scale with a marker for the user's value. */
export function BmiGauge({ bmi, scale }: { bmi: number; scale: BmiScale }) {
  const t = useTheme();
  const [width, setWidth] = useState(0);
  const th = BMI_THRESHOLDS[scale];
  const segments = [
    { from: MIN, to: th.normal, color: t.water, label: 'Under' },
    { from: th.normal, to: th.overweight, color: t.good, label: 'Healthy' },
    { from: th.overweight, to: th.obese1, color: t.warn, label: 'Over' },
    { from: th.obese1, to: MAX, color: t.danger, label: 'Obese' },
  ];
  const pos = (v: number) => ((Math.min(MAX, Math.max(MIN, v)) - MIN) / (MAX - MIN)) * width;

  return (
    <View style={{ gap: Spacing.two }} accessible accessibilityLabel={`BMI ${bmi}`}>
      <View onLayout={(e) => setWidth(e.nativeEvent.layout.width)} style={styles.track}>
        {segments.map((s) => (
          <View key={s.label} style={{ flex: s.to - s.from, height: 10, backgroundColor: s.color, opacity: 0.85 }} />
        ))}
        {width > 0 && (
          <View style={[styles.marker, { left: pos(bmi) - 9, borderColor: t.background, backgroundColor: t.text }]} />
        )}
      </View>
      <View style={styles.labels}>
        {segments.map((s) => (
          <AppText key={s.label} variant="caption" style={{ flex: s.to - s.from, color: s.color }} numberOfLines={1}>
            {s.label}
          </AppText>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  track: { flexDirection: 'row', borderRadius: 6, overflow: 'visible', height: 18, alignItems: 'center', gap: 3 },
  marker: { position: 'absolute', top: 0, width: 18, height: 18, borderRadius: 9, borderWidth: 3 },
  labels: { flexDirection: 'row', gap: 3 },
});
