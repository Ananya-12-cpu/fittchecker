import { LinearGradient } from 'expo-linear-gradient';
import type { StyleProp, ViewStyle } from 'react-native';

import { Gradients } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

/** Fills its parent with the signature green → blue → pink → orange diagonal gradient. */
export function HeroGradient({ style }: { style?: StyleProp<ViewStyle> }) {
  const dark = useColorScheme() === 'dark';
  return (
    <LinearGradient
      colors={dark ? Gradients.heroDark : Gradients.hero}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      pointerEvents="none"
      style={[{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }, style]}
    />
  );
}
