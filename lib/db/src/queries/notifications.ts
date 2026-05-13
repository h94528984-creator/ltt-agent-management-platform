import type { DB } from '../workers-db';

export async function getNotifications(db: DB, query?: Record<string, string>) {
  const result = await db.execute('SELECT * FROM notifications ORDER BY created_at DESC');
  return result.rows || [];
}

export async function markAsRead(db: DB, id: number) {
  const result = await db.execute('UPDATE notifications SET is_read = true WHERE id = $1 RETURNING *', [id]);
  return result.rows?.[0] || null;
}
