import { StyleSheet, type ViewProps } from 'react-native';
import Animated from 'react-native-reanimated';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { enter, listLayout } from '@/lib/motion';

type Props = ViewProps & {
  tone?: 'glass' | 'solid' | 'accent';
  padded?: boolean;
  /** Position in the screen's entrance sequence (0 = first). Omit to skip the entrance. */
  index?: number;
};

/** Glass card: translucent surface with a hairline border. Fades/slides in when `index` is given. */
export function Card({ tone = 'solid', padded = true, index, style, ...rest }: Props) {
  const t = useTheme();
  const bg = tone === 'accent' ? t.accent : tone === 'glass' ? t.glass : t.backgroundElement;
  return (
    <Animated.View
      entering={index === undefined ? undefined : enter(index)}
      layout={index === undefined ? undefined : listLayout}
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
