// =====================================================
//  Dashboard Handler
//  GET /api/dashboard/stats
// =====================================================

import type { HandlerEvent, HandlerResponse } from '@netlify/functions';
import { ok, methodNotAllowed, serverError } from '../api';

export async function handleDashboard(event: HandlerEvent, _match: RegExpExecArray): Promise<HandlerResponse> {
  if (event.httpMethod !== 'GET') return methodNotAllowed();

  try {
    const { getDashboardStats } = await import('../../lib/db/src/queries/dashboard');
    const stats = await getDashboardStats();
    return ok(stats);
  } catch (err: any) {
    return serverError(err);
  }
}
