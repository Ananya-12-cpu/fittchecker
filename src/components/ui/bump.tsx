import { useEffect, useRef, type ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated, { ReduceMotion, useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming } from 'react-native-reanimated';

import { SPRING } from '@/lib/motion';

/** Gives its children a quick "pop" whenever `value` changes (skipped on first render). */
export function Bump({ value, children, style, amount = 1.12 }: { value: unknown; children: ReactNode; style?: StyleProp<ViewStyle>; amount?: number }) {
  const scale = useSharedValue(1);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    scale.set(
      withSequence(
        withTiming(amount, { duration: 90, reduceMotion: ReduceMotion.System }),
        withSpring(1, { ...SPRING, reduceMotion: ReduceMotion.System }),
      ),
    );
  }, [value, amount, scale]);
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }] }));
  return <Animated.View style={[style, anim]}>{children}</Animated.View>;
}
