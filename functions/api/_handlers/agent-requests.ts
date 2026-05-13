import type { DB } from '../../../lib/db/src/workers-db';

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  });
}

export async function handleAgentRequests(db: DB, request: Request, match: RegExpExecArray, _env: unknown): Promise<Response> {
  const resourceId = match[1];
  const method = request.method;
  const url = new URL(request.url);

  try {
    if (method === 'PATCH' && url.pathname.includes('/status')) {
      const body = await request.json() as any;
      const { status: newStatus } = body;

      if (!newStatus) return json({ error: 'Status is required' }, 400);
      if (!['pending', 'approved', 'rejected', 'cancelled'].includes(newStatus)) {
        return json({ error: 'Invalid status value' }, 400);
      }

      const { updateAgentRequestStatus } = await import('../../../lib/db/src/queries/agent-requests');
      const result = await updateAgentRequestStatus(db, resourceId, newStatus);
      if (!result) return json({ error: 'Agent request not found' }, 404);
      return json(result);
    }

    if (method === 'POST') {
      const body = await request.json() as any;
      const { createAgentRequest } = await import('../../../lib/db/src/queries/agent-requests');
      const result = await createAgentRequest(db, body);
      return json(result, 201);
    }

    if (method === 'GET') {
      const query = Object.fromEntries(url.searchParams.entries());
      const { getAgentRequests } = await import('../../../lib/db/src/queries/agent-requests');
      const requests = await getAgentRequests(db, query);
      return json(requests);
    }

    return json({ error: 'Method not allowed' }, 405);
  } catch (err: any) {
    console.error(`[agent-requests handler] ${err.message}`);
    throw err;
  }
}
