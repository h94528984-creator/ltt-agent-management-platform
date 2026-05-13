// =====================================================
//  Inventory Handler
//  GET  /api/inventory         ← قائمة المخزون
//  GET  /api/inventory/:id     ← صنف معين
// =====================================================

import type { HandlerEvent, HandlerResponse } from '@netlify/functions';
import { ok, notFound, methodNotAllowed, serverError } from '../api';

export async function handleInventory(event: HandlerEvent, match: RegExpExecArray): Promise<HandlerResponse> {
  const itemId = match[1];
  const method = event.httpMethod;

  try {
    // ---- GET /api/inventory/:id ----
    if (method === 'GET' && itemId) {
      const { getInventoryItem } = await import('../../lib/db/src/queries/inventory');
      const item = await getInventoryItem(Number(itemId));
      if (!item) return notFound('Inventory item not found');
      return ok(item);
    }

    // ---- GET /api/inventory ----
    if (method === 'GET') {
      const { getInventory } = await import('../../lib/db/src/queries/inventory');
      const inventory = await getInventory();
      return ok(inventory);
    }

    return methodNotAllowed();
  } catch (err: any) {
    return serverError(err);
  }
}
