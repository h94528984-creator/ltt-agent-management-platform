import type { DB } from '../workers-db';

export async function getDashboardStats(db: DB) {
  const [agents, requests, tickets] = await Promise.all([
    db.execute('SELECT COUNT(*) as total FROM agents'),
    db.execute('SELECT COUNT(*) as total FROM agent_requests'),
    db.execute('SELECT COUNT(*) as total FROM tickets WHERE status = $1', ['open']),
  ]);
  return {
    totalAgents: Number(agents.rows?.[0]?.total || 0),
    totalRequests: Number(requests.rows?.[0]?.total || 0),
    openTickets: Number(tickets.rows?.[0]?.total || 0),
  };
}
