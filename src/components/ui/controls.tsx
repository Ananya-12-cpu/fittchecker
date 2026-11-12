import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { DisplayFont, Radius, Spacing, type ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { tap } from '@/lib/feedback';

import { IconButton } from './button';
import { AppText } from './text';

// ── Chip ────────────────────────────────────────────────
export function Chip({ label, selected, onPress }: { label: string; selected?: boolean; onPress?: () => void }) {
  const t = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={() => {
        tap();
        onPress?.();
      }}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: selected ? t.accent : t.backgroundSelected,
          transform: [{ scale: pressed ? 0.96 : 1 }],
        },
      ]}
    >
      <AppText variant="caption" style={{ color: selected ? t.onAccent : t.text, fontWeight: '700' }}>
        {label}
      </AppText>
    </Pressable>
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
  return (
    <View style={[styles.segment, { backgroundColor: t.backgroundSelected }]} accessibilityRole="tablist">
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
            style={[styles.segmentItem, active && { backgroundColor: t.accent }]}
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
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      onPress={() => {
        tap();
        onPress();
      }}
      style={({ pressed }) => [
        styles.option,
        {
          backgroundColor: selected ? 'rgba(198,255,61,0.10)' : t.backgroundElement,
          borderColor: selected ? t.accent : t.hairline,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
      ]}
    >
      <View style={{ flex: 1 }}>
        <AppText variant="title">{title}</AppText>
        {detail ? <AppText variant="caption">{detail}</AppText> : null}
      </View>
      <View style={[styles.radio, { borderColor: selected ? t.accent : t.textMuted }]}>
        {selected && <View style={[styles.radioDot, { backgroundColor: t.accent }]} />}
      </View>
    </Pressable>
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
  return (
    <View style={[{ gap: Spacing.one + 2 }, style as object]}>
      {label ? <AppText variant="label">{label}</AppText> : null}
      <View style={[styles.field, { backgroundColor: t.backgroundSelected, borderColor: focused ? t.accent : 'transparent' }]}>
        <TextInput
          placeholderTextColor={t.textMuted}
          selectionColor={t.accent}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={[styles.input, { color: t.text }]}
          {...rest}
        />
        {suffix ? <AppText variant="caption">{suffix}</AppText> : null}
      </View>
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
      <View style={{ alignItems: 'center', flex: 1 }}>
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
      </View>
      <IconButton icon="add" label="Increase" tone="accent" onPress={() => set(value + step)} size={48} />
    </View>
  );
}

// ── Progress bar ────────────────────────────────────────
export function ProgressBar({ value, max, color = 'accent', height = 8 }: { value: number; max: number; color?: ThemeColor; height?: number }) {
  const t = useTheme();
  const pct = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0;
  return (
    <View style={{ height, borderRadius: height, backgroundColor: t.track, overflow: 'hidden' }}>
      <View style={{ width: `${pct * 100}%`, height, borderRadius: height, backgroundColor: t[color] }} />
    </View>
  );
}

const styles = StyleSheet.create({
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: Radius.pill },
  segment: { flexDirection: 'row', padding: 4, borderRadius: Radius.pill },
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
