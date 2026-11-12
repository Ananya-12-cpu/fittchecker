/**
 * Dark-first: we only fall back to the light palette when the system explicitly asks for light.
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors, type Palette } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function useTheme(): Palette {
  const scheme = useColorScheme();
  return scheme === 'light' ? Colors.light : Colors.dark;
}

export function useIsDark() {
  return useColorScheme() !== 'light';
}
