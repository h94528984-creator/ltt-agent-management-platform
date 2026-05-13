// =====================================================
//  Notifications Handler
//  GET  /api/notifications
//  PATCH /api/notifications/:id/read ← تحديد كمقروء
// =====================================================

import type { HandlerEvent, HandlerResponse } from '@netlify/functions';
import { ok, notFound, methodNotAllowed, serverError } from '../api';

export async function handleNotifications(event: HandlerEvent, match: RegExpExecArray): Promise<HandlerResponse> {
  const notificationId = match[1];
  const method = event.httpMethod;

  try {
    // ---- PATCH /api/notifications/:id/read ----
    if (method === 'PATCH' && notificationId) {
      const { markAsRead } = await import('../../lib/db/src/queries/notifications');
      const result = await markAsRead(Number(notificationId));
      if (!result) return notFound('Notification not found');
      return ok(result);
    }

    // ---- GET /api/notifications ----
    if (method === 'GET') {
      const query = event.queryStringParameters || {};
      const { getNotifications } = await import('../../lib/db/src/queries/notifications');
      const notifications = await getNotifications(query);
      return ok(notifications);
    }

    return methodNotAllowed();
  } catch (err: any) {
    return serverError(err);
  }
}
