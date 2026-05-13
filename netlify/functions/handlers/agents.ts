// =====================================================
//  Agents Handler
//  GET  /api/agents         ← قائمة الوكلاء
//  GET  /api/agents/:id     ← وكيل معين
//  POST /api/agents         ← إنشاء وكيل جديد
// =====================================================

import type { HandlerEvent, HandlerResponse } from '@netlify/functions';
import { ok, created, notFound, badRequest, methodNotAllowed, serverError } from '../api';

export async function handleAgents(event: HandlerEvent, match: RegExpExecArray): Promise<HandlerResponse> {
  const agentId = match[1]; // string | undefined
  const method = event.httpMethod;

  try {
    // ---- GET /api/agents/:id ----
    if (method === 'GET' && agentId) {
      const { getAgentById } = await import('../../lib/db/src/queries/agents');
      const agent = await getAgentById(Number(agentId));
      if (!agent) return notFound('Agent not found');
      return ok(agent);
    }

    // ---- GET /api/agents ----
    if (method === 'GET') {
      const query = event.queryStringParameters || {};
      const { getAgents } = await import('../../lib/db/src/queries/agents');
      const agents = await getAgents(query);
      return ok(agents);
    }

    // ---- POST /api/agents ----
    if (method === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const { createAgent } = await import('../../lib/db/src/queries/agents');
      const result = await createAgent(body);
      return created(result);
    }

    return methodNotAllowed();
  } catch (err: any) {
    return serverError(err);
  }
}
