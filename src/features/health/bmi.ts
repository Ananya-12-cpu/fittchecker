import type { BmiScale } from './types';

export type BmiCategory = 'underweight' | 'normal' | 'overweight' | 'obese1' | 'obese2' | 'obese3';

/**
 * Lower bounds for each category above "underweight".
 * WHO: 18.5 / 25 / 30 / 35 / 40.
 * Asian (WHO expert consultation, Lancet 2004): 18.5 / 23 / 27.5 / 32.5 / 37.5.
 */
export const BMI_THRESHOLDS: Record<BmiScale, { normal: number; overweight: number; obese1: number; obese2: number; obese3: number }> = {
  who: { normal: 18.5, overweight: 25, obese1: 30, obese2: 35, obese3: 40 },
  asian: { normal: 18.5, overweight: 23, obese1: 27.5, obese2: 32.5, obese3: 37.5 },
};

export const BMI_LABELS: Record<BmiCategory, string> = {
  underweight: 'Underweight',
  normal: 'Healthy',
  overweight: 'Overweight',
  obese1: 'Obese · Class I',
  obese2: 'Obese · Class II',
  obese3: 'Obese · Class III',
};

export function computeBmi(weightKg: number, heightCm: number): number {
  if (!(weightKg > 0) || !(heightCm > 0)) return 0;
  const m = heightCm / 100;
  return Math.round((weightKg / (m * m)) * 10) / 10;
}

export function bmiCategory(bmi: number, scale: BmiScale = 'who'): BmiCategory {
  const t = BMI_THRESHOLDS[scale];
  if (bmi < t.normal) return 'underweight';
  if (bmi < t.overweight) return 'normal';
  if (bmi < t.obese1) return 'overweight';
  if (bmi < t.obese2) return 'obese1';
  if (bmi < t.obese3) return 'obese2';
  return 'obese3';
}

export const isObese = (c: BmiCategory) => c === 'obese1' || c === 'obese2' || c === 'obese3';

/** Weight (kg) at which a person of `heightCm` would have `bmi`. */
export function weightForBmi(bmi: number, heightCm: number) {
  const m = heightCm / 100;
  return Math.round(bmi * m * m * 10) / 10;
}

/** Healthy weight range (kg) for the given height and scale. */
export function healthyWeightRange(heightCm: number, scale: BmiScale = 'who') {
  const t = BMI_THRESHOLDS[scale];
  return {
    min: weightForBmi(t.normal, heightCm),
    // upper bound is just under the overweight threshold
    max: weightForBmi(t.overweight - 0.1, heightCm),
  };
}
