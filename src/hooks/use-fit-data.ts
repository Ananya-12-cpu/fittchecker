import { burnedByDay, getWater, latestWeight, listExerciseForDay, listWeights } from '@/data/repos/activity-logs';
import { listCustomFoods } from '@/data/repos/custom-foods';
import { kcalByDay, listFoodForDay } from '@/data/repos/food-log';
import { useProfile, useSettings } from '@/data/profile-store';
import { RuleCoach } from '@/features/coach/rule-coach';
import type { DaySummary, Plan } from '@/features/coach/types';
import { FOODS } from '@/features/food/food-db';
import { sumNutrition } from '@/features/food/nutrition';
import type { Food } from '@/features/food/types';
import { lastNDays, toDateKey, type DateKey } from '@/lib/date';

import { useDbQuery } from './use-query';

/** The active coach. Swap for an AI provider later without touching screens. */
export const coach = RuleCoach;

export function usePlan(): Plan | null {
  const profile = useProfile();
  const settings = useSettings();
  if (!profile) return null;
  return coach.buildPlan({ profile, settings });
}

export function useDay(date: DateKey) {
  const { data, loading } = useDbQuery(
    async (db) => {
      const [food, exercise, waterMl] = await Promise.all([
        listFoodForDay(db, date),
        listExerciseForDay(db, date),
        getWater(db, date),
      ]);
      return { food, exercise, waterMl };
    },
    [date],
    { food: [], exercise: [], waterMl: 0 },
  );

  const totals = sumNutrition(data.food);
  const burnedKcal = Math.round(data.exercise.reduce((s, e) => s + e.kcal, 0));
  const exerciseMinutes = Math.round(data.exercise.reduce((s, e) => s + e.minutes, 0));

  const summary: DaySummary = {
    eatenKcal: totals.kcal,
    burnedKcal,
    protein: totals.protein,
    carbs: totals.carbs,
    fat: totals.fat,
    waterMl: data.waterMl,
    exerciseMinutes,
    foodEntries: data.food.length,
  };

  return { ...data, totals, summary, loading };
}

export interface WeekDay {
  date: DateKey;
  eaten: number;
  burned: number;
}

export function useWeek(end: DateKey = toDateKey()) {
  const days = lastNDays(7, end);
  return useDbQuery<WeekDay[]>(
    async (db) => {
      const [eaten, burned] = await Promise.all([kcalByDay(db, days[0], end), burnedByDay(db, days[0], end)]);
      return days.map((date) => ({
        date,
        eaten: Math.round(eaten.get(date) ?? 0),
        burned: Math.round(burned.get(date) ?? 0),
      }));
    },
    [end],
    days.map((date) => ({ date, eaten: 0, burned: 0 })),
  );
}

export function useWeights() {
  return useDbQuery(listWeights, [], []);
}

export function useLatestWeight() {
  return useDbQuery(latestWeight, [], null);
}

export function useCustomFoods() {
  return useDbQuery(listCustomFoods, [], [] as Food[]);
}

/** Built-in + custom foods, custom first. */
export function useAllFoods() {
  const { data: custom } = useCustomFoods();
  return custom.length ? [...custom, ...FOODS] : FOODS;
}
