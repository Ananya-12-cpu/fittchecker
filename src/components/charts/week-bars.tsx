import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { ReduceMotion, useAnimatedProps, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import Svg, { Line, Rect, Text as SvgText } from 'react-native-svg';

import { AppText } from '@/components/ui/text';
import { Spacing } from '@/constants/theme';
import type { WeekDay } from '@/hooks/use-fit-data';
import { useTheme } from '@/hooks/use-theme';
import { isToday, weekdayShort } from '@/lib/date';
import { EASE_OUT } from '@/lib/motion';

const AnimatedRect = Animated.createAnimatedComponent(Rect);

/** One bar that grows up from the baseline (staggered by `i`). */
function Bar({ i, x, chartH, h, barW, fill, opacity }: { i: number; x: number; chartH: number; h: number; barW: number; fill: string; opacity: number }) {
  const p = useSharedValue(0);
  useEffect(() => {
    p.value = withDelay(i * 50, withTiming(1, { duration: 500, easing: EASE_OUT, reduceMotion: ReduceMotion.System }));
  }, [i, h, p]);
  const props = useAnimatedProps(() => ({ y: chartH - h * p.value, height: h * p.value }));
  return <AnimatedRect x={x} width={barW} rx={barW / 2.5} fill={fill} opacity={opacity} animatedProps={props} />;
}

/** 7-day intake bars with a dashed target line. Bars over target turn coral. */
export function WeekBars({ days, target, height = 180 }: { days: WeekDay[]; target: number; height?: number }) {
  const t = useTheme();
  const [width, setWidth] = useState(0);
  const max = Math.max(target * 1.25, ...days.map((d) => d.eaten), 1);
  const labelH = 22;
  const chartH = height - labelH;
  const slot = width / days.length;
  const barW = Math.min(28, slot * 0.55);
  const y = (v: number) => chartH - (v / max) * chartH;

  return (
    <View
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      style={{ height }}
      accessible
      accessibilityLabel={`Calories for the last 7 days. ${days.map((d) => `${weekdayShort(d.date)} ${d.eaten}`).join(', ')}`}
    >
      {width > 0 && (
        <Svg width={width} height={height}>
          {days.map((d, i) => {
            const x = i * slot + (slot - barW) / 2;
            const h = Math.max(d.eaten > 0 ? 4 : 0, chartH - y(d.eaten));
            const over = d.eaten > target * 1.05;
            const today = isToday(d.date);
            return (
              <Bar key={d.date} i={i} x={x} chartH={chartH} h={h} barW={barW} fill={over ? t.burn : t.accent} opacity={today ? 1 : 0.55} />
            );
          })}
          {days.map((d, i) => (
            <SvgText
              key={`l-${d.date}`}
              x={i * slot + slot / 2}
              y={height - 4}
              fontSize={11}
              fontWeight="700"
              fill={isToday(d.date) ? t.text : t.textSecondary}
              textAnchor="middle"
            >
              {weekdayShort(d.date)}
            </SvgText>
          ))}
          <Line x1={0} x2={width} y1={y(target)} y2={y(target)} stroke={t.textSecondary} strokeDasharray="4 6" strokeWidth={1.5} />
        </Svg>
      )}
      <View style={[styles.legend, { top: Math.max(0, y(target) - 22) }]} pointerEvents="none">
        <AppText variant="caption">target {target.toLocaleString('en-US')}</AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  legend: { position: 'absolute', right: 0, paddingHorizontal: Spacing.one },
});
