import type { DB } from '../../../lib/db/src/workers-db';

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  });
}

function error(message: string, status = 400): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  });
}

export async function handleAuth(db: DB, request: Request, _match: RegExpExecArray, _env: unknown): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
  }

  try {
    const body = await request.json() as any;
    const { email, password } = body;

    if (!email || !password) return error('Email and password are required');

    const { loginUser } = await import('../../../lib/db/src/queries/auth');
    const result = await loginUser(db, email, password);
    return json(result);
  } catch (err: any) {
    if (err.message?.includes('Invalid') || err.message?.includes('not found')) {
      return error(err.message || 'Invalid email or password');
    }
    throw err;
  }
}
