// =====================================================
//  Auth Handler
//  POST /api/auth/login
// =====================================================

import type { HandlerEvent, HandlerResponse } from '@netlify/functions';
import { ok, badRequest, methodNotAllowed, serverError } from '../api';

export async function handleAuth(event: HandlerEvent, _match: RegExpExecArray): Promise<HandlerResponse> {
  if (event.httpMethod !== 'POST') return methodNotAllowed();

  try {
    const body = JSON.parse(event.body || '{}');
    const { email, password } = body;

    if (!email || !password) {
      return badRequest('Email and password are required');
    }

    // استيراد ديناميكي لمنع فشل التحميل إذا لم تكن قاعدة البيانات مهيأة
    const { loginUser } = await import('../../lib/db/src/queries/auth');
    const result = await loginUser(email, password);

    return ok(result);
  } catch (err: any) {
    if (err.message?.includes('Invalid') || err.message?.includes('not found')) {
      return badRequest(err.message || 'Invalid email or password');
    }
    return serverError(err);
  }
}
