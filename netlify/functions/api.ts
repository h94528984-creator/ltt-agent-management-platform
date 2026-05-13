// =====================================================
//  LTT API - Netlify Function Router
//  نقطة الدخول الوحيدة لجميع مسارات API
//  يستقبل الطلبات من /api/* ويوجهها للمعالج المناسب
// =====================================================

import type { HandlerEvent, HandlerContext, HandlerResponse } from '@netlify/functions';

// Import handlers
import { handleAgents } from './handlers/agents';
import { handleAgentRequests } from './handlers/agent-requests';
import { handleTickets } from './handlers/tickets';
import { handleUsers } from './handlers/users';
import { handleInventory } from './handlers/inventory';
import { handleDashboard } from './handlers/dashboard';
import { handleAnalytics } from './handlers/analytics';
import { handleDocuments } from './handlers/documents';
import { handleSalesLogs } from './handlers/sales-logs';
import { handleNotifications } from './handlers/notifications';
import { handleAuth } from './handlers/auth';
import { handleHealth } from './handlers/health';

// ---- CORS Headers ----
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Credentials': 'true',
  'Content-Type': 'application/json',
};

const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
};

// ---- Response Helpers ----
export function ok(data: unknown, headers?: Record<string, string>): HandlerResponse {
  return { statusCode: 200, headers: { ...CORS_HEADERS, ...headers }, body: JSON.stringify(data) };
}

export function created(data: unknown): HandlerResponse {
  return { statusCode: 201, headers: CORS_HEADERS, body: JSON.stringify(data) };
}

export function badRequest(message: string): HandlerResponse {
  return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: message }) };
}

export function notFound(message = 'Resource not found'): HandlerResponse {
  return { statusCode: 404, headers: CORS_HEADERS, body: JSON.stringify({ error: message }) };
}

export function methodNotAllowed(): HandlerResponse {
  return { statusCode: 405, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Method not allowed' }) };
}

export function serverError(error: Error | string): HandlerResponse {
  const message = error instanceof Error ? error.message : error;
  console.error(`[API ERROR] ${message}`);
  return {
    statusCode: 500,
    headers: CORS_HEADERS,
    body: JSON.stringify({ error: process.env.NODE_ENV === 'production' ? 'Internal server error' : message }),
  };
}

// ---- Route Map ----
// كل مسار API يتم ربطه بالمعالج المناسب
const ROUTE_MAP: Array<{
  pattern: RegExp;
  handler: (event: HandlerEvent, match: RegExpExecArray) => Promise<HandlerResponse>;
}> = [
  // Health
  { pattern: /^\/api\/health\/?$/, handler: handleHealth },

  // Auth
  { pattern: /^\/api\/auth\/login\/?$/, handler: handleAuth },

  // Dashboard
  { pattern: /^\/api\/dashboard\/stats\/?$/, handler: handleDashboard },

  // Analytics
  { pattern: /^\/api\/analytics\/?$/, handler: handleAnalytics },

  // Agents
  { pattern: /^\/api\/agents\/(\d+)\/?$/, handler: handleAgents },       // /api/agents/:id
  { pattern: /^\/api\/agents\/?$/, handler: handleAgents },                // /api/agents

  // Agent Requests (Inspections)
  { pattern: /^\/api\/agent-request\/(\d+)\/status\/?$/, handler: handleAgentRequests },  // /api/agent-request/:id/status
  { pattern: /^\/api\/agent-requests\/?$/, handler: handleAgentRequests },                 // /api/agent-requests

  // Tickets
  { pattern: /^\/api\/tickets\/(\d+)\/?$/, handler: handleTickets },      // /api/tickets/:id
  { pattern: /^\/api\/tickets\/?$/, handler: handleTickets },              // /api/tickets

  // Users
  { pattern: /^\/api\/users\/(\d+)\/?$/, handler: handleUsers },          // /api/users/:id
  { pattern: /^\/api\/users\/?$/, handler: handleUsers },                  // /api/users

  // Inventory
  { pattern: /^\/api\/inventory\/(\d+)\/?$/, handler: handleInventory },  // /api/inventory/:id
  { pattern: /^\/api\/inventory\/?$/, handler: handleInventory },          // /api/inventory

  // Documents
  { pattern: /^\/api\/documents\/agent-status\/?$/, handler: handleDocuments },  // /api/documents/agent-status
  { pattern: /^\/api\/documents\/?$/, handler: handleDocuments },                  // /api/documents

  // Sales Logs
  { pattern: /^\/api\/sales-logs\/?$/, handler: handleSalesLogs },

  // Notifications
  { pattern: /^\/api\/notifications\/?$/, handler: handleNotifications },
];

// ---- Main Router ----
export const handler = async (event: HandlerEvent, _context: HandlerContext): Promise<HandlerResponse> => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS_HEADERS, body: '' };
  }

  const path = event.path;

  try {
    // Find matching route
    for (const { pattern, handler: routeHandler } of ROUTE_MAP) {
      const match = pattern.exec(path);
      if (match) {
        return await routeHandler(event, match);
      }
    }

    // No route matched
    return notFound(`API endpoint not found: ${path}`);
  } catch (error) {
    return serverError(error as Error);
  }
};
