// =====================================================
//  Analytics Handler
//  GET /api/analytics
// =====================================================

import type { HandlerEvent, HandlerResponse } from '@netlify/functions';
import { ok, methodNotAllowed, serverError } from '../api';

export async function handleAnalytics(event: HandlerEvent, _match: RegExpExecArray): Promise<HandlerResponse> {
  if (event.httpMethod !== 'GET') return methodNotAllowed();

  try {
    const query = event.queryStringParameters || {};
    const { getAnalytics } = await import('../../lib/db/src/queries/analytics');
    const analytics = await getAnalytics(query);
    return ok(analytics);
  } catch (err: any) {
    return serverError(err);
  }
}
