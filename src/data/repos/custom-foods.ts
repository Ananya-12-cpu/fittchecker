import type { SQLiteDatabase } from 'expo-sqlite';

import type { Food } from '@/features/food/types';

import { invalidate } from '../events';

interface Row {
  id: string;
  name: string;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  units_json: string;
  default_unit: string;
}

const toFood = (r: Row): Food => ({
  id: r.id,
  name: r.name,
  category: 'custom',
  kcal: r.kcal,
  protein: r.protein,
  carbs: r.carbs,
  fat: r.fat,
  units: JSON.parse(r.units_json) as Record<string, number>,
  defaultUnit: r.default_unit,
  isCustom: true,
});

export async function listCustomFoods(db: SQLiteDatabase): Promise<Food[]> {
  const rows = await db.getAllAsync<Row>('SELECT * FROM custom_food ORDER BY name COLLATE NOCASE');
  return rows.map(toFood);
}

export async function deleteCustomFood(db: SQLiteDatabase, id: string) {
  await db.runAsync('DELETE FROM custom_food WHERE id = ?', id);
  invalidate();
}
