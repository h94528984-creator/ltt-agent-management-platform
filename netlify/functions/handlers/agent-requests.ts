// =====================================================
//  Agent Requests (Inspections) Handler
//  GET   /api/agent-requests                ← قائمة
//  POST  /api/agent-requests                ← إنشاء جديد
//  PATCH /api/agent-request/:id/status      ← تحديث الحالة
// =====================================================

import type { HandlerEvent, HandlerResponse } from '@netlify/functions';
import { ok, created, notFound, badRequest, methodNotAllowed, serverError } from '../api';

export async function handleAgentRequests(event: HandlerEvent, match: RegExpExecArray): Promise<HandlerResponse> {
  const resourceId = match[1]; // قد يكون request ID
  const method = event.httpMethod;
  const path = event.path;

  try {
    // ---- PATCH /api/agent-request/:id/status ----
    if (method === 'PATCH' && path.includes('/status')) {
      const body = JSON.parse(event.body || '{}');
      const { status: newStatus } = body;

      if (!newStatus) return badRequest('Status is required');
      if (!['pending', 'approved', 'rejected', 'cancelled'].includes(newStatus)) {
        return badRequest('Invalid status value');
      }

      const { updateAgentRequestStatus } = await import('../../lib/db/src/queries/agent-requests');
      const result = await updateAgentRequestStatus(resourceId, newStatus);
      if (!result) return notFound('Agent request not found');
      return ok(result);
    }

    // ---- POST /api/agent-requests ----
    if (method === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const { createAgentRequest } = await import('../../lib/db/src/queries/agent-requests');
      const result = await createAgentRequest(body);
      return created(result);
    }

    // ---- GET /api/agent-requests ----
    if (method === 'GET') {
      const query = event.queryStringParameters || {};
      const { getAgentRequests } = await import('../../lib/db/src/queries/agent-requests');
      const requests = await getAgentRequests(query);
      return ok(requests);
    }

    return methodNotAllowed();
  } catch (err: any) {
    return serverError(err);
  }
}
