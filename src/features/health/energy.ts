import type { ActivityLevel, Goal, Profile, Sex } from './types';

/** Standard activity multipliers applied to BMR. */
export const ACTIVITY_FACTORS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  athlete: 1.9,
};

/** ≈ kcal stored in 1 kg of body fat. */
export const KCAL_PER_KG = 7700;

export function ageFrom(birthYear: number, now: Date = new Date()) {
  return Math.max(0, now.getFullYear() - birthYear);
}

/** Mifflin-St Jeor resting energy expenditure (kcal/day). */
export function bmr(sex: Sex, weightKg: number, heightCm: number, age: number) {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return Math.round(sex === 'male' ? base + 5 : base - 161);
}

export function tdee(bmrKcal: number, activity: ActivityLevel) {
  return Math.round(bmrKcal * ACTIVITY_FACTORS[activity]);
}

/** Minimum daily intake we will ever prescribe without medical supervision. */
export function calorieFloor(sex: Sex, bmrKcal: number) {
  return Math.max(bmrKcal, sex === 'male' ? 1500 : 1200);
}

export interface EnergyBudget {
  age: number;
  bmr: number;
  tdee: number;
  target: number;
  /** Signed daily delta vs TDEE (negative = deficit). */
  delta: number;
  /** Expected weight change per week in kg (negative = loss). */
  weeklyRateKg: number;
  /** True when the target was raised to the safety floor. */
  clamped: boolean;
}

/**
 * Daily calorie target.
 * lose → TDEE − deficit (500, or 750 for heavier BMI), clamped at the floor
 * maintain → TDEE
 * gain → TDEE + 300 (lean bulk)
 */
export function energyBudget(
  profile: Pick<Profile, 'sex' | 'birthYear' | 'heightCm' | 'weightKg' | 'activity'>,
  goal: Goal,
  opts: { deficit?: number; surplus?: number; now?: Date } = {},
): EnergyBudget {
  const age = ageFrom(profile.birthYear, opts.now);
  const b = bmr(profile.sex, profile.weightKg, profile.heightCm, age);
  const t = tdee(b, profile.activity);

  let target = t;
  let clamped = false;
  if (goal === 'lose') {
    target = t - (opts.deficit ?? 500);
    const floor = calorieFloor(profile.sex, b);
    if (target < floor) {
      target = floor;
      clamped = true;
    }
  } else if (goal === 'gain') {
    target = t + (opts.surplus ?? 300);
  }

  target = Math.round(target / 10) * 10;
  const delta = target - t;
  const weeklyRateKg = Math.round(((delta * 7) / KCAL_PER_KG) * 100) / 100;
  return { age, bmr: b, tdee: t, target, delta, weeklyRateKg, clamped };
}

/** Weeks needed to move from `fromKg` to `toKg` at `weeklyRateKg`; null if not heading there. */
export function weeksToGoal(fromKg: number, toKg: number, weeklyRateKg: number): number | null {
  const diff = toKg - fromKg;
  if (Math.abs(diff) < 0.5) return 0;
  if (weeklyRateKg === 0 || Math.sign(diff) !== Math.sign(weeklyRateKg)) return null;
  return Math.ceil(diff / weeklyRateKg);
}
