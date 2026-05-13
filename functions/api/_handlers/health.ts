import type { DB } from '../../../lib/db/src/workers-db';

export async function handleHealth(db: DB, request: Request, _match: RegExpExecArray, env: { DATABASE_URL?: string; NODE_ENV?: string }): Promise<Response> {
  if (request.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { 'Content-Type': 'application/json' } });
  }

  return new Response(JSON.stringify({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'LTT Agent Management Platform',
    version: '1.0.0',
    environment: env.NODE_ENV || 'production',
    cloudflare: true,
    database: env.DATABASE_URL ? 'configured' : 'not configured',
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  });
}
