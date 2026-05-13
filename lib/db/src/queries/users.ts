import type { DB } from '../workers-db';

export async function getUsers(db: DB) {
  const result = await db.execute('SELECT id, email, full_name AS "fullName", role FROM users ORDER BY full_name');
  return result.rows || [];
}

export async function getUserById(db: DB, id: number) {
  const result = await db.execute('SELECT id, email, full_name AS "fullName", role, password FROM users WHERE id = $1', [id]);
  return result.rows?.[0] || null;
}
