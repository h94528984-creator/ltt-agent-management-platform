import { getDb } from '../netlify-db';

export async function getAgents(query?: Record<string, string>) {
  const db = getDb();
  const result = await db.execute('SELECT * FROM agents ORDER BY name');
  return result.rows || [];
}

export async function getAgentById(id: number) {
  const db = getDb();
  const result = await db.execute('SELECT * FROM agents WHERE id = $1', [id]);
  return result.rows?.[0] || null;
}

export async function createAgent(data: Record<string, unknown>) {
  const db = getDb();
  const result = await db.execute(
    'INSERT INTO agents (name, city, phone, email) VALUES ($1, $2, $3, $4) RETURNING *',
    [data.name, data.city, data.phone, data.email],
  );
  return result.rows?.[0];
}
