import type { DB } from '../../../lib/db/src/workers-db';

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  });
}

export async function handleDocuments(db: DB, request: Request, _match: RegExpExecArray, _env: unknown): Promise<Response> {
  const method = request.method;
  const url = new URL(request.url);

  try {
    if (method === 'GET' && url.pathname.includes('/agent-status')) {
      const { getAgentDocumentStatus } = await import('../../../lib/db/src/queries/documents');
      const status = await getAgentDocumentStatus(db);
      return json(status);
    }

    if (method === 'GET') {
      const query = Object.fromEntries(url.searchParams.entries());
      const { getDocuments } = await import('../../../lib/db/src/queries/documents');
      const docs = await getDocuments(db, query);
      return json(docs);
    }

    if (method === 'POST') {
      const body = await request.json() as any;
      const { createDocument } = await import('../../../lib/db/src/queries/documents');
      const result = await createDocument(db, body);
      return json(result, 201);
    }

    return json({ error: 'Method not allowed' }, 405);
  } catch (err: any) {
    console.error(`[documents handler] ${err.message}`);
    throw err;
  }
}
