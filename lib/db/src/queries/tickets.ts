import type { DB } from '../workers-db';

export async function getTickets(db: DB, query?: Record<string, string>) {
  const result = await db.execute('SELECT * FROM tickets ORDER BY created_at DESC');
  return result.rows || [];
}

export async function getTicketById(db: DB, id: number) {
  const result = await db.execute('SELECT * FROM tickets WHERE id = $1', [id]);
  return result.rows?.[0] || null;
}

export async function createTicket(db: DB, data: Record<string, unknown>) {
  const result = await db.execute(
    'INSERT INTO tickets (title, description, priority, status, created_by_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [data.title, data.description, data.priority || 'medium', 'open', data.createdById],
  );
  return result.rows?.[0];
}
