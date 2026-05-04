# LTT Sales Platform — Workspace

## Overview

Full-stack enterprise web platform for **Libya Telecom & Technology (LTT) Retail Sales Department – Western Region**.

pnpm workspace monorepo using TypeScript, React+Vite frontend, Express 5 API server, PostgreSQL + Drizzle ORM.

## Artifacts

| Artifact | Kind | Path | Port |
|---|---|---|---|
| `ltt-platform` | web (React+Vite) | `/` | 20147 |
| `api-server` | api (Express 5) | `/api` | 8080 |

## Stack

- **Monorepo**: pnpm workspaces
- **Node.js**: 24, **TypeScript**: 5.9
- **Frontend**: React 19, Vite, Tailwind CSS v4, shadcn/ui, wouter router, TanStack Query
- **Backend**: Express 5, Drizzle ORM, PostgreSQL
- **API contract**: OpenAPI spec → Orval codegen (React Query hooks + Zod schemas)
- **Auth**: Custom HMAC token (SESSION_SECRET), stored in localStorage

## Platform Modules

1. **Dashboard** — KPI summary cards, agent ranking, risk distribution, recent activity
2. **Agent Management** — CRUD with search/filter by status/type, bulk import
3. **Inspection Reports** — Field visit logs, violations tracking, compliance scoring
4. **Sales Logs** — Observed vs reported sales comparison, compliance flag (OK/Suspicious/Violation)
5. **Ticket System** — Issue tracking with categories, priority, status workflow
6. **Inventory Management** — Stock levels, low-stock alerts, in/out movements
7. **Agent Scoring** — 4-component scoring engine (compliance 30%, sales accuracy 25%, sales performance 25%, activity 20%)
8. **User Management** — 9 roles, CRUD, bulk import with default password LTT@2024

## Roles (9 total)

`head_of_unit`, `indirect_sales`, `agent_affairs`, `inspection_team`, `technical_support`, `airport_team`, `centers_support`, `admin`, `viewer`

## Agent Classification

- **Gold** ≥ 85 — High performer, priority inventory, incentive eligible
- **Silver** 70–84 — Good performance, continuous monitoring
- **Watchlist** 50–69 — Needs retraining and extra inspections
- **High Risk** < 50 — Formal warning or temporary suspension

## Key Packages

| Package | Purpose |
|---|---|
| `@workspace/db` | Drizzle ORM schema + DB client (composite lib) |
| `@workspace/api-spec` | OpenAPI spec + Orval config |
| `@workspace/api-zod` | Zod schemas generated from OpenAPI |
| `@workspace/api-client-react` | React Query hooks generated from OpenAPI |
| `@workspace/ltt-platform` | React+Vite frontend |
| `@workspace/api-server` | Express 5 API server |

## Key Commands

```bash
pnpm run typecheck:libs           # Build composite libs (db, etc.)
pnpm run typecheck                # Full TS check across all packages
pnpm --filter @workspace/api-spec run codegen   # Regenerate hooks from OpenAPI
pnpm --filter @workspace/db run push            # Push DB schema to PostgreSQL
```

## Important Notes

- **Lib build order**: `typecheck:libs` must run before `typecheck` to emit declarations from `lib/db`, `lib/api-zod`, `lib/api-client-react`
- **Auth tokens**: Stored in `localStorage` as `ltt_token`; custom-fetch reads via `setAuthTokenGetter`
- **Default password**: `LTT@2024` for all seeded users
- **Tickets**: Uses `createdById` (not `reportedById`) as FK column
- **OpenAPI title**: Must remain `"Api"` — controls generated filenames

## DB Schema Tables

`users`, `agents`, `inspections`, `sales_logs`, `tickets`, `inventory`, `agent_scores`, `notifications`

## Seeded Data

- **19 users** (real LTT team members) with default password `LTT@2024`
- **12 agents** across Tripoli region (dealers, centers, sub-agents, mobile sellers)
- **10 inventory items** (SIM cards, recharge cards, devices, FTTH equipment)
- **7 tickets** covering technical, compliance, billing, and stock issues
- **Agent scores** with realistic Gold/Silver/Watchlist/High_Risk classifications
