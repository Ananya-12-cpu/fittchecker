import type { BmiCategory } from '../health/bmi';
import type { Macros } from '../health/macros';
import type { Goal, Profile, Settings } from '../health/types';

export interface CoachContext {
  profile: Profile;
  settings: Settings;
  now?: Date;
}

export interface Tip {
  title: string;
  body: string;
}

export interface WorkoutDay {
  day: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';
  kind: 'cardio' | 'strength' | 'mobility' | 'rest';
  title: string;
  minutes: number;
}

export interface Plan {
  bmi: number;
  category: BmiCategory;
  categoryLabel: string;
  healthyRange: { min: number; max: number };
  /** Goal the plan is actually built on (may differ from the user's choice for safety). */
  goal: Goal;
  goalAdjusted: boolean;
  recommendedGoal: Goal;
  bmr: number;
  tdee: number;
  calorieTarget: number;
  calorieClamped: boolean;
  macros: Macros;
  waterMl: number;
  stepsTarget: number;
  weeklyRateKg: number;
  targetWeightKg: number;
  etaWeeks: number | null;
  headline: string;
  summary: string;
  diet: Tip[];
  workouts: WorkoutDay[];
  exerciseNotes: Tip[];
  habits: Tip[];
}

/** What the user did on a given day — input for daily insights. */
export interface DaySummary {
  eatenKcal: number;
  burnedKcal: number;
  protein: number;
  carbs: number;
  fat: number;
  waterMl: number;
  exerciseMinutes: number;
  foodEntries: number;
}

export interface Insight {
  id: string;
  tone: 'good' | 'warn' | 'info';
  title: string;
  body: string;
}

/**
 * Swap-in point for smarter coaches. v1 ships `RuleCoach`; a future AI coach
 * (e.g. Claude behind a backend proxy) implements the same contract.
 */
export interface CoachProvider {
  buildPlan(ctx: CoachContext): Plan;
  dailyInsights(plan: Plan, day: DaySummary, hour?: number): Insight[];
}
