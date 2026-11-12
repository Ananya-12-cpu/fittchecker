import { StyleSheet, Text, type TextProps } from 'react-native';

import { DisplayFont, type ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type TextVariant = 'hero' | 'display' | 'h1' | 'h2' | 'title' | 'body' | 'caption' | 'label' | 'number';

export type AppTextProps = TextProps & {
  variant?: TextVariant;
  color?: ThemeColor;
  center?: boolean;
};

/** Typography: Space Grotesk for display/numerals, system font for reading text. */
export function AppText({ variant = 'body', color, center, style, ...rest }: AppTextProps) {
  const theme = useTheme();
  const defaultColor: ThemeColor = variant === 'caption' || variant === 'label' ? 'textSecondary' : 'text';
  return (
    <Text
      style={[styles[variant], { color: theme[color ?? defaultColor] }, center && styles.center, style]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  hero: { fontFamily: DisplayFont.bold, fontSize: 56, lineHeight: 60, letterSpacing: -2, fontVariant: ['tabular-nums'] },
  display: { fontFamily: DisplayFont.bold, fontSize: 36, lineHeight: 42, letterSpacing: -1 },
  h1: { fontFamily: DisplayFont.bold, fontSize: 28, lineHeight: 34, letterSpacing: -0.6 },
  h2: { fontFamily: DisplayFont.semibold, fontSize: 20, lineHeight: 26, letterSpacing: -0.3 },
  title: { fontSize: 16, lineHeight: 22, fontWeight: '600' },
  body: { fontSize: 15, lineHeight: 22, fontWeight: '400' },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: '500' },
  label: { fontSize: 11, lineHeight: 14, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase' },
  number: { fontFamily: DisplayFont.bold, fontSize: 22, lineHeight: 26, letterSpacing: -0.5, fontVariant: ['tabular-nums'] },
  center: { textAlign: 'center' },
});
