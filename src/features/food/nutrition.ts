import type { Food, Nutrition } from './types';

export const ZERO_NUTRITION: Nutrition = { grams: 0, kcal: 0, protein: 0, carbs: 0, fat: 0 };

const r1 = (n: number) => Math.round(n * 10) / 10;

/** Grams for `quantity` of `unit`. Unknown units fall back to grams. */
export function gramsFor(food: Food, unit: string, quantity: number): number {
  if (!(quantity > 0)) return 0;
  const perUnit = unit === 'g' || unit === 'ml' ? 1 : (food.units[unit] ?? 1);
  return r1(perUnit * quantity);
}

/** Nutrition for a quantity of a food: grams = qty × gramsPerUnit; value = grams / 100 × per-100g value. */
export function nutritionFor(food: Food, unit: string, quantity: number): Nutrition {
  const grams = gramsFor(food, unit, quantity);
  const f = grams / 100;
  return {
    grams,
    kcal: Math.round(food.kcal * f),
    protein: r1(food.protein * f),
    carbs: r1(food.carbs * f),
    fat: r1(food.fat * f),
  };
}

export function sumNutrition(items: Partial<Nutrition>[]): Nutrition {
  const total = items.reduce<Nutrition>(
    (acc, n) => ({
      grams: acc.grams + (n.grams ?? 0),
      kcal: acc.kcal + (n.kcal ?? 0),
      protein: acc.protein + (n.protein ?? 0),
      carbs: acc.carbs + (n.carbs ?? 0),
      fat: acc.fat + (n.fat ?? 0),
    }),
    { ...ZERO_NUTRITION },
  );
  return {
    grams: r1(total.grams),
    kcal: Math.round(total.kcal),
    protein: r1(total.protein),
    carbs: r1(total.carbs),
    fat: r1(total.fat),
  };
}

/**
 * Convert label values for one serving into per-100 g values (used for custom foods,
 * since people read nutrition labels per serving).
 */
export function per100gFromServing(
  servingGrams: number,
  serving: { kcal: number; protein: number; carbs: number; fat: number },
) {
  const f = servingGrams > 0 ? 100 / servingGrams : 0;
  return {
    kcal: r1(serving.kcal * f),
    protein: r1(serving.protein * f),
    carbs: r1(serving.carbs * f),
    fat: r1(serving.fat * f),
  };
}

/** Human label for a unit amount: "2 piece" → "2 pieces", "150 g". */
export function unitLabel(unit: string, quantity = 1) {
  if (unit === 'g' || unit === 'ml' || unit === 'tbsp' || unit === 'tsp') return unit;
  if (quantity === 1) return unit;
  if (/(s|sh|ch|x)$/.test(unit)) return `${unit}es`;
  return `${unit}s`;
}
