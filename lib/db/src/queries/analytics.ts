import { getDb } from '../netlify-db';

export async function getAnalytics(query?: Record<string, string>) {
  const db = getDb();
  const result = await db.execute('SELECT city, COUNT(*) as count FROM agents GROUP BY city ORDER BY count DESC');
  return result.rows || [];
}
