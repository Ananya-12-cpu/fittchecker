import { useSQLiteContext, type SQLiteDatabase } from 'expo-sqlite';
import { useEffect, useState } from 'react';

import { useDataVersion } from '@/data/events';

/**
 * Runs an async DB read and re-runs it whenever `deps` change or any write calls `invalidate()`.
 * Keeps the previous value while refetching to avoid flicker.
 */
export function useDbQuery<T>(fn: (db: SQLiteDatabase) => Promise<T>, deps: unknown[], initial: T) {
  const db = useSQLiteContext();
  const version = useDataVersion();
  const [data, setData] = useState<T>(initial);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    fn(db)
      .then((result) => {
        if (alive) setData(result);
      })
      .catch((err) => console.warn('[db]', err))
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db, version, ...deps]);

  return { data, loading };
}
