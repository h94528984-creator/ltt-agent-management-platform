import type { DB } from '../workers-db';

export async function getAgents(db: DB, query?: Record<string, string>) {
  const result = await db.execute('SELECT * FROM agents ORDER BY name');
  return result.rows || [];
}

export async function getAgentById(db: DB, id: number) {
  const result = await db.execute('SELECT * FROM agents WHERE id = $1', [id]);
  return result.rows?.[0] || null;
}

export async function createAgent(db: DB, data: Record<string, unknown>) {
  const result = await db.execute(
    'INSERT INTO agents (name, city, phone, email) VALUES ($1, $2, $3, $4) RETURNING *',
    [data.name, data.city, data.phone, data.email],
  );
  return result.rows?.[0];
}
