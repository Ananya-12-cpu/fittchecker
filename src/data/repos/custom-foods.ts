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

export async function addCustomFood(db: SQLiteDatabase, food: Omit<Food, 'id' | 'category' | 'isCustom'>) {
  const id = `custom-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  await db.runAsync(
    `INSERT INTO custom_food (id, name, kcal, protein, carbs, fat, units_json, default_unit, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    id,
    food.name,
    food.kcal,
    food.protein,
    food.carbs,
    food.fat,
    JSON.stringify(food.units),
    food.defaultUnit,
    Date.now(),
  );
  invalidate();
  return id;
}

export async function deleteCustomFood(db: SQLiteDatabase, id: string) {
  await db.runAsync('DELETE FROM custom_food WHERE id = ?', id);
  invalidate();
}
