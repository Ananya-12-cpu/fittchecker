import type { Profile, Settings } from '../../health/types';
import { RuleCoach } from '../rule-coach';
import type { DaySummary } from '../types';

const NOW = new Date(2026, 10, 12);
const who: Settings = { units: 'metric', bmiScale: 'who' };

const profile = (over: Partial<Profile>): Profile => ({
  name: 'T',
  sex: 'female',
  birthYear: 1996,
  heightCm: 165,
  weightKg: 60,
  activity: 'light',
  goal: 'maintain',
  ...over,
});

const day = (over: Partial<DaySummary> = {}): DaySummary => ({
  eatenKcal: 0,
  burnedKcal: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
  waterMl: 0,
  exerciseMinutes: 0,
  foodEntries: 0,
  ...over,
});

describe('RuleCoach.buildPlan', () => {
  it('healthy + maintain → maintenance plan', () => {
    const plan = RuleCoach.buildPlan({ profile: profile({}), settings: who, now: NOW });
    expect(plan.category).toBe('normal');
    expect(plan.recommendedGoal).toBe('maintain');
    expect(Math.abs(plan.calorieTarget - plan.tdee)).toBeLessThanOrEqual(5);
    expect(plan.weeklyRateKg).toBe(0);
    expect(plan.workouts).toHaveLength(7);
    expect(plan.diet.length).toBeGreaterThan(0);
  });

  it('overweight + lose → deficit, target in healthy range, ETA', () => {
    const plan = RuleCoach.buildPlan({ profile: profile({ weightKg: 75, goal: 'lose' }), settings: who, now: NOW });
    expect(plan.category).toBe('overweight');
    expect(plan.calorieTarget).toBeLessThan(plan.tdee);
    expect(plan.targetWeightKg).toBeLessThanOrEqual(plan.healthyRange.max);
    expect(plan.etaWeeks).toBeGreaterThan(0);
    // 2.0 g/kg while losing, capped at 35 % of the calorie target
    expect(plan.macros.protein).toBe(Math.round(Math.min(75 * 2, (plan.calorieTarget * 0.35) / 4)));
    expect(plan.macros.protein).toBeGreaterThan(75 * 1.6);
  });

  it('obese class II uses a larger deficit', () => {
    const plan = RuleCoach.buildPlan({
      profile: profile({ sex: 'male', heightCm: 170, weightKg: 105, goal: 'lose', activity: 'moderate' }),
      settings: who,
      now: NOW,
    });
    expect(plan.category).toBe('obese2');
    expect(plan.tdee - plan.calorieTarget).toBeGreaterThanOrEqual(740);
    expect(plan.habits.some((h) => /doctor/i.test(h.title))).toBe(true);
  });

  it('never gives an underweight user a deficit', () => {
    const plan = RuleCoach.buildPlan({ profile: profile({ weightKg: 45, goal: 'lose' }), settings: who, now: NOW });
    expect(plan.category).toBe('underweight');
    expect(plan.goal).toBe('gain');
    expect(plan.goalAdjusted).toBe(true);
    expect(plan.calorieTarget).toBeGreaterThan(plan.tdee);
  });

  it('Asian scale changes the category', () => {
    const p = profile({ weightKg: 64 }); // BMI 23.5
    expect(RuleCoach.buildPlan({ profile: p, settings: who, now: NOW }).category).toBe('normal');
    expect(RuleCoach.buildPlan({ profile: p, settings: { ...who, bmiScale: 'asian' }, now: NOW }).category).toBe('overweight');
  });

  it('flags a goal that moves away from the target', () => {
    const plan = RuleCoach.buildPlan({ profile: profile({ weightKg: 80, goal: 'gain' }), settings: who, now: NOW });
    expect(plan.etaWeeks).toBeNull();
    expect(plan.summary).toMatch(/Lose fat/);
  });
});

describe('RuleCoach.dailyInsights', () => {
  const plan = RuleCoach.buildPlan({ profile: profile({ weightKg: 75, goal: 'lose' }), settings: who, now: NOW });

  it('nudges to log the first meal', () => {
    const ids = RuleCoach.dailyInsights(plan, day(), 9).map((i) => i.id);
    expect(ids).toContain('first-log');
  });

  it('warns when over budget', () => {
    const ins = RuleCoach.dailyInsights(plan, day({ eatenKcal: plan.calorieTarget + 400, foodEntries: 5, protein: 200, waterMl: 4000 }), 21);
    expect(ins[0].id).toBe('over-budget');
  });

  it('flags low protein and water in the afternoon', () => {
    const ids = RuleCoach.dailyInsights(plan, day({ eatenKcal: 900, foodEntries: 3, protein: 20 }), 17).map((i) => i.id);
    expect(ids).toEqual(expect.arrayContaining(['protein-low', 'water-behind']));
  });

  it('praises an active, on-target day', () => {
    const ids = RuleCoach.dailyInsights(
      plan,
      day({ eatenKcal: plan.calorieTarget, foodEntries: 6, protein: plan.macros.protein, waterMl: 4000, exerciseMinutes: 40, burnedKcal: 0 }),
      20,
    ).map((i) => i.id);
    expect(ids).toEqual(expect.arrayContaining(['on-target', 'active-day']));
  });
});
