import type { UnitSystem } from './types';

const CM_PER_IN = 2.54;
const KG_PER_LB = 0.45359237;

export const kgToLb = (kg: number) => kg / KG_PER_LB;
export const lbToKg = (lb: number) => lb * KG_PER_LB;

export function cmToFtIn(cm: number): { ft: number; inch: number } {
  const totalIn = cm / CM_PER_IN;
  let ft = Math.floor(totalIn / 12);
  let inch = Math.round(totalIn - ft * 12);
  if (inch === 12) {
    ft += 1;
    inch = 0;
  }
  return { ft, inch };
}

export const ftInToCm = (ft: number, inch: number) => (ft * 12 + inch) * CM_PER_IN;

export const round1 = (n: number) => Math.round(n * 10) / 10;

export function formatWeight(kg: number, units: UnitSystem) {
  return units === 'imperial' ? `${round1(kgToLb(kg))} lb` : `${round1(kg)} kg`;
}

export function formatHeight(cm: number, units: UnitSystem) {
  if (units === 'imperial') {
    const { ft, inch } = cmToFtIn(cm);
    return `${ft}′ ${inch}″`;
  }
  return `${Math.round(cm)} cm`;
}

/** Weight value (number only) in the user's units. */
export const weightIn = (kg: number, units: UnitSystem) =>
  round1(units === 'imperial' ? kgToLb(kg) : kg);

export const weightUnit = (units: UnitSystem) => (units === 'imperial' ? 'lb' : 'kg');

export function formatMl(ml: number) {
  return ml >= 1000 ? `${round1(ml / 1000)} L` : `${Math.round(ml)} ml`;
}
