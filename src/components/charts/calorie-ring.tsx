import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, ReduceMotion, useAnimatedProps, useSharedValue, withTiming } from 'react-native-reanimated';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

import { AppText } from '@/components/ui/text';
import { useTheme } from '@/hooks/use-theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type Props = {
  /** kcal consumed net of exercise */
  consumed: number;
  target: number;
  size?: number;
  stroke?: number;
};

/** Hero ring: fills with net calories; turns red past the target. */
export function CalorieRing({ consumed, target, size = 236, stroke = 18 }: Props) {
  const t = useTheme();
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = target > 0 ? Math.max(0, consumed) / target : 0;
  const over = pct > 1;
  const remaining = Math.round(target - consumed);

  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withTiming(Math.min(pct, 1), { duration: 900, easing: Easing.out(Easing.cubic), reduceMotion: ReduceMotion.System });
  }, [pct, progress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: c * (1 - progress.value),
  }));

  return (
    <View
      style={{ width: size, height: size }}
      accessible
      accessibilityLabel={`${Math.abs(remaining)} kilocalories ${over ? 'over' : 'remaining'} of ${target}`}
    >
      <Svg width={size} height={size}>
        <Defs>
          <LinearGradient id="ring" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={over ? t.danger : t.accent} />
            <Stop offset="1" stopColor={over ? t.burn : '#7CF5C4'} />
          </LinearGradient>
        </Defs>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={t.track} strokeWidth={stroke} fill="none" />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="url(#ring)"
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${c} ${c}`}
          animatedProps={animatedProps}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={[StyleSheet.absoluteFill, styles.center]}>
        <AppText variant="hero" style={{ color: over ? t.danger : t.text }}>
          {Math.abs(remaining).toLocaleString('en-US')}
        </AppText>
        <AppText variant="label">{over ? 'kcal over' : 'kcal left'}</AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center', gap: 2 },
});
