// =====================================================
//  Health Check Handler
//  GET /api/health
// =====================================================

import type { HandlerEvent, HandlerResponse } from '@netlify/functions';
import { ok, methodNotAllowed } from '../api';

export async function handleHealth(event: HandlerEvent, _match: RegExpExecArray): Promise<HandlerResponse> {
  if (event.httpMethod !== 'GET') return methodNotAllowed();

  return ok({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'LTT Agent Management Platform',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'production',
    netlify: true,
    database: process.env.DATABASE_URL ? 'configured' : 'not configured',
    uptime: process.uptime(),
  });
}
