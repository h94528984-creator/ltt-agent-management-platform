// =====================================================
//  Sales Logs Handler
//  GET /api/sales-logs
// =====================================================

import type { HandlerEvent, HandlerResponse } from '@netlify/functions';
import { ok, methodNotAllowed, serverError } from '../api';

export async function handleSalesLogs(event: HandlerEvent, _match: RegExpExecArray): Promise<HandlerResponse> {
  if (event.httpMethod !== 'GET') return methodNotAllowed();

  try {
    const query = event.queryStringParameters || {};
    const { getSalesLogs } = await import('../../lib/db/src/queries/sales-logs');
    const logs = await getSalesLogs(query);
    return ok(logs);
  } catch (err: any) {
    return serverError(err);
  }
}
