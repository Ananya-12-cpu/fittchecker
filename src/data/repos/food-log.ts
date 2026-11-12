import type { SQLiteDatabase } from 'expo-sqlite';

import type { Meal, Nutrition } from '@/features/food/types';
import type { DateKey } from '@/lib/date';

import { invalidate } from '../events';

export interface FoodLogEntry extends Nutrition {
  id: number;
  date: DateKey;
  meal: Meal;
  foodId: string;
  foodName: string;
  unit: string;
  quantity: number;
}

interface Row {
  id: number;
  date: string;
  meal: Meal;
  food_id: string;
  food_name: string;
  unit: string;
  quantity: number;
  grams: number;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
}

const toEntry = (r: Row): FoodLogEntry => ({
  id: r.id,
  date: r.date,
  meal: r.meal,
  foodId: r.food_id,
  foodName: r.food_name,
  unit: r.unit,
  quantity: r.quantity,
  grams: r.grams,
  kcal: r.kcal,
  protein: r.protein,
  carbs: r.carbs,
  fat: r.fat,
});

export async function listFoodForDay(db: SQLiteDatabase, date: DateKey) {
  const rows = await db.getAllAsync<Row>('SELECT * FROM food_log WHERE date = ? ORDER BY created_at ASC', date);
  return rows.map(toEntry);
}

export async function addFoodEntry(db: SQLiteDatabase, e: Omit<FoodLogEntry, 'id'>) {
  await db.runAsync(
    `INSERT INTO food_log (date, meal, food_id, food_name, unit, quantity, grams, kcal, protein, carbs, fat, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    e.date,
    e.meal,
    e.foodId,
    e.foodName,
    e.unit,
    e.quantity,
    e.grams,
    e.kcal,
    e.protein,
    e.carbs,
    e.fat,
    Date.now(),
  );
  invalidate();
}

/** Insert several entries atomically (e.g. a whole meal), keeping their order. */
export async function addFoodEntries(db: SQLiteDatabase, entries: Omit<FoodLogEntry, 'id'>[]) {
  if (entries.length === 0) return;
  const now = Date.now();
  await db.withTransactionAsync(async () => {
    for (const [i, e] of entries.entries()) {
      await db.runAsync(
        `INSERT INTO food_log (date, meal, food_id, food_name, unit, quantity, grams, kcal, protein, carbs, fat, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        e.date,
        e.meal,
        e.foodId,
        e.foodName,
        e.unit,
        e.quantity,
        e.grams,
        e.kcal,
        e.protein,
        e.carbs,
        e.fat,
        now + i,
      );
    }
  });
  invalidate();
}

export async function deleteFoodEntry(db: SQLiteDatabase, id: number) {
  await db.runAsync('DELETE FROM food_log WHERE id = ?', id);
  invalidate();
}

/** Total kcal eaten per day in [from, to]. */
export async function kcalByDay(db: SQLiteDatabase, from: DateKey, to: DateKey) {
  const rows = await db.getAllAsync<{ date: string; kcal: number }>(
    'SELECT date, SUM(kcal) AS kcal FROM food_log WHERE date BETWEEN ? AND ? GROUP BY date',
    from,
    to,
  );
  return new Map(rows.map((r) => [r.date, r.kcal]));
}

/** Most recently logged distinct foods — shown as quick picks. */
export async function recentFoodIds(db: SQLiteDatabase, limit = 8) {
  const rows = await db.getAllAsync<{ food_id: string }>(
    'SELECT food_id, MAX(created_at) AS last FROM food_log GROUP BY food_id ORDER BY last DESC LIMIT ?',
    limit,
  );
  return rows.map((r) => r.food_id);
}
