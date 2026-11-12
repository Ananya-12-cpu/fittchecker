import { StyleSheet, View } from 'react-native';

import { Field, OptionCard, parseNum, Segmented } from '@/components/ui/controls';
import { AppText } from '@/components/ui/text';
import { Spacing } from '@/constants/theme';
import { ACTIVITY_LEVELS, GOALS, type ActivityLevel, type Goal, type Profile, type Sex, type UnitSystem } from '@/features/health/types';
import { cmToFtIn, ftInToCm, kgToLb, lbToKg, round1 } from '@/features/health/units';

/** Form state is kept as strings in the user's display units; converted to metric on save. */
export interface ProfileDraft {
  name: string;
  sex: Sex;
  age: string;
  heightCm: string;
  heightFt: string;
  heightIn: string;
  weight: string;
  target: string;
  activity: ActivityLevel;
  goal: Goal;
}

export const EMPTY_DRAFT: ProfileDraft = {
  name: '',
  sex: 'female',
  age: '',
  heightCm: '',
  heightFt: '',
  heightIn: '',
  weight: '',
  target: '',
  activity: 'light',
  goal: 'maintain',
};

const fmt = (n: number) => String(round1(n));

export function draftFromProfile(p: Profile, units: UnitSystem, now = new Date()): ProfileDraft {
  const { ft, inch } = cmToFtIn(p.heightCm);
  const w = (kg: number) => fmt(units === 'imperial' ? kgToLb(kg) : kg);
  return {
    name: p.name,
    sex: p.sex,
    age: String(now.getFullYear() - p.birthYear),
    heightCm: String(Math.round(p.heightCm)),
    heightFt: String(ft),
    heightIn: String(inch),
    weight: w(p.weightKg),
    target: p.targetWeightKg ? w(p.targetWeightKg) : '',
    activity: p.activity,
    goal: p.goal,
  };
}

/** Re-express weight values when the unit toggle flips. */
export function convertDraftUnits(d: ProfileDraft, to: UnitSystem): ProfileDraft {
  const conv = (s: string) => {
    const n = parseNum(s);
    if (Number.isNaN(n)) return s;
    return fmt(to === 'imperial' ? kgToLb(n) : lbToKg(n));
  };
  let { heightCm, heightFt, heightIn } = d;
  if (to === 'imperial' && !Number.isNaN(parseNum(heightCm))) {
    const { ft, inch } = cmToFtIn(parseNum(heightCm));
    heightFt = String(ft);
    heightIn = String(inch);
  } else if (to === 'metric' && !Number.isNaN(parseNum(heightFt))) {
    heightCm = String(Math.round(ftInToCm(parseNum(heightFt), parseNum(heightIn) || 0)));
  }
  return { ...d, heightCm, heightFt, heightIn, weight: conv(d.weight), target: conv(d.target) };
}

export type DraftResult = { ok: true; profile: Profile } | { ok: false; error: string };

export function validateDraft(d: ProfileDraft, units: UnitSystem, now = new Date()): DraftResult {
  const age = parseNum(d.age);
  if (!(age >= 13 && age <= 100)) return { ok: false, error: 'Enter an age between 13 and 100.' };

  const heightCm =
    units === 'imperial' ? ftInToCm(parseNum(d.heightFt), parseNum(d.heightIn) || 0) : parseNum(d.heightCm);
  if (!(heightCm >= 100 && heightCm <= 250)) return { ok: false, error: 'Enter a height between 100 and 250 cm (3′4″–8′2″).' };

  const toKg = (s: string) => (units === 'imperial' ? lbToKg(parseNum(s)) : parseNum(s));
  const weightKg = toKg(d.weight);
  if (!(weightKg >= 25 && weightKg <= 350)) return { ok: false, error: 'Enter a weight between 25 and 350 kg (55–770 lb).' };

  let targetWeightKg: number | undefined;
  if (d.target.trim()) {
    targetWeightKg = toKg(d.target);
    if (!(targetWeightKg >= 25 && targetWeightKg <= 350)) return { ok: false, error: 'Target weight looks off — check the value.' };
  }

  return {
    ok: true,
    profile: {
      name: d.name.trim(),
      sex: d.sex,
      birthYear: now.getFullYear() - Math.round(age),
      heightCm: round1(heightCm),
      weightKg: round1(weightKg),
      activity: d.activity,
      goal: d.goal,
      targetWeightKg: targetWeightKg ? round1(targetWeightKg) : undefined,
    },
  };
}

