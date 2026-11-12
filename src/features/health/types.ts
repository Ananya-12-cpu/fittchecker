export type Sex = 'male' | 'female';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'athlete';
export type Goal = 'lose' | 'maintain' | 'gain';
export type UnitSystem = 'metric' | 'imperial';
export type BmiScale = 'who' | 'asian';

/** All body measurements are stored in metric (cm / kg). */
export interface Profile {
  name: string;
  sex: Sex;
  birthYear: number;
  heightCm: number;
  weightKg: number;
  activity: ActivityLevel;
  goal: Goal;
  /** Optional user-chosen goal weight; otherwise the coach derives one from the healthy range. */
  targetWeightKg?: number;
}

export interface Settings {
  units: UnitSystem;
  bmiScale: BmiScale;
}

export const DEFAULT_SETTINGS: Settings = { units: 'metric', bmiScale: 'who' };

export const ACTIVITY_LEVELS: { id: ActivityLevel; label: string; detail: string }[] = [
  { id: 'sedentary', label: 'Sedentary', detail: 'Desk job, little or no exercise' },
  { id: 'light', label: 'Lightly active', detail: 'Light exercise 1–3 days / week' },
  { id: 'moderate', label: 'Moderately active', detail: 'Exercise 3–5 days / week' },
  { id: 'active', label: 'Very active', detail: 'Hard exercise 6–7 days / week' },
  { id: 'athlete', label: 'Athlete', detail: 'Physical job or 2× training / day' },
];

export const GOALS: { id: Goal; label: string; detail: string }[] = [
  { id: 'lose', label: 'Lose fat', detail: '≈0.5 kg per week, steady deficit' },
  { id: 'maintain', label: 'Stay fit', detail: 'Hold weight, build habits' },
  { id: 'gain', label: 'Build up', detail: 'Lean gain with a small surplus' },
];
