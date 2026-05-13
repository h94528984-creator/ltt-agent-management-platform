import { getDb } from '../netlify-db';

export async function getSalesLogs(query?: Record<string, string>) {
  const db = getDb();
  const result = await db.execute('SELECT * FROM sales_logs ORDER BY sale_date DESC');
  return result.rows || [];
}