type SectionProps = { draft: ProfileDraft; set: (patch: Partial<ProfileDraft>) => void };

export function BasicsFields({ draft, set }: SectionProps) {
  return (
    <View style={styles.stack}>
      <Field label="Your name" value={draft.name} onChangeText={(name) => set({ name })} placeholder="Optional" autoCapitalize="words" />
      <View style={{ gap: Spacing.one + 2 }}>
        <AppText variant="label">Sex</AppText>
        <Segmented
          options={[
            { id: 'female', label: 'Female' },
            { id: 'male', label: 'Male' },
          ]}
          value={draft.sex}
          onChange={(sex) => set({ sex })}
        />
        <AppText variant="caption">Used for the BMR formula (Mifflin-St Jeor).</AppText>
      </View>
      <Field label="Age" value={draft.age} onChangeText={(age) => set({ age })} keyboardType="number-pad" suffix="years" placeholder="28" maxLength={3} />
    </View>
  );
}

export function BodyFields({ draft, set, units, onUnitsChange }: SectionProps & { units: UnitSystem; onUnitsChange: (u: UnitSystem) => void }) {
  const wUnit = units === 'imperial' ? 'lb' : 'kg';
  return (
    <View style={styles.stack}>
      <Segmented
        options={[
          { id: 'metric', label: 'Metric · cm / kg' },
          { id: 'imperial', label: 'Imperial · ft / lb' },
        ]}
        value={units}
        onChange={onUnitsChange}
      />
      {units === 'metric' ? (
        <Field label="Height" value={draft.heightCm} onChangeText={(heightCm) => set({ heightCm })} keyboardType="decimal-pad" suffix="cm" placeholder="168" />
      ) : (
        <View style={styles.row}>
          <Field style={{ flex: 1 }} label="Height" value={draft.heightFt} onChangeText={(heightFt) => set({ heightFt })} keyboardType="number-pad" suffix="ft" placeholder="5" />
          <Field style={{ flex: 1 }} label=" " value={draft.heightIn} onChangeText={(heightIn) => set({ heightIn })} keyboardType="number-pad" suffix="in" placeholder="7" />
        </View>
      )}
      <Field label="Current weight" value={draft.weight} onChangeText={(weight) => set({ weight })} keyboardType="decimal-pad" suffix={wUnit} placeholder={units === 'imperial' ? '150' : '68'} />
    </View>
  );
}

export function ActivityPicker({ draft, set }: SectionProps) {
  return (
    <View style={styles.stack}>
      {ACTIVITY_LEVELS.map((a) => (
        <OptionCard key={a.id} title={a.label} detail={a.detail} selected={draft.activity === a.id} onPress={() => set({ activity: a.id })} />
      ))}
    </View>
  );
}

export function GoalPicker({ draft, set, units }: SectionProps & { units: UnitSystem }) {
  return (
    <View style={styles.stack}>
      {GOALS.map((g) => (
        <OptionCard key={g.id} title={g.label} detail={g.detail} selected={draft.goal === g.id} onPress={() => set({ goal: g.id })} />
      ))}
      <Field
        label="Target weight (optional)"
        value={draft.target}
        onChangeText={(target) => set({ target })}
        keyboardType="decimal-pad"
        suffix={units === 'imperial' ? 'lb' : 'kg'}
        placeholder="Coach picks a healthy target"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  stack: { gap: Spacing.three },
  row: { flexDirection: 'row', gap: Spacing.three },
});
