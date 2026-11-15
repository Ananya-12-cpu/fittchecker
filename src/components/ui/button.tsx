import { StyleSheet, View, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { tap } from '@/lib/feedback';

import { Icon, type IconName } from './icon';
import { HeroGradient } from './gradient';
import { PressScale } from './press-scale';
import { AppText } from './text';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

type ButtonProps = Omit<PressableProps, 'style' | 'children'> & {
  label: string;
  icon?: IconName;
  variant?: Variant;
  size?: 'md' | 'lg';
  style?: StyleProp<ViewStyle>;
};

export function Button({ label, icon, variant = 'primary', size = 'md', style, disabled, onPress, ...rest }: ButtonProps) {
  const t = useTheme();
  const bg = { primary: t.accent, secondary: t.backgroundSelected, ghost: 'transparent', danger: 'rgba(234,88,12,0.14)' }[variant];
  const fg = { primary: t.onAccent, secondary: t.text, ghost: t.accent, danger: t.danger }[variant];

  return (
    <PressScale
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      to={0.96}
      onPress={(e) => {
        tap();
        onPress?.(e);
      }}
      style={[styles.base, size === 'lg' && styles.lg, { backgroundColor: variant === 'primary' ? 'transparent' : bg, opacity: disabled ? 0.4 : 1, overflow: 'hidden' }, style]}
      {...rest}
    >
      {variant === 'primary' && <HeroGradient />}
      {icon && <Icon name={icon} size={size === 'lg' ? 20 : 17} color={fg} />}
      <AppText variant="title" style={{ color: fg }}>
        {label}
      </AppText>
    </PressScale>
  );
}

type IconButtonProps = Omit<PressableProps, 'style' | 'children'> & {
  icon: IconName;
  label: string;
  tone?: 'accent' | 'glass' | 'plain';
  size?: number;
};

export function IconButton({ icon, label, tone = 'glass', size = 40, onPress, disabled, ...rest }: IconButtonProps) {
  const t = useTheme();
  const bg = tone === 'accent' ? t.accent : tone === 'glass' ? t.backgroundSelected : 'transparent';
  const fg = tone === 'accent' ? t.onAccent : t.text;
  return (
    <PressScale
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
      hitSlop={8}
      disabled={disabled}
      to={0.88}
      onPress={(e) => {
        tap();
        onPress?.(e);
      }}
      style={[styles.icon, { width: size, height: size, backgroundColor: tone === 'accent' ? 'transparent' : bg, opacity: disabled ? 0.3 : 1, overflow: 'hidden' }]}
      {...rest}
    >
      {tone === 'accent' && <HeroGradient />}
      <View>
        <Icon name={icon} size={size * 0.45} color={fg} />
      </View>
    </PressScale>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    height: 48,
    paddingHorizontal: Spacing.four,
    borderRadius: Radius.pill,
  },
  lg: { height: 56 },
  icon: { borderRadius: Radius.pill, alignItems: 'center', justifyContent: 'center' },
});
