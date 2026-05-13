// =====================================================
//  LTT API - Vercel Serverless Entry Point
//  Express app wrapped as Vercel serverless function
// =====================================================
//  هذا الملف هو نقطة الدخول لجميع مسارات API
//  يتم تصدير Express app مباشرة ليعمل مع Vercel
// =====================================================

import express from 'express';
import cors from 'cors';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const app = express();

// ---- CORS ----
app.use(
  cors({
    origin: [
      process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : 'http://localhost:5173',
      ...(process.env.CORS_ORIGINS?.split(',').filter(Boolean) || []),
    ].filter(Boolean),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

// ---- Body Parsing ----
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ---- Request Logging ----
app.use((req, _res, next) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  }
  next();
});

// ---- Health Check ----
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production',
    vercel: !!process.env.VERCEL,
    region: process.env.VERCEL_REGION || 'local',
  });
});

// ---- Auth Routes ----
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const { loginUser } = await import('../lib/db/src/queries/auth');
    const result = await loginUser(email, password);
    res.json(result);
  } catch (err: any) {
    res.status(401).json({ error: err.message || 'Login failed' });
  }
});

// ---- Agents Routes ----
app.get('/api/agents', async (_req, res) => {
  try {
    const { getAgents } = await import('../lib/db/src/queries/agents');
    const agents = await getAgents();
    res.json(agents);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/agents/:id', async (req, res) => {
  try {
    const { getAgentById } = await import('../lib/db/src/queries/agents');
    const agent = await getAgentById(req.params.id);
    if (!agent) return res.status(404).json({ error: 'Agent not found' });
    res.json(agent);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ---- Agent Requests (Inspections) Routes ----
app.get('/api/agent-requests', async (req, res) => {
  try {
    const { getAgentRequests } = await import('../lib/db/src/queries/agent-requests');
    const requests = await getAgentRequests(req.query);
    res.json(requests);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/agent-requests', async (req, res) => {
  try {
    const { createAgentRequest } = await import('../lib/db/src/queries/agent-requests');
    const result = await createAgentRequest(req.body);
    res.status(201).json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/agent-request/:id/status', async (req, res) => {
  try {
    const { updateAgentRequestStatus } = await import('../lib/db/src/queries/agent-requests');
    const result = await updateAgentRequestStatus(req.params.id, req.body.status);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ---- Tickets Routes ----
app.get('/api/tickets', async (req, res) => {
  try {
    const { getTickets } = await import('../lib/db/src/queries/tickets');
    const tickets = await getTickets(req.query);
    res.json(tickets);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/tickets', async (req, res) => {
  try {
    const { createTicket } = await import('../lib/db/src/queries/tickets');
    const result = await createTicket(req.body);
    res.status(201).json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ---- Users Routes ----
app.get('/api/users', async (_req, res) => {
  try {
    const { getUsers } = await import('../lib/db/src/queries/users');
    const users = await getUsers();
    res.json(users);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ---- Inventory Routes ----
app.get('/api/inventory', async (_req, res) => {
  try {
    const { getInventory } = await import('../lib/db/src/queries/inventory');
    const inventory = await getInventory();
    res.json(inventory);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ---- Dashboard / Analytics Routes ----
app.get('/api/dashboard/stats', async (_req, res) => {
  try {
    const { getDashboardStats } = await import('../lib/db/src/queries/dashboard');
    const stats = await getDashboardStats();
    res.json(stats);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/analytics', async (req, res) => {
  try {
    const { getAnalytics } = await import('../lib/db/src/queries/analytics');
    const analytics = await getAnalytics(req.query);
    res.json(analytics);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ---- Documents Routes ----
app.get('/api/documents', async (req, res) => {
  try {
    const { getDocuments } = await import('../lib/db/src/queries/documents');
    const docs = await getDocuments(req.query);
    res.json(docs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/documents/agent-status', async (_req, res) => {
  try {
    const { getAgentDocumentStatus } = await import('../lib/db/src/queries/documents');
    const status = await getAgentDocumentStatus();
    res.json(status);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ---- Sales Logs Routes ----
app.get('/api/sales-logs', async (req, res) => {
  try {
    const { getSalesLogs } = await import('../lib/db/src/queries/sales-logs');
    const logs = await getSalesLogs(req.query);
    res.json(logs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ---- Notifications Routes ----
app.get('/api/notifications', async (req, res) => {
  try {
    const { getNotifications } = await import('../lib/db/src/queries/notifications');
    const notifications = await getNotifications(req.query);
    res.json(notifications);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ---- 404 Handler ----
app.use((_req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// ---- Error Handler ----
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(`[ERROR] ${err.message}`);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
});

// =====================================================
//  Vercel Serverless Export
// =====================================================
export default function handler(req: VercelRequest, res: VercelResponse) {
  return app(req as any, res as any);
}
