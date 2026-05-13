import { getDb } from '../netlify-db';

export async function getInventory() {
  const db = getDb();
  const result = await db.execute('SELECT * FROM inventory ORDER BY name');
  return result.rows || [];
}

export async function getInventoryItem(id: number) {
  const db = getDb();
  const result = await db.execute('SELECT * FROM inventory WHERE id = $1', [id]);
  return result.rows?.[0] || null;
}
