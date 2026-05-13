import type { DB } from '../../../lib/db/src/workers-db';

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  });
}

export async function handleDashboard(db: DB, request: Request, _match: RegExpExecArray, _env: unknown): Promise<Response> {
  if (request.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
  }

  try {
    const { getDashboardStats } = await import('../../../lib/db/src/queries/dashboard');
    const stats = await getDashboardStats(db);
    return json(stats);
  } catch (err: any) {
    console.error(`[dashboard handler] ${err.message}`);
    throw err;
  }
}
