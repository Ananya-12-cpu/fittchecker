import { Easing, FadeIn, FadeInDown, FadeOut, LinearTransition, ReduceMotion } from 'react-native-reanimated';

/**
 * Shared motion presets. Every preset honours the OS "Reduce Motion" setting
 * (ReduceMotion.System), so animations are skipped automatically when it is on.
 */
export const SPRING = { damping: 18, stiffness: 220, mass: 0.8 } as const;
export const EASE_OUT = Easing.out(Easing.cubic);

/** Staggered entrance for cards/sections. Stagger is capped so long lists stay snappy. */
export const enter = (i = 0) =>
  FadeInDown.delay(Math.min(i, 6) * 60)
    .springify()
    .damping(18)
    .reduceMotion(ReduceMotion.System);

/** Row/item appearing. */
export const rowIn = FadeInDown.duration(260).reduceMotion(ReduceMotion.System);

/** Row/item disappearing. */
export const rowOut = FadeOut.duration(160).reduceMotion(ReduceMotion.System);

/** Simple fade (phase swaps, collapsible bodies). */
export const fadeIn = FadeIn.duration(220).reduceMotion(ReduceMotion.System);

/** Siblings slide smoothly into place when a row is added/removed. */
export const listLayout = LinearTransition.springify().damping(18).reduceMotion(ReduceMotion.System);
