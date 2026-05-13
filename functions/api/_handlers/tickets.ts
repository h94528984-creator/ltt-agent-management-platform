import type { DB } from '../../../lib/db/src/workers-db';

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  });
}

export async function handleTickets(db: DB, request: Request, match: RegExpExecArray, _env: unknown): Promise<Response> {
  const ticketId = match[1];
  const method = request.method;
  const url = new URL(request.url);

  try {
    if (method === 'GET' && ticketId) {
      const { getTicketById } = await import('../../../lib/db/src/queries/tickets');
      const ticket = await getTicketById(db, Number(ticketId));
      if (!ticket) return json({ error: 'Ticket not found' }, 404);
      return json(ticket);
    }

    if (method === 'GET') {
      const query = Object.fromEntries(url.searchParams.entries());
      const { getTickets } = await import('../../../lib/db/src/queries/tickets');
      const tickets = await getTickets(db, query);
      return json(tickets);
    }

    if (method === 'POST') {
      const body = await request.json() as any;
      const { createTicket } = await import('../../../lib/db/src/queries/tickets');
      const result = await createTicket(db, body);
      return json(result, 201);
    }

    return json({ error: 'Method not allowed' }, 405);
  } catch (err: any) {
    console.error(`[tickets handler] ${err.message}`);
    throw err;
  }
}
