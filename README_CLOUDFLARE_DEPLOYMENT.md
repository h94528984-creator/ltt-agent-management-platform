# LTT Agent Management Platform - Cloudflare Deployment Guide

## Overview
This project is configured for deployment on **Cloudflare Pages + Pages Functions** (free tier).
- **Frontend**: React 19 + Vite → Cloudflare Pages (static hosting)
- **Backend**: Cloudflare Pages Functions (Workers runtime, edge-based)
- **Database**: Neon PostgreSQL (unchanged, serverless via `@neondatabase/serverless`)

## Architecture

```
Request → Cloudflare Edge
  ├── /api/* → Pages Function (functions/api/[[path]].ts)
  │             └── Router → handler → Drizzle ORM → Neon PostgreSQL
  └── /*      → Static assets from pages_build_output_dir
```

## Project Structure (Cloudflare-specific)

```
functions/                          ← Cloudflare Pages Functions
  _redirects                        ← SPA fallback rules
  _routes.json                      ← Route inclusion/exclusion
  api/
    [[path]].ts                     ← Catch-all API entry point
    _handlers/                      ← Handler modules (not exposed as routes)
      health.ts                     ← GET /api/health
      auth.ts                       ← POST /api/auth/login
      agents.ts                     ← CRUD /api/agents
      agent-requests.ts             ← CRUD /api/agent-requests
      tickets.ts                    ← CRUD /api/tickets
      users.ts                      ← GET /api/users
      inventory.ts                  ← GET /api/inventory
      dashboard.ts                  ← GET /api/dashboard/stats
      analytics.ts                  ← GET /api/analytics
      documents.ts                  ← CRUD /api/documents
      sales-logs.ts                 ← GET /api/sales-logs
      notifications.ts              ← GET /api/notifications
lib/db/src/
  workers-db.ts                     ← DB adapter (createDb from env)
  queries/*.ts                      ← Updated to accept db parameter
wrangler.toml                       ← Cloudflare configuration
```

## Prerequisites

1. **Cloudflare Account** (free tier)
2. **Node.js** >= 20
3. **pnpm** >= 9
4. **Wrangler CLI** (optional, for local dev):
   ```bash
   npm install -g wrangler
   ```

## Environment Variables

Set these in **Cloudflare Dashboard → Pages → ltt-platform → Settings → Environment Variables**:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `NODE_ENV` | `production` for live, `development` for preview |

**IMPORTANT**: The exact `DATABASE_URL` must be stored ONLY in Cloudflare env vars, never in source code.

## Deployment Steps

### 1. Initial Setup (Cloudflare Dashboard)

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/) → **Workers & Pages**
2. Click **Create application** → **Pages** → **Connect to Git**
3. Select your repository
4. Configure build:
   - **Project name**: `ltt-platform`
   - **Production branch**: `main`
   - **Build command**: `pnpm run build:cloudflare`
   - **Build output**: `artifacts/ltt-platform/dist`
   - **Root directory**: (leave blank)
5. Click **Save and Deploy**

### 2. Deploy Commands (Wrangler CLI)

```bash
# Login to Cloudflare
npx wrangler login

# Initial deployment
npx wrangler pages deploy artifacts/ltt-platform/dist --project-name=ltt-platform

# Subsequent deployments (auto via Git, or manual):
npx wrangler pages deploy artifacts/ltt-platform/dist --project-name=ltt-platform --branch=main
```

### 3. Set Environment Variables

In Cloudflare Dashboard → Pages → `ltt-platform` → **Settings** → **Environment Variables**:

```bash
DATABASE_URL = "postgresql://neondb_owner:npg_ZoNVL1qhK4Ml@ep-dawn-breeze-apqjp4ad.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require"
NODE_ENV = "production"
```

Add to both **Production** and **Preview** environments.

## Verify Deployment

After deployment, verify your API is working:

```bash
# Health check
curl https://<your-project>.pages.dev/api/health

# Expected response:
# {"status":"ok","service":"LTT Agent Management Platform","cloudflare":true,...}

# List agents
curl https://<your-project>.pages.dev/api/agents

# Login
curl -X POST https://<your-project>.pages.dev/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"..."}'
```

## Local Development

```bash
# Install dependencies
pnpm install

# Run frontend dev server
pnpm run dev

# Run with Wrangler (simulates Pages Functions)
npx wrangler pages dev artifacts/ltt-platform/dist -- bindings="[{ name: 'DATABASE_URL', type: 'secret_text' }]"
```

## Important Changes from Vercel/Netlify

1. **No Express** - all API routing done via native `Request`/`Response` Web APIs
2. **No `process.env`** - Workers use `env` parameter from handler context; DB connection receives `env.DATABASE_URL`
3. **No `tsc --build`** - build step only compiles frontend via Vite; Pages Functions are bundled by Cloudflare
4. **Query functions** - all 11 query modules accept `db: DB` as first parameter (injected from handler)
5. **No `process.uptime()`** - not available in Workers edge runtime
6. **`Buffer`** - `Buffer.from()` in auth query uses a polyfill via `nodejs_compat` flag in `wrangler.toml`

## Database Connection

Connection is established per-request via `createDb(env)` in `lib/db/src/workers-db.ts`:

```typescript
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

export function createDb(env: { DATABASE_URL: string }) {
  const sql = neon(env.DATABASE_URL);
  return drizzle(sql, { logger: false });
}
```

This uses the Neon HTTP API (fetch-based, edge-compatible), not TCP.

## Free Tier Limits

| Resource | Cloudflare Free Tier |
|----------|---------------------|
| Pages Requests | 500,000 / month |
| Functions Requests | 500,000 / month |
| Build Minutes | 1,000 / month |
| Workers CPU Time | 10ms / request |
| Workers Memory | 128 MB |
| Bandwidth | 1 GB / month |

## Troubleshooting

### Build fails with "Cannot find module"
If Pages Functions can't resolve `lib/db/src/...` imports:
- Ensure the import paths in `functions/api/[[path]].ts` are relative and correct
- Cloudflare Pages Functions bundle imports relative to the function file

### Database connection fails
- Verify `DATABASE_URL` is set in Cloudflare Dashboard Environment Variables
- Ensure `sslmode=require` is in the connection string
- Check that the Neon database IP is not restricted

### 404 on API routes
- Verify `functions/api/[[path]].ts` exists (double brackets required for catch-all)
- Check `_routes.json` includes `/api/*`

## Security Checklist

- [ ] `DATABASE_URL` set only in Cloudflare env vars, never in code
- [ ] CORS headers configured (currently `*` for development)
- [ ] Input validation in all handlers
- [ ] Passwords excluded from user responses
- [ ] `NODE_ENV=production` for live environment
