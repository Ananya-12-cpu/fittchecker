import type { SQLiteDatabase } from 'expo-sqlite';

export const DB_NAME = 'fitchecker.db';

/**
 * Versioned migrations using PRAGMA user_version (pattern from the expo-sqlite docs).
 * To change the schema: append a new entry — never edit an applied one.
 */
const MIGRATIONS: string[] = [
  // v1 — initial schema
  `
  CREATE TABLE IF NOT EXISTS food_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    meal TEXT NOT NULL,
    food_id TEXT NOT NULL,
    food_name TEXT NOT NULL,
    unit TEXT NOT NULL,
    quantity REAL NOT NULL,
    grams REAL NOT NULL,
    kcal REAL NOT NULL,
    protein REAL NOT NULL DEFAULT 0,
    carbs REAL NOT NULL DEFAULT 0,
    fat REAL NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_food_log_date ON food_log(date);

  CREATE TABLE IF NOT EXISTS exercise_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    activity_id TEXT NOT NULL,
    name TEXT NOT NULL,
    minutes REAL NOT NULL,
    kcal REAL NOT NULL,
    created_at INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_exercise_log_date ON exercise_log(date);

  CREATE TABLE IF NOT EXISTS water_log (
    date TEXT PRIMARY KEY NOT NULL,
    ml INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS weight_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    kg REAL NOT NULL,
    note TEXT,
    created_at INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_weight_log_date ON weight_log(date);

  CREATE TABLE IF NOT EXISTS custom_food (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    kcal REAL NOT NULL,
    protein REAL NOT NULL DEFAULT 0,
    carbs REAL NOT NULL DEFAULT 0,
    fat REAL NOT NULL DEFAULT 0,
    units_json TEXT NOT NULL,
    default_unit TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );
  `,
];

export async function migrateDbIfNeeded(db: SQLiteDatabase) {
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  let version = row?.user_version ?? 0;
  if (version === 0) {
    await db.execAsync(`PRAGMA journal_mode = 'wal';`);
  }
  while (version < MIGRATIONS.length) {
    await db.execAsync(MIGRATIONS[version]);
    version += 1;
    await db.execAsync(`PRAGMA user_version = ${version}`);
  }
}

export async function wipeAllData(db: SQLiteDatabase) {
  await db.execAsync(`
    DELETE FROM food_log;
    DELETE FROM exercise_log;
    DELETE FROM water_log;
    DELETE FROM weight_log;
    DELETE FROM custom_food;
  `);
}
