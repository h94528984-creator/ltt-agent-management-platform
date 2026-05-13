import type { DB } from '../../../lib/db/src/workers-db';

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  });
}

export async function handleUsers(db: DB, request: Request, match: RegExpExecArray, _env: unknown): Promise<Response> {
  const userId = match[1];
  const method = request.method;

  try {
    if (method === 'GET' && userId) {
      const { getUserById } = await import('../../../lib/db/src/queries/users');
      const user = await getUserById(db, Number(userId));
      if (!user) return json({ error: 'User not found' }, 404);
      const { password, ...safeUser } = user as any;
      return json(safeUser);
    }

    if (method === 'GET') {
      const { getUsers } = await import('../../../lib/db/src/queries/users');
      const users = await getUsers(db);
      const safeUsers = (users as any[]).map(({ password, ...u }) => u);
      return json(safeUsers);
    }

    return json({ error: 'Method not allowed' }, 405);
  } catch (err: any) {
    console.error(`[users handler] ${err.message}`);
    throw err;
  }
}
