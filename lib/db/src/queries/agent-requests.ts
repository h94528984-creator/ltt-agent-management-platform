import { getDb } from '../netlify-db';

export async function getAgentRequests(query?: Record<string, string>) {
  const db = getDb();
  const result = await db.execute('SELECT * FROM agent_requests ORDER BY created_at DESC');
  return result.rows || [];
}

export async function createAgentRequest(data: Record<string, unknown>) {
  const db = getDb();
  const result = await db.execute(
    'INSERT INTO agent_requests (entity_type, status) VALUES ($1, $2) RETURNING *',
    [data.entityType || 'inspection', 'pending'],
  );
  return result.rows?.[0];
}

export async function updateAgentRequestStatus(id: string, status: string) {
  const db = getDb();
  const result = await db.execute(
    'UPDATE agent_requests SET status = $1 WHERE id = $2 RETURNING *',
    [status, id],
  );
  return result.rows?.[0] || null;
}
