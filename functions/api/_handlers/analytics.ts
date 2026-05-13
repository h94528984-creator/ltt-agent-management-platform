import type { DB } from '../../../lib/db/src/workers-db';

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  });
}

export async function handleAnalytics(db: DB, request: Request, _match: RegExpExecArray, _env: unknown): Promise<Response> {
  if (request.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
  }

  try {
    const url = new URL(request.url);
    const query = Object.fromEntries(url.searchParams.entries());
    const { getAnalytics } = await import('../../../lib/db/src/queries/analytics');
    const analytics = await getAnalytics(db, query);
    return json(analytics);
  } catch (err: any) {
    console.error(`[analytics handler] ${err.message}`);
    throw err;
  }
}
