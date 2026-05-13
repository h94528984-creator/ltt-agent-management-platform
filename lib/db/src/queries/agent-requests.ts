import type { DB } from '../workers-db';

export async function getAgentRequests(db: DB, query?: Record<string, string>) {
  const result = await db.execute('SELECT * FROM agent_requests ORDER BY created_at DESC');
  return result.rows || [];
}

export async function createAgentRequest(db: DB, data: Record<string, unknown>) {
  const result = await db.execute(
    'INSERT INTO agent_requests (entity_type, status) VALUES ($1, $2) RETURNING *',
    [data.entityType || 'inspection', 'pending'],
  );
  return result.rows?.[0];
}

export async function updateAgentRequestStatus(db: DB, id: string, status: string) {
  const result = await db.execute(
    'UPDATE agent_requests SET status = $1 WHERE id = $2 RETURNING *',
    [status, id],
  );
  return result.rows?.[0] || null;
}
