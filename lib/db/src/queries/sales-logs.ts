import type { DB } from '../workers-db';

export async function getSalesLogs(db: DB, query?: Record<string, string>) {
  const result = await db.execute('SELECT * FROM sales_logs ORDER BY sale_date DESC');
  return result.rows || [];
}
