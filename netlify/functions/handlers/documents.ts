// =====================================================
//  Documents Handler
//  GET  /api/documents              ← قائمة المستندات
//  GET  /api/documents/agent-status ← حالة مستندات الوكلاء
//  POST /api/documents              ← إضافة مستند
// =====================================================

import type { HandlerEvent, HandlerResponse } from '@netlify/functions';
import { ok, created, badRequest, methodNotAllowed, serverError } from '../api';

export async function handleDocuments(event: HandlerEvent, _match: RegExpExecArray): Promise<HandlerResponse> {
  const method = event.httpMethod;
  const path = event.path;

  try {
    // ---- GET /api/documents/agent-status ----
    if (method === 'GET' && path.includes('/agent-status')) {
      const { getAgentDocumentStatus } = await import('../../lib/db/src/queries/documents');
      const status = await getAgentDocumentStatus();
      return ok(status);
    }

    // ---- GET /api/documents ----
    if (method === 'GET') {
      const query = event.queryStringParameters || {};
      const { getDocuments } = await import('../../lib/db/src/queries/documents');
      const docs = await getDocuments(query);
      return ok(docs);
    }

    // ---- POST /api/documents ----
    if (method === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const { createDocument } = await import('../../lib/db/src/queries/documents');
      const result = await createDocument(body);
      return created(result);
    }

    return methodNotAllowed();
  } catch (err: any) {
    return serverError(err);
  }
}
