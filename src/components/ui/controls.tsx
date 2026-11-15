import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';
import Animated, { interpolateColor, ReduceMotion, useAnimatedStyle, useSharedValue, withSpring, withTiming, ZoomIn } from 'react-native-reanimated';

import { DisplayFont, Radius, Spacing, type ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { tap } from '@/lib/feedback';
import { EASE_OUT, SPRING } from '@/lib/motion';

import { IconButton } from './button';
import { Bump } from './bump';
import { PressScale } from './press-scale';
import { AppText } from './text';

// ── Chip ────────────────────────────────────────────────
export function Chip({ label, selected, onPress }: { label: string; selected?: boolean; onPress?: () => void }) {
  const t = useTheme();
  const p = useSharedValue(selected ? 1 : 0);
  useEffect(() => {
    p.set(withTiming(selected ? 1 : 0, { duration: 200, reduceMotion: ReduceMotion.System }));
  }, [selected, p]);
  const bg = useAnimatedStyle(() => ({ backgroundColor: interpolateColor(p.get(), [0, 1], [t.backgroundSelected, t.accent]) }));
  return (
    <PressScale
      accessibilityRole="button"
      accessibilityState={{ selected }}
      to={0.94}
      onPress={() => {
        tap();
        onPress?.();
      }}
      style={[styles.chip, bg]}
    >
      <AppText variant="caption" style={{ color: selected ? t.onAccent : t.text, fontWeight: '700' }}>
        {label}
      </AppText>
    </PressScale>
  );
}

// ── Segmented control ───────────────────────────────────
export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { id: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  const t = useTheme();
  const [width, setWidth] = useState(0);
  const index = Math.max(0, options.findIndex((o) => o.id === value));
  const itemW = width / options.length;
  const x = useSharedValue(0);
  useEffect(() => {
    x.value = withSpring(index * itemW, { ...SPRING, reduceMotion: ReduceMotion.System });
  }, [index, itemW, x]);
  const pill = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));

  return (
    <View
      style={[styles.segment, { backgroundColor: t.backgroundSelected }]}
      accessibilityRole="tablist"
      onLayout={(e) => setWidth(e.nativeEvent.layout.width - 8)}
    >
      {width > 0 && (
        <Animated.View pointerEvents="none" style={[styles.segmentPill, { width: itemW, backgroundColor: t.accent }, pill]} />
      )}
      {options.map((o) => {
        const active = o.id === value;
        return (
          <Pressable
            key={o.id}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => {
              tap();
              onChange(o.id);
            }}
            style={styles.segmentItem}
          >
            <AppText variant="caption" style={{ color: active ? t.onAccent : t.textSecondary, fontWeight: '700' }} numberOfLines={1}>
              {o.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

// ── Select card (big tappable option) ───────────────────
export function OptionCard({
  title,
  detail,
  selected,
  onPress,
}: {
  title: string;
  detail?: string;
  selected: boolean;
  onPress: () => void;
}) {
  const t = useTheme();
  return (
    <PressScale
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      to={0.98}
      onPress={() => {
        tap();
        onPress();
      }}
      style={[
        styles.option,
        {
          backgroundColor: selected ? 'rgba(52,168,83,0.14)' : t.backgroundElement,
          borderColor: selected ? t.accent : t.hairline,
        },
      ]}
    >
      <View style={{ flex: 1 }}>
        <AppText variant="title">{title}</AppText>
        {detail ? <AppText variant="caption">{detail}</AppText> : null}
      </View>
      <View style={[styles.radio, { borderColor: selected ? t.accent : t.textMuted }]}>
        {selected && (
          <Animated.View
            entering={ZoomIn.springify().damping(14).reduceMotion(ReduceMotion.System)}
            style={[styles.radioDot, { backgroundColor: t.accent }]}
          />
        )}
      </View>
    </PressScale>
  );
}

// ── Number field ────────────────────────────────────────
type FieldProps = Omit<TextInputProps, 'value' | 'onChangeText'> & {
  label?: string;
  suffix?: string;
  value: string;
  onChangeText: (v: string) => void;
};

export function Field({ label, suffix, style, ...rest }: FieldProps) {
  const t = useTheme();
  const [focused, setFocused] = useState(false);
  const p = useSharedValue(0);
  useEffect(() => {
    p.set(withTiming(focused ? 1 : 0, { duration: 180, reduceMotion: ReduceMotion.System }));
  }, [focused, p]);
  const border = useAnimatedStyle(() => ({ borderColor: interpolateColor(p.get(), [0, 1], [`${t.accent}00`, t.accent]) }));
  return (
    <View style={[{ gap: Spacing.one + 2 }, style as object]}>
      {label ? <AppText variant="label">{label}</AppText> : null}
      <Animated.View style={[styles.field, { backgroundColor: t.backgroundSelected }, border]}>
        <TextInput
          placeholderTextColor={t.textMuted}
          selectionColor={t.accent}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={[styles.input, { color: t.text }]}
          {...rest}
        />
        {suffix ? <AppText variant="caption">{suffix}</AppText> : null}
      </Animated.View>
    </View>
  );
}

/** Parses user input like "1,5" or "2." into a number (NaN if invalid). */
export const parseNum = (s: string) => (s.trim() === '' ? NaN : Number(s.replace(',', '.')));

// ── Stepper ─────────────────────────────────────────────
export function Stepper({
  value,
  onChange,
  step = 1,
  min = 0,
  max = 9999,
  suffix,
}: {
  value: number;
  onChange: (v: number) => void;
  step?: number;
  min?: number;
  max?: number;
  suffix?: string;
}) {
  const t = useTheme();
  const [text, setText] = useState(String(value));
  const [last, setLast] = useState(value);
  if (value !== last) {
    setLast(value);
    setText(String(value));
  }
  const set = (v: number) => {
    const clamped = Math.min(max, Math.max(min, Math.round(v * 100) / 100));
    onChange(clamped);
  };
  return (
    <View style={styles.stepper}>
      <IconButton icon="remove" label="Decrease" onPress={() => set(value - step)} size={48} />
      <Bump value={value} amount={1.06} style={{ alignItems: 'center', flex: 1 }}>
        <TextInput
          value={text}
          onChangeText={(s) => {
            setText(s);
            const n = parseNum(s);
            if (!Number.isNaN(n)) onChange(Math.min(max, Math.max(min, n)));
          }}
          keyboardType="decimal-pad"
          selectionColor={t.accent}
          accessibilityLabel="Quantity"
          style={[styles.stepperInput, { color: t.text }]}
        />
        {suffix ? <AppText variant="caption">{suffix}</AppText> : null}
      </Bump>
      <IconButton icon="add" label="Increase" tone="accent" onPress={() => set(value + step)} size={48} />
    </View>
  );
}

// ── Progress bar ────────────────────────────────────────
export function ProgressBar({ value, max, color = 'accent', height = 8 }: { value: number; max: number; color?: ThemeColor; height?: number }) {
  const t = useTheme();
  const pct = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0;
  const p = useSharedValue(0);
  useEffect(() => {
    p.value = withTiming(pct, { duration: 500, easing: EASE_OUT, reduceMotion: ReduceMotion.System });
  }, [pct, p]);
  const fill = useAnimatedStyle(() => ({ width: `${p.value * 100}%` }));
  return (
    <View style={{ height, borderRadius: height, backgroundColor: t.track, overflow: 'hidden' }}>
      <Animated.View style={[{ height, borderRadius: height, backgroundColor: t[color] }, fill]} />
    </View>
  );
}

const styles = StyleSheet.create({
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: Radius.pill },
  segment: { flexDirection: 'row', padding: 4, borderRadius: Radius.pill },
  segmentPill: { position: 'absolute', top: 4, bottom: 4, left: 4, borderRadius: Radius.pill },
  segmentItem: { flex: 1, paddingVertical: 9, paddingHorizontal: 8, borderRadius: Radius.pill, alignItems: 'center' },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three + 2,
    borderRadius: Radius.md + 2,
    borderWidth: 1.5,
  },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  radioDot: { width: 10, height: 10, borderRadius: 5 },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.md,
    borderWidth: 1.5,
    paddingHorizontal: Spacing.three,
    gap: Spacing.two,
  },
  input: { flex: 1, height: 52, fontSize: 18, fontFamily: DisplayFont.semibold },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  stepperInput: { fontFamily: DisplayFont.bold, fontSize: 40, textAlign: 'center', minWidth: 120, padding: 0 },
});
