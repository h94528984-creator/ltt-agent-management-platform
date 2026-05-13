// =====================================================
//  Tickets Handler
//  GET   /api/tickets         ← قائمة التذاكر
//  GET   /api/tickets/:id     ← تذكرة معينة
//  POST  /api/tickets         ← إنشاء تذكرة جديدة
// =====================================================

import type { HandlerEvent, HandlerResponse } from '@netlify/functions';
import { ok, created, notFound, methodNotAllowed, serverError } from '../api';

export async function handleTickets(event: HandlerEvent, match: RegExpExecArray): Promise<HandlerResponse> {
  const ticketId = match[1];
  const method = event.httpMethod;

  try {
    // ---- GET /api/tickets/:id ----
    if (method === 'GET' && ticketId) {
      const { getTicketById } = await import('../../lib/db/src/queries/tickets');
      const ticket = await getTicketById(Number(ticketId));
      if (!ticket) return notFound('Ticket not found');
      return ok(ticket);
    }

    // ---- GET /api/tickets ----
    if (method === 'GET') {
      const query = event.queryStringParameters || {};
      const { getTickets } = await import('../../lib/db/src/queries/tickets');
      const tickets = await getTickets(query);
      return ok(tickets);
    }

    // ---- POST /api/tickets ----
    if (method === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const { createTicket } = await import('../../lib/db/src/queries/tickets');
      const result = await createTicket(body);
      return created(result);
    }

    return methodNotAllowed();
  } catch (err: any) {
    return serverError(err);
  }
}
