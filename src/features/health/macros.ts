import type { Goal } from './types';

export interface Macros {
  protein: number;
  carbs: number;
  fat: number;
}

export const KCAL_PER_G = { protein: 4, carbs: 4, fat: 9 } as const;

/**
 * Macro targets in grams.
 * Protein: 1.6 g/kg (2.0 g/kg while in a deficit to protect muscle), capped at 35 % of kcal.
 * Fat: 25 % of kcal. Carbs: the remainder.
 */
export function macroTargets(weightKg: number, kcal: number, goal: Goal): Macros {
  const perKg = goal === 'lose' ? 2.0 : 1.6;
  const protein = Math.min(weightKg * perKg, (kcal * 0.35) / KCAL_PER_G.protein);
  const fat = (kcal * 0.25) / KCAL_PER_G.fat;
  const carbs = Math.max(0, (kcal - protein * KCAL_PER_G.protein - fat * KCAL_PER_G.fat) / KCAL_PER_G.carbs);
  return { protein: Math.round(protein), carbs: Math.round(carbs), fat: Math.round(fat) };
}

/** Water target: 35 ml per kg body weight, +500 ml on days with ≥ 30 min of exercise. Rounded to 250 ml. */
export function waterTargetMl(weightKg: number, exerciseMinutes = 0) {
  const base = weightKg * 35 + (exerciseMinutes >= 30 ? 500 : 0);
  return Math.round(base / 250) * 250;
}
