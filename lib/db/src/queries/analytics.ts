import type { DB } from '../workers-db';

export async function getAnalytics(db: DB, query?: Record<string, string>) {
  const result = await db.execute('SELECT city, COUNT(*) as count FROM agents GROUP BY city ORDER BY count DESC');
  return result.rows || [];
}
