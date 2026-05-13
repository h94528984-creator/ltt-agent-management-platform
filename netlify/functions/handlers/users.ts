// =====================================================
//  Users Handler
//  GET  /api/users         ← قائمة المستخدمين
//  GET  /api/users/:id     ← مستخدم معين
// =====================================================

import type { HandlerEvent, HandlerResponse } from '@netlify/functions';
import { ok, notFound, methodNotAllowed, serverError } from '../api';

export async function handleUsers(event: HandlerEvent, match: RegExpExecArray): Promise<HandlerResponse> {
  const userId = match[1];
  const method = event.httpMethod;

  try {
    // ---- GET /api/users/:id ----
    if (method === 'GET' && userId) {
      const { getUserById } = await import('../../lib/db/src/queries/users');
      const user = await getUserById(Number(userId));
      if (!user) return notFound('User not found');
      // لا نعيد كلمة السر
      const { password, ...safeUser } = user;
      return ok(safeUser);
    }

    // ---- GET /api/users ----
    if (method === 'GET') {
      const { getUsers } = await import('../../lib/db/src/queries/users');
      const users = await getUsers();
      // إخفاء كلمات السر
      const safeUsers = users.map(({ password, ...u }: any) => u);
      return ok(safeUsers);
    }

    return methodNotAllowed();
  } catch (err: any) {
    return serverError(err);
  }
}
