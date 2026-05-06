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

`users`, `agents`, `inspections`, `sales_logs`, `tickets`, `inventory`, `agent_scores`, `notifications`, `agent_requests`, `agent_documents`, `document_history`

## Platform Modules (updated)

### Management Platform (`/`)
1. **Login** — Email + password (default: `LTT@2024`)
2. **Dashboard** — KPI cards + document alert banner (expired/expiring counts), risk pie, ranking bar
3. **Inspections** — Field inspection reports, status workflow, CSV export
4. **Agents** — Agent cards with score/class/doc-status badges (red=expired, amber=expiring, green=valid), CRUD, CSV export
5. **Documents** — Full license/doc management: CRUD, expiry tracking, file upload, history log, CSV export
6. **Analytics**, **Tickets**, **Inventory**, **Users**

### Field Inspection Form (`/form/`)
- Mode selector: تفتيش على وكيل قائم / إنشاء وكيل جديد
- New agent flow: class A–E, channel type, GPS, readiness, doc uploads (DocUploadRow component — no hook violations)
- 190 agents from CSV, photo uploads, scoring sections

## Seeded Data

- **19 users** (real LTT team members) with default password `LTT@2024`
- **190 real dealers** across the Western Region
- **10 inventory items**, **7 tickets**, agent scores

## Recent Changes

- **Entities page** (`/entities`, sidebar "كيانات الشركة"): manage company-owned entities (service_center / fixed_pos / mobile_van) — colored type cards with create-tile shortcuts, search/filter, approve/cancel actions, "افتح في الخرائط" button using `https://www.google.com/maps/dir/?api=1&destination=lat,lng`
- **Tickets**: CreateTicketModal now has user-assignment dropdown (loads from `/users`), optional location (locationName + lat/lng + "use my GPS" button); ticket table shows assignee column + clickable maps badge
- **Tickets schema**: added `locationName` (text), `latitude` / `longitude` (double precision); POST `/tickets` route accepts these alongside the OpenAPI `CreateTicketBody`
- **Inspections**: "إنشاء عملية جديدة" button + CreateOperationModal (4 entity-type tiles) for creating agent_requests directly from management platform

- **Multi-entity agent_requests**: added `entityType` (agent/service_center/fixed_pos/mobile_van/inspection), `services` (jsonb), `staffCount`; `activityType` now nullable
- New JSON `POST /api/agent-requests` route accepts company-entity payloads (entityName/responsibleEmployee/employeePhone/address) — original multipart `POST /api/agent-request` for agent inspections kept
- `PATCH /api/agent-request/:id/status` now accepts `cancelled`; GET supports `?entityType=` filter
- ltt-platform Inspections page: entity-type filter + colored badge column + "إلغاء العملية" button in detail modal
- ltt-platform Tickets page: "إنشاء تذكرة جديدة" button + modal POSTing to `/api/tickets`
- Form (agent-request-form): FixedPosSelector + fixedPosList added (مطار معيتيقة)
- `agent_documents` + `document_history` tables added; schema pushed to DB
- `agents` table extended: `channelType`, `region`, `services` (jsonb), `supervisorId`, `marketPotential`, `operationalEval`
- Documents page: full CRUD with file upload, expiry status auto-computed, history log
- Dashboard: document alert banner (red/amber) + document KPI cards
- Agents page: fetches `/documents/agent-status`, shows per-card doc status badges
- Field form: `DocUploadRow` component fixes hook-in-map violation; `PhotoUploadSection` is a proper component
- Sidebar: "التراخيص والمستندات" nav entry at `/documents`
- `lib/ltt-platform/src/lib/documentStatus.ts`: shared label/color/utils for doc status

## Gotchas

- **React hooks in map**: Never call `useRef`/`useState` inside `.map()` — extract to a named component
- **CSS @import**: Google Fonts must be in `index.html` `<link>` — NOT `@import url()` in CSS
- **tw-animate-css**: Do NOT `@import "tw-animate-css"` in Tailwind v4 CSS
- **Vite base path**: `base: basePath` (not `isDev ? "/" : basePath`)
- **Auth tokens**: `ltt_token` / `ltt_user` in localStorage; default password `LTT@2024`
- **Agent requests list route**: `GET /api/agent-requests`, status update: `PATCH /api/agent-request/:id/status`
- **Tickets**: Uses `createdById` FK column
