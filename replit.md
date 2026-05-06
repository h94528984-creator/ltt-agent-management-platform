# LTT Sales Platform — Workspace

## Overview

Full-stack enterprise web platform for **Libya Telecom & Technology (LTT) Retail Sales Department – Western Region**.

pnpm workspace monorepo using TypeScript, React+Vite frontend, Express 5 API server, PostgreSQL + Drizzle ORM.

## Artifacts

| Artifact | Kind | Path | Port |
|---|---|---|---|
| `ltt-platform` | web (React+Vite) | `/` | 20147 |
| `api-server` | api (Express 5) | `/api` | 8080 |
| `agent-request-form` | web (React+Vite) | `/form/` | 5173 |

## Stack

- **Monorepo**: pnpm workspaces
- **Node.js**: 24, **TypeScript**: 5.9
- **Frontend**: React 19, Vite, Tailwind CSS v4, shadcn/ui, wouter router, TanStack Query
- **Backend**: Express 5, Drizzle ORM, PostgreSQL
- **API contract**: OpenAPI spec → Orval codegen (React Query hooks + Zod schemas)
- **Auth**: Custom HMAC token (SESSION_SECRET), stored in localStorage as `ltt_token`
- **Font**: Cairo (Arabic) loaded via HTML link tag (NOT CSS @import — breaks Tailwind v4)

## Platform Modules

### Management Platform (`/`)
1. **Login** — Email + password (default: `LTT@2024`)
2. **Dashboard** — KPI cards, risk distribution pie chart, agent ranking bar chart, recent inspections
3. **Inspections** — Field inspection reports from `/api/agent-requests`, status workflow (pending→approved/rejected)
4. **Agents** — Agent cards with score/classification badges, detail modal with scoring breakdown
5. **Analytics** — Multi-chart analytics: city breakdown, risk pie, radar chart, sales comparison
6. **Tickets** — Ticket list with priority/status badges
7. **Inventory** — Stock levels with low-stock alerts
8. **Users** — Team member cards with role badges

### Field Inspection Form (`/form/`)
- Arabic RTL inspection form with 190 agents loaded from CSV
- GPS geolocation, photo uploads, scoring sections
- LTT logo + tagline in header

## Roles (9 total)

`head_of_unit`, `indirect_sales`, `agent_affairs`, `inspection_team`, `technical_support`, `airport_team`, `centers_support`, `admin`, `viewer`

## Key Packages

| Package | Purpose |
|---|---|
| `@workspace/db` | Drizzle ORM schema + DB client |
| `@workspace/api-spec` | OpenAPI spec + Orval config |
| `@workspace/api-zod` | Zod schemas generated from OpenAPI |
| `@workspace/api-client-react` | React Query hooks generated from OpenAPI |
| `@workspace/ltt-platform` | React+Vite management dashboard |
| `@workspace/api-server` | Express 5 API server |
| `@workspace/agent-request-form` | React+Vite field inspection form |

## Key Commands

```bash
pnpm run typecheck:libs           # Build composite libs
pnpm run typecheck                # Full TS check
pnpm --filter @workspace/api-spec run codegen   # Regenerate hooks from OpenAPI
pnpm --filter @workspace/db run push            # Push DB schema to PostgreSQL
```

## Important Notes

- **CSS @import**: In Tailwind v4, Google Fonts must be in `index.html` `<link>` tag — NOT `@import url()` in CSS (breaks PostCSS)
- **tw-animate-css**: Do NOT `@import "tw-animate-css"` in Tailwind v4 CSS — incompatible, causes 500 errors
- **Vite base path**: Must use `base: basePath` (not `isDev ? "/" : basePath`) — Replit proxy does NOT rewrite paths
- **Auth tokens**: Stored in `localStorage` as `ltt_token`; user object stored as `ltt_user`
- **Default password**: `LTT@2024` for all seeded users
- **DB column**: Users table uses `fullName` (not `name`)
- **Agent requests list route**: `GET /api/agent-requests` (plural), status update: `PATCH /api/agent-request/:id/status`
- **Tickets**: Uses `createdById` (not `reportedById`) as FK column

## DB Schema Tables

`users`, `agents`, `inspections`, `sales_logs`, `tickets`, `inventory`, `agent_scores`, `notifications`, `agent_requests`

## Seeded Data

- **19 users** (real LTT team members) with default password `LTT@2024`
- **12 agents** across Tripoli region
- **10 inventory items** (SIM cards, recharge cards, devices, FTTH equipment)
- **7 tickets** covering technical, compliance, billing, and stock issues
- **Agent scores** with Gold/Silver/Watchlist/High_Risk classifications
