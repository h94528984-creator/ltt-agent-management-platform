import { getDb } from '../netlify-db';

export async function getNotifications(query?: Record<string, string>) {
  const db = getDb();
  const result = await db.execute('SELECT * FROM notifications ORDER BY created_at DESC');
  return result.rows || [];
}

export async function markAsRead(id: number) {
  const db = getDb();
  const result = await db.execute('UPDATE notifications SET is_read = true WHERE id = $1 RETURNING *', [id]);
  return result.rows?.[0] || null;
}
