import type { SQLiteDatabase } from 'expo-sqlite';

import type { DateKey } from '@/lib/date';

import { invalidate } from '../events';

// ── Exercise ─────────────────────────────────────────────

export interface ExerciseEntry {
  id: number;
  date: DateKey;
  activityId: string;
  name: string;
  minutes: number;
  kcal: number;
}

export async function listExerciseForDay(db: SQLiteDatabase, date: DateKey): Promise<ExerciseEntry[]> {
  return db.getAllAsync<ExerciseEntry>(
    `SELECT id, date, activity_id AS activityId, name, minutes, kcal
     FROM exercise_log WHERE date = ? ORDER BY created_at ASC`,
    date,
  );
}

export async function addExercise(db: SQLiteDatabase, e: Omit<ExerciseEntry, 'id'>) {
  await db.runAsync(
    'INSERT INTO exercise_log (date, activity_id, name, minutes, kcal, created_at) VALUES (?, ?, ?, ?, ?, ?)',
    e.date,
    e.activityId,
    e.name,
    e.minutes,
    e.kcal,
    Date.now(),
  );
  invalidate();
}

export async function deleteExercise(db: SQLiteDatabase, id: number) {
  await db.runAsync('DELETE FROM exercise_log WHERE id = ?', id);
  invalidate();
}

export async function burnedByDay(db: SQLiteDatabase, from: DateKey, to: DateKey) {
  const rows = await db.getAllAsync<{ date: string; kcal: number }>(
    'SELECT date, SUM(kcal) AS kcal FROM exercise_log WHERE date BETWEEN ? AND ? GROUP BY date',
    from,
    to,
  );
  return new Map(rows.map((r) => [r.date, r.kcal]));
}

// ── Water ────────────────────────────────────────────────

export async function getWater(db: SQLiteDatabase, date: DateKey) {
  const row = await db.getFirstAsync<{ ml: number }>('SELECT ml FROM water_log WHERE date = ?', date);
  return row?.ml ?? 0;
}

export async function addWater(db: SQLiteDatabase, date: DateKey, deltaMl: number) {
  await db.runAsync(
    `INSERT INTO water_log (date, ml) VALUES (?, MAX(0, ?))
     ON CONFLICT(date) DO UPDATE SET ml = MAX(0, ml + excluded.ml)`,
    date,
    deltaMl,
  );
  invalidate();
}

// ── Weight ───────────────────────────────────────────────

export interface WeightEntry {
  id: number;
  date: DateKey;
  kg: number;
  note: string | null;
}

export async function listWeights(db: SQLiteDatabase, limit = 60): Promise<WeightEntry[]> {
  return db.getAllAsync<WeightEntry>(
    'SELECT id, date, kg, note FROM weight_log ORDER BY date DESC, created_at DESC LIMIT ?',
    limit,
  );
}

export async function addWeight(db: SQLiteDatabase, date: DateKey, kg: number, note?: string) {
  await db.runAsync(
    'INSERT INTO weight_log (date, kg, note, created_at) VALUES (?, ?, ?, ?)',
    date,
    kg,
    note ?? null,
    Date.now(),
  );
  invalidate();
}

export async function deleteWeight(db: SQLiteDatabase, id: number) {
  await db.runAsync('DELETE FROM weight_log WHERE id = ?', id);
  invalidate();
}

export async function latestWeight(db: SQLiteDatabase) {
  return db.getFirstAsync<WeightEntry>('SELECT id, date, kg, note FROM weight_log ORDER BY date DESC, created_at DESC LIMIT 1');
}
