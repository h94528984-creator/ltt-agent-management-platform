import type { DB } from '../../../lib/db/src/workers-db';

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  });
}

export async function handleAgents(db: DB, request: Request, match: RegExpExecArray, _env: unknown): Promise<Response> {
  const agentId = match[1];
  const method = request.method;
  const url = new URL(request.url);

  try {
    if (method === 'GET' && agentId) {
      const { getAgentById } = await import('../../../lib/db/src/queries/agents');
      const agent = await getAgentById(db, Number(agentId));
      if (!agent) return json({ error: 'Agent not found' }, 404);
      return json(agent);
    }

    if (method === 'GET') {
      const query = Object.fromEntries(url.searchParams.entries());
      const { getAgents } = await import('../../../lib/db/src/queries/agents');
      const agents = await getAgents(db, query);
      return json(agents);
    }

    if (method === 'POST') {
      const body = await request.json() as any;
      const { createAgent } = await import('../../../lib/db/src/queries/agents');
      const result = await createAgent(db, body);
      return json(result, 201);
    }

    return json({ error: 'Method not allowed' }, 405);
  } catch (err: any) {
    console.error(`[agents handler] ${err.message}`);
    throw err;
  }
}
