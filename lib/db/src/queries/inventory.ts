import type { DB } from '../workers-db';

export async function getInventory(db: DB) {
  const result = await db.execute('SELECT * FROM inventory ORDER BY name');
  return result.rows || [];
}

export async function getInventoryItem(db: DB, id: number) {
  const result = await db.execute('SELECT * FROM inventory WHERE id = $1', [id]);
  return result.rows?.[0] || null;
}
