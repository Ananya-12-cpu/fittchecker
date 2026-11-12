import { BMI_LABELS, BMI_THRESHOLDS, bmiCategory, computeBmi, healthyWeightRange, weightForBmi } from '../health/bmi';
import { energyBudget, weeksToGoal } from '../health/energy';
import { macroTargets, waterTargetMl } from '../health/macros';
import { GOALS, type Goal } from '../health/types';
import {
  bucketOf,
  deficitFor,
  DIET_TIPS,
  EXERCISE_NOTES,
  HABITS,
  HEADLINES,
  recommendedGoalFor,
  stepsTargetFor,
  WORKOUTS,
} from './rules';
import type { CoachContext, CoachProvider, DaySummary, Insight, Plan } from './types';

function buildPlan({ profile, settings, now }: CoachContext): Plan {
  const bmi = computeBmi(profile.weightKg, profile.heightCm);
  const category = bmiCategory(bmi, settings.bmiScale);
  const bucket = bucketOf(category);
  const healthyRange = healthyWeightRange(profile.heightCm, settings.bmiScale);
  const recommendedGoal = recommendedGoalFor(category);

  // Safety: never prescribe a deficit to someone underweight.
  let goal: Goal = profile.goal;
  if (category === 'underweight' && goal === 'lose') goal = 'gain';
  const goalAdjusted = goal !== profile.goal;

  const budget = energyBudget(profile, goal, { deficit: deficitFor(category), now });

  // Target weight: user's choice, else a sensible point inside the healthy range.
  const t = BMI_THRESHOLDS[settings.bmiScale];
  const w = profile.weightKg;
  const upperHealthy = weightForBmi(t.overweight - 0.6, profile.heightCm);
  const lowerHealthy = weightForBmi(20, profile.heightCm);
  let targetWeightKg = profile.targetWeightKg ?? w;
  if (!profile.targetWeightKg) {
    if (bucket === 'over' || bucket === 'obese') targetWeightKg = upperHealthy;
    else if (bucket === 'under') targetWeightKg = lowerHealthy;
    else if (goal === 'lose') targetWeightKg = Math.max(healthyRange.min + 1, w - 3);
    else if (goal === 'gain') targetWeightKg = Math.min(healthyRange.max, w + 3);
  }
  targetWeightKg = Math.round(targetWeightKg * 10) / 10;

  const etaWeeks = weeksToGoal(profile.weightKg, targetWeightKg, budget.weeklyRateKg);
  const toGo = Math.round(Math.abs(targetWeightKg - profile.weightKg) * 10) / 10;

  let summary: string;
  if (toGo < 0.5 || (goal === 'maintain' && bucket === 'healthy')) {
    summary = `Eat around ${budget.target} kcal a day to hold your weight and keep building fitness.`;
  } else {
    const dir = targetWeightKg < profile.weightKg ? 'lose' : 'gain';
    summary =
      etaWeeks !== null
        ? `${dir === 'lose' ? 'Lose' : 'Gain'} ${toGo} kg in about ${etaWeeks} weeks at ${budget.target} kcal/day.`
        : `Your current goal won't reach your target of ${targetWeightKg} kg — consider switching to “${GOALS.find((g) => g.id === recommendedGoal)?.label}”.`;
  }

  return {
    bmi,
    category,
    categoryLabel: BMI_LABELS[category],
    healthyRange,
    goal,
    goalAdjusted,
    recommendedGoal,
    bmr: budget.bmr,
    tdee: budget.tdee,
    calorieTarget: budget.target,
    calorieClamped: budget.clamped,
    macros: macroTargets(profile.weightKg, budget.target, goal),
    waterMl: waterTargetMl(profile.weightKg),
    stepsTarget: stepsTargetFor(category, profile.activity),
    weeklyRateKg: budget.weeklyRateKg,
    targetWeightKg,
    etaWeeks,
    headline: HEADLINES[bucket],
    summary,
    diet: [...DIET_TIPS[bucket]],
    workouts: [...WORKOUTS[bucket]],
    exerciseNotes: [
      ...EXERCISE_NOTES[bucket],
      ...(profile.activity === 'sedentary'
        ? [{ title: 'Break up sitting', body: 'Stand up and move for 2–3 minutes every 45 minutes of desk time.' }]
        : []),
    ],
    habits: [
      { title: `Walk ${plural(stepsTargetFor(category, profile.activity))} steps`, body: 'Daily steps are the simplest lever for overall activity.' },
      { title: `Drink ${(waterTargetMl(profile.weightKg) / 1000).toFixed(1)} L water`, body: 'Add ~500 ml on workout days.' },
      ...HABITS[bucket],
    ],
  };
}

const plural = (n: number) => n.toLocaleString('en-US');

function dailyInsights(plan: Plan, day: DaySummary, hour = new Date().getHours()): Insight[] {
  const out: Insight[] = [];
  const net = day.eatenKcal - day.burnedKcal;
  const remaining = plan.calorieTarget - net;
  const waterGoal = plan.waterMl + (day.exerciseMinutes >= 30 ? 500 : 0);

  if (day.foodEntries === 0) {
    out.push({
      id: 'first-log',
      tone: 'info',
      title: 'Log your first meal',
      body: 'Tap + to add food. Quantities are converted to calories automatically.',
    });
  }

  if (remaining < -100) {
    out.push({
      id: 'over-budget',
      tone: 'warn',
      title: `${Math.abs(Math.round(remaining))} kcal over budget`,
      body:
        plan.goal === 'gain'
          ? 'A small overshoot is fine on a building plan.'
          : 'A 30–40 minute brisk walk would balance most of it. Keep dinner light and protein-rich.',
    });
  } else if (plan.goal === 'gain' && hour >= 19 && remaining > 400) {
    out.push({
      id: 'under-gain',
      tone: 'warn',
      title: `${Math.round(remaining)} kcal still to go`,
      body: 'Add a banana shake with milk and peanut butter, or a paneer roll before bed.',
    });
  } else if (day.foodEntries > 0 && Math.abs(remaining) <= plan.calorieTarget * 0.1 && hour >= 18) {
    out.push({ id: 'on-target', tone: 'good', title: 'Right on target', body: 'You are within 10 % of your calorie goal today. Nice work.' });
  }

  if (hour >= 16 && day.protein < plan.macros.protein * 0.5) {
    out.push({
      id: 'protein-low',
      tone: 'warn',
      title: 'Protein is running low',
      body: `${Math.round(day.protein)} g of ${plan.macros.protein} g. Add eggs, paneer, dal, curd or chicken to your next meal.`,
    });
  }

  if (hour >= 15 && day.waterMl < waterGoal * 0.5) {
    out.push({ id: 'water-behind', tone: 'info', title: 'Hydration check', body: 'You are under half your water goal — have a glass now.' });
  }

  if (hour >= 18 && day.exerciseMinutes === 0) {
    out.push({
      id: 'move',
      tone: 'info',
      title: 'Get moving',
      body: plan.category === 'underweight' ? 'A light 15-minute walk aids appetite and digestion.' : 'A 20-minute walk after dinner burns ~100 kcal and helps digestion.',
    });
  }

  if (day.exerciseMinutes >= 30) {
    out.push({ id: 'active-day', tone: 'good', title: `${day.exerciseMinutes} active minutes`, body: 'Great session — remember the extra 500 ml of water.' });
  }

  if (out.length === 0) {
    out.push({ id: 'steady', tone: 'good', title: 'Steady day', body: 'Keep logging — consistency is what moves the needle.' });
  }
  return out;
}

export const RuleCoach: CoachProvider = { buildPlan, dailyInsights };
