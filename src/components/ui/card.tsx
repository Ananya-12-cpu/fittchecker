import { StyleSheet, View, type ViewProps } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Props = ViewProps & { tone?: 'glass' | 'solid' | 'accent'; padded?: boolean };

/** Glass card: translucent surface with a hairline border. */
export function Card({ tone = 'solid', padded = true, style, ...rest }: Props) {
  const t = useTheme();
  const bg = tone === 'accent' ? t.accent : tone === 'glass' ? t.glass : t.backgroundElement;
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: bg, borderColor: tone === 'accent' ? 'transparent' : t.hairline },
        padded && styles.padded,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: Radius.lg, borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden' },
  padded: { padding: Spacing.three + 4 },
});
