import type { ComponentProps, ReactNode } from 'react';
import { Pressable, type PressableProps } from 'react-native';
import Animated, { ReduceMotion, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { SPRING } from '@/lib/motion';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = Omit<PressableProps, 'style' | 'children'> & {
  style?: ComponentProps<typeof AnimatedPressable>['style'];
  /** Scale while pressed. */
  to?: number;
  children?: ReactNode;
};

/** Pressable with a springy scale-down on touch. */
export function PressScale({ style, to = 0.96, onPressIn, onPressOut, children, ...rest }: Props) {
  const scale = useSharedValue(1);
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <AnimatedPressable
      onPressIn={(e) => {
        scale.set(withSpring(to, { ...SPRING, reduceMotion: ReduceMotion.System }));
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        scale.set(withSpring(1, { ...SPRING, reduceMotion: ReduceMotion.System }));
        onPressOut?.(e);
      }}
      style={[style, anim]}
      {...rest}
    >
      {children}
    </AnimatedPressable>
  );
}
