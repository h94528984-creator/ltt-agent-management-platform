import { createDb } from '../../lib/db/src/workers-db';
import type { DB } from '../../lib/db/src/workers-db';

import { handleHealth } from './_handlers/health';
import { handleAuth } from './_handlers/auth';
import { handleAgents } from './_handlers/agents';
import { handleAgentRequests } from './_handlers/agent-requests';
import { handleTickets } from './_handlers/tickets';
import { handleUsers } from './_handlers/users';
import { handleInventory } from './_handlers/inventory';
import { handleDashboard } from './_handlers/dashboard';
import { handleAnalytics } from './_handlers/analytics';
import { handleDocuments } from './_handlers/documents';
import { handleSalesLogs } from './_handlers/sales-logs';
import { handleNotifications } from './_handlers/notifications';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Credentials': 'true',
  'Content-Type': 'application/json',
};

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: CORS_HEADERS,
  });
}

function error(message: string, status = 500): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: CORS_HEADERS,
  });
}

interface RouteHandler {
  pattern: RegExp;
  handler: (db: DB, request: Request, match: RegExpExecArray, env: Env) => Promise<Response>;
}

interface Env {
  DATABASE_URL: string;
  NODE_ENV?: string;
}

const ROUTE_MAP: RouteHandler[] = [
  { pattern: /^\/api\/health\/?$/, handler: handleHealth },
  { pattern: /^\/api\/auth\/login\/?$/, handler: handleAuth },
  { pattern: /^\/api\/dashboard\/stats\/?$/, handler: handleDashboard },
  { pattern: /^\/api\/analytics\/?$/, handler: handleAnalytics },
  { pattern: /^\/api\/agents\/(\d+)\/?$/, handler: handleAgents },
  { pattern: /^\/api\/agents\/?$/, handler: handleAgents },
  { pattern: /^\/api\/agent-request\/(\d+)\/status\/?$/, handler: handleAgentRequests },
  { pattern: /^\/api\/agent-requests\/?$/, handler: handleAgentRequests },
  { pattern: /^\/api\/tickets\/(\d+)\/?$/, handler: handleTickets },
  { pattern: /^\/api\/tickets\/?$/, handler: handleTickets },
  { pattern: /^\/api\/users\/(\d+)\/?$/, handler: handleUsers },
  { pattern: /^\/api\/users\/?$/, handler: handleUsers },
  { pattern: /^\/api\/inventory\/(\d+)\/?$/, handler: handleInventory },
  { pattern: /^\/api\/inventory\/?$/, handler: handleInventory },
  { pattern: /^\/api\/documents\/agent-status\/?$/, handler: handleDocuments },
  { pattern: /^\/api\/documents\/?$/, handler: handleDocuments },
  { pattern: /^\/api\/sales-logs\/?$/, handler: handleSalesLogs },
  { pattern: /^\/api\/notifications\/?$/, handler: handleNotifications },
];

export async function onRequest(context: { request: Request; env: Env; params: any }): Promise<Response> {
  const { request, env } = context;

  // CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  const url = new URL(request.url);
  let db: DB;

  try {
    db = createDb(env);
  } catch (err: any) {
    return error(err.message, 500);
  }

  try {
    for (const { pattern, handler: routeHandler } of ROUTE_MAP) {
      const match = pattern.exec(url.pathname);
      if (match) {
        return await routeHandler(db, request, match, env);
      }
    }

    return error(`API endpoint not found: ${url.pathname}`, 404);
  } catch (err: any) {
    console.error(`[API ERROR] ${err.message}`);
    const msg = env.NODE_ENV === 'production' ? 'Internal server error' : err.message;
    return error(msg, 500);
  }
}
