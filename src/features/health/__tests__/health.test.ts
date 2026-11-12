import { bmiCategory, computeBmi, healthyWeightRange, weightForBmi } from '../bmi';
import { ageFrom, bmr, calorieFloor, energyBudget, tdee, weeksToGoal } from '../energy';
import { macroTargets, waterTargetMl } from '../macros';
import type { Profile } from '../types';
import { cmToFtIn, formatHeight, formatWeight, ftInToCm, kgToLb, lbToKg } from '../units';

const NOW = new Date(2026, 10, 12);

const base: Profile = {
  name: 'Test',
  sex: 'male',
  birthYear: 1996, // 30 in 2026
  heightCm: 175,
  weightKg: 80,
  activity: 'moderate',
  goal: 'maintain',
};

describe('BMI', () => {
  it('computes kg/m² rounded to 1 decimal', () => {
    expect(computeBmi(70, 175)).toBe(22.9);
    expect(computeBmi(80, 175)).toBe(26.1);
  });

  it('guards against invalid input', () => {
    expect(computeBmi(0, 175)).toBe(0);
    expect(computeBmi(70, 0)).toBe(0);
  });

  it('classifies with WHO cut-offs at the boundaries', () => {
    expect(bmiCategory(18.4)).toBe('underweight');
    expect(bmiCategory(18.5)).toBe('normal');
    expect(bmiCategory(24.9)).toBe('normal');
    expect(bmiCategory(25)).toBe('overweight');
    expect(bmiCategory(30)).toBe('obese1');
    expect(bmiCategory(35)).toBe('obese2');
    expect(bmiCategory(40)).toBe('obese3');
  });

  it('classifies with Asian cut-offs', () => {
    expect(bmiCategory(23.5, 'asian')).toBe('overweight');
    expect(bmiCategory(27.5, 'asian')).toBe('obese1');
    expect(bmiCategory(22.9, 'asian')).toBe('normal');
  });

  it('gives a healthy weight range', () => {
    const r = healthyWeightRange(175);
    expect(r.min).toBe(56.7);
    expect(r.max).toBe(76.3);
    expect(weightForBmi(25, 160)).toBe(64);
  });
});

describe('energy', () => {
  it('computes age from birth year', () => {
    expect(ageFrom(1996, NOW)).toBe(30);
  });

  it('uses Mifflin-St Jeor for BMR', () => {
    // 10*80 + 6.25*175 - 5*30 + 5 = 1748.75
    expect(bmr('male', 80, 175, 30)).toBe(1749);
    // 10*60 + 6.25*165 - 5*30 - 161 = 1320.25
    expect(bmr('female', 60, 165, 30)).toBe(1320);
  });

  it('applies the activity multiplier', () => {
    expect(tdee(1749, 'moderate')).toBe(2711);
    expect(tdee(1749, 'sedentary')).toBe(2099);
  });

  it('builds maintain / lose / gain targets', () => {
    expect(energyBudget(base, 'maintain', { now: NOW }).target).toBe(2710);
    const lose = energyBudget(base, 'lose', { now: NOW });
    expect(lose.target).toBe(2210);
    expect(lose.weeklyRateKg).toBe(-0.46); // −501 kcal × 7 / 7700
    expect(energyBudget(base, 'gain', { now: NOW }).target).toBe(3010);
  });

  it('never goes under the calorie floor', () => {
    const small: Profile = { ...base, sex: 'female', weightKg: 48, heightCm: 150, birthYear: 1966, activity: 'sedentary' };
    const b = energyBudget(small, 'lose', { now: NOW });
    expect(b.clamped).toBe(true);
    expect(b.target).toBeGreaterThanOrEqual(1200);
    expect(calorieFloor('male', 1400)).toBe(1500);
    expect(calorieFloor('female', 1300)).toBe(1300);
  });

  it('estimates weeks to goal', () => {
    expect(weeksToGoal(80, 75, -0.5)).toBe(10);
    expect(weeksToGoal(60, 63, 0.25)).toBe(12);
    expect(weeksToGoal(80, 75, 0.3)).toBeNull();
    expect(weeksToGoal(80, 80.2, -0.5)).toBe(0);
  });
});

describe('macros & water', () => {
  it('sets protein by goal and splits the rest', () => {
    const m = macroTargets(80, 2200, 'lose');
    expect(m.protein).toBe(160);
    expect(m.fat).toBe(61);
    expect(m.carbs).toBe(253);
  });

  it('caps protein at 35 % of calories', () => {
    expect(macroTargets(150, 1500, 'lose').protein).toBe(131);
  });

  it('computes water and rounds to 250 ml', () => {
    expect(waterTargetMl(70)).toBe(2500);
    expect(waterTargetMl(70, 45)).toBe(3000);
  });
});

describe('units', () => {
  it('converts weight both ways', () => {
    expect(kgToLb(100)).toBeCloseTo(220.46, 1);
    expect(lbToKg(kgToLb(72.5))).toBeCloseTo(72.5, 6);
  });

  it('converts height both ways', () => {
    expect(cmToFtIn(175)).toEqual({ ft: 5, inch: 9 });
    expect(cmToFtIn(182.88)).toEqual({ ft: 6, inch: 0 });
    expect(ftInToCm(5, 9)).toBeCloseTo(175.26, 2);
  });

  it('formats for display', () => {
    expect(formatWeight(70, 'metric')).toBe('70 kg');
    expect(formatWeight(70, 'imperial')).toBe('154.3 lb');
    expect(formatHeight(175, 'imperial')).toBe('5′ 9″');
  });
});
