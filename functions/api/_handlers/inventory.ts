import type { DB } from '../../../lib/db/src/workers-db';

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  });
}

export async function handleInventory(db: DB, request: Request, match: RegExpExecArray, _env: unknown): Promise<Response> {
  const itemId = match[1];
  const method = request.method;

  try {
    if (method === 'GET' && itemId) {
      const { getInventoryItem } = await import('../../../lib/db/src/queries/inventory');
      const item = await getInventoryItem(db, Number(itemId));
      if (!item) return json({ error: 'Inventory item not found' }, 404);
      return json(item);
    }

    if (method === 'GET') {
      const { getInventory } = await import('../../../lib/db/src/queries/inventory');
      const inventory = await getInventory(db);
      return json(inventory);
    }

    return json({ error: 'Method not allowed' }, 405);
  } catch (err: any) {
    console.error(`[inventory handler] ${err.message}`);
    throw err;
  }
}
