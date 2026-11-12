export type FoodCategory =
  | 'breads'
  | 'rice'
  | 'dal-curry'
  | 'south-indian'
  | 'snacks'
  | 'sweets'
  | 'protein'
  | 'dairy'
  | 'fruit'
  | 'veg'
  | 'nuts'
  | 'breakfast'
  | 'fast-food'
  | 'drinks'
  | 'fats'
  | 'custom';

export const CATEGORY_LABELS: Record<FoodCategory, string> = {
  breads: 'Breads',
  rice: 'Rice & grains',
  'dal-curry': 'Dal & curries',
  'south-indian': 'South Indian',
  snacks: 'Snacks',
  sweets: 'Sweets',
  protein: 'Protein',
  dairy: 'Dairy',
  fruit: 'Fruit',
  veg: 'Vegetables',
  nuts: 'Nuts & seeds',
  breakfast: 'Breakfast',
  'fast-food': 'Fast food',
  drinks: 'Drinks',
  fats: 'Oils & spreads',
  custom: 'My foods',
};

/** Nutrition values are per 100 g (or 100 ml for drinks). */
export interface Food {
  id: string;
  name: string;
  category: FoodCategory;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  /** Serving units → grams per 1 unit. `g` is always available implicitly. */
  units: Record<string, number>;
  /** Unit pre-selected when adding the food. */
  defaultUnit: string;
  isCustom?: boolean;
}

export interface Nutrition {
  grams: number;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
}

export type Meal = 'breakfast' | 'lunch' | 'snack' | 'dinner';

export const MEALS: { id: Meal; label: string }[] = [
  { id: 'breakfast', label: 'Breakfast' },
  { id: 'lunch', label: 'Lunch' },
  { id: 'snack', label: 'Snacks' },
  { id: 'dinner', label: 'Dinner' },
];

export function mealForHour(hour = new Date().getHours()): Meal {
  if (hour < 11) return 'breakfast';
  if (hour < 16) return 'lunch';
  if (hour < 19) return 'snack';
  return 'dinner';
}
