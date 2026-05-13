import type { DB } from '../../../lib/db/src/workers-db';

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  });
}

export async function handleNotifications(db: DB, request: Request, match: RegExpExecArray, _env: unknown): Promise<Response> {
  const notificationId = match[1];
  const method = request.method;

  try {
    if (method === 'PATCH' && notificationId) {
      const { markAsRead } = await import('../../../lib/db/src/queries/notifications');
      const result = await markAsRead(db, Number(notificationId));
      if (!result) return json({ error: 'Notification not found' }, 404);
      return json(result);
    }

    if (method === 'GET') {
      const url = new URL(request.url);
      const query = Object.fromEntries(url.searchParams.entries());
      const { getNotifications } = await import('../../../lib/db/src/queries/notifications');
      const notifications = await getNotifications(db, query);
      return json(notifications);
    }

    return json({ error: 'Method not allowed' }, 405);
  } catch (err: any) {
    console.error(`[notifications handler] ${err.message}`);
    throw err;
  }
}
