# StayFlow — Architecture

> Product context: [PRD.md](PRD%20%28Product%20Requirements%20Document%29.md). Data model: [Schema.md](Schema.md). Business rules: [Rules.md](Rules.md).

## High Level Architecture

```mermaid
graph TD
  User["User (Member / Staff / Management)"]
  Browser["Browser — React 19 SPA/SSR"]
  Node["Node service — scripts/start.mjs"]
  SSR["TanStack Start SSR handler<br/>(dist/server)"]
  Static["Static assets<br/>(dist/client)"]
  API["Express API app<br/>(server/src/app.js)"]
  Prisma["Prisma ORM 6"]
  DB[("PostgreSQL")]
  Mail["Password-reset mailer<br/>(stub — no provider wired)"]

  User --> Browser --> Node
  Node -->|"/api/*"| API
  Node -->|"GET static file"| Static
  Node -->|"everything else"| SSR
  API --> Prisma --> DB
  API -.-> Mail
```

**Components**

| Component | Role |
| --- | --- |
| Browser (React) | Renders portals, holds non-sensitive user profile in `zustand`+`persist`; JWT never touches JS |
| Node service | `createServer` router: `/api` → Express, static file hit → serve `dist/client`, else → SSR `handler.fetch` |
| Express API | REST endpoints, auth, RBAC, rate limiting, security headers |
| Prisma | Typed DB access + migrations |
| PostgreSQL | System of record (Railway-managed in prod) |
| Mailer | Reset-link delivery — **stubbed**; logs link in dev, no-op warn in prod |

## Complete System Architecture

```mermaid
graph LR
  subgraph Client["Frontend (src/)"]
    Routes["TanStack file routes<br/>login · member · staff · management"]
    Stores["zustand stores<br/>auth · ui · mock"]
    ApiClient["api client<br/>fetch, credentials:include"]
    UI["UI kit — Radix + Tailwind + Recharts"]
  end

  subgraph Server["Backend (server/src/)"]
    App["app.js — helmet, cors, json, morgan"]
    RouterIdx["routes/index.js"]
    AuthR["auth.routes"]
    DataR["11 data routers"]
    MW["middleware<br/>auth · rateLimit · error"]
    Ctrls["controllers"]
    Models["Prisma models"]
    Utils["utils<br/>crudRouter · crudController · authLog · mailer · ApiError"]
  end

  DB[("PostgreSQL")]

  Routes --> ApiClient -->|HTTP /api| App --> RouterIdx
  RouterIdx --> AuthR --> MW
  RouterIdx --> DataR --> MW --> Ctrls --> Models --> DB
  Ctrls --> Utils
  Routes --> Stores
  Routes --> UI
```

- **Integrations / external APIs:** none live. Email provider is a documented stub. No payment, SMS, maps, analytics SaaS, or third-party auth.
- **Service communication:** single process; frontend↔backend over same-origin HTTP `/api`; backend↔DB over Prisma (Postgres wire protocol).

## End-to-End System Flow

### Login / Authentication

```mermaid
sequenceDiagram
  participant U as User
  participant FE as React (login-form)
  participant API as Express /api/auth
  participant DB as Postgres

  U->>FE: Open /login/{member|staff|management}
  U->>FE: Submit email + password
  FE->>API: POST /auth/login (credentials:include)
  API->>DB: findByEmail
  alt locked
    API-->>FE: 429 Account temporarily locked
  else bad password
    API->>DB: increment failedLoginCount (lock at 5)
    API-->>FE: 401 Invalid credentials
  else disabled
    API-->>FE: 403 Account disabled
  else success
    API->>DB: reset counters, log LOGIN_SUCCESS
    API-->>FE: 200 {user} + Set-Cookie stayflow_token (httpOnly)
    FE->>FE: store user; verify role matches portal
    FE-->>U: Redirect to portal dashboard
  end
```

### Booking

```mermaid
sequenceDiagram
  participant M as Member
  participant API as /api/bookings
  M->>API: POST / (residentId forced to own from JWT)
  API-->>M: 201 Booking (status PENDING)
  Note over API: STAFF/MANAGEMENT PUT /:id to CONFIRM/CANCEL
  M->>API: DELETE /:id (own record only)
```

### Guest Pass Lifecycle

```mermaid
stateDiagram-v2
  [*] --> PENDING: Member registers guest (passNumber issued, QR)
  PENDING --> APPROVED: Staff approves
  APPROVED --> CHECKED_IN: Staff POST /:id/check-in
  CHECKED_IN --> CHECKED_OUT: Staff POST /:id/check-out
  CHECKED_OUT --> [*]
```

### Payment Flow

> Not implemented. No payment gateway, checkout, or billing code exists.

### Notification Flow

```mermaid
graph LR
  Staff["STAFF/MANAGEMENT"] -->|POST /notifications| N[(notifications)]
  User -->|GET /notifications| N
  User -->|POST /:id/read| N
```

### Background Jobs / Queues / Scheduled Tasks

> None present. No queue, worker, cron, or scheduler. All work is synchronous request/response. The one async side-effect is fire-and-forget audit logging (`logAuthEvent`).

### Error Handling Flow

```mermaid
graph LR
  Ctrl["controller (asyncHandler)"] -->|throw ApiError| EMW["error.middleware"]
  Ctrl -->|unknown throw| EMW
  Unknown["no route match"] --> NF["notFoundMiddleware → 404"]
  EMW -->|"JSON {error}"| Client
```

## Folder Structure

<details>
<summary><strong>Expand tree</strong></summary>

```
StayFlow/
├── scripts/start.mjs          # Prod entry: merges API + SSR + static into one Node server
├── vite.config.ts             # Vite 8 + TanStack Start + Tailwind + React plugins
├── package.json               # Frontend deps + scripts (dev/build/start/test/lint)
├── components.json            # shadcn/ui config
├── .env / .env.example        # Frontend + merged-server env (see Security.md)
├── public/                    # Static public assets
├── dist/                      # Build output (client + server) — generated
├── src/
│   ├── router.tsx             # TanStack Router setup
│   ├── routeTree.gen.ts       # Generated route tree (tsr)
│   ├── styles.css             # Tailwind entry + design tokens
│   ├── routes/                # File-based routes
│   │   ├── __root.tsx         # Root layout/shell
│   │   ├── index.tsx          # Landing
│   │   ├── login/{member,staff,management}.tsx
│   │   ├── forgot-password.tsx / reset-password.tsx
│   │   ├── member/  (index, facilities, dining, guests, events, notices, profile)
│   │   ├── staff/   (index, bookings, dining, facilities, guests, events)
│   │   └── management/ (index, users, facilities, restaurants, events, notices, analytics, reports)
│   ├── components/
│   │   ├── stayflow/          # App components (app-shell, sidebar, kpi-card, charts/, qr-code…)
│   │   └── ui/                # shadcn/Radix primitives (button, dialog, table, calendar…)
│   └── lib/
│       ├── api/client.ts      # fetch wrapper (credentials:include)
│       ├── store/             # zustand: auth-store, ui-store, mock-store
│       ├── hooks/             # use-require-auth, use-portal-preference
│       ├── mock/               # Seed-style mock datasets + types
│       └── {avatar,booking-slots,export-csv,session,utils}.ts
└── server/
    ├── server.js              # Standalone API entry (dev): prisma.$connect + app.listen
    ├── package.json           # Backend deps + prisma scripts
    ├── prisma/
    │   ├── schema.prisma       # Data model (see Schema.md)
    │   ├── migrations/0_init/  # SQL migration
    │   └── seed.js             # Seed residents/staff/facilities/users
    ├── scripts/reset-test-passwords.js
    └── src/
        ├── app.js             # Express app (helmet, cors, json, morgan, routes)
        ├── config/{env.js,db.js}
        ├── routes/            # index + auth + 11 resource routers
        ├── controllers/       # Per-resource controllers
        ├── models/            # Prisma-backed models
        ├── middleware/        # auth, rateLimit, error
        └── utils/             # crudRouter, crudController, authLog, mailer, ApiError, asyncHandler
```
</details>

## Technology Stack

| Purpose | Technology | Version | Description |
| --- | --- | --- | --- |
| UI framework | React | ^19.2 | Component UI, SSR-capable |
| Meta-framework | TanStack Start / Router | latest | File routing, SSR, server functions |
| Build tool | Vite | ^8.0 | Dev server + bundler |
| Language | TypeScript | ^6.0 | Frontend types |
| Styling | Tailwind CSS | ^4.1 | Utility-first + `@tailwindcss/vite` |
| UI primitives | Radix UI / shadcn pattern | ^1.6 | Accessible components |
| Icons | lucide-react | ^0.577 | Icon set |
| Charts | Recharts | ^3.9 | Analytics visuals |
| Client state | zustand (+persist) | ^5.0 | Auth/UI stores |
| Dates | date-fns | ^4.4 | Date math, booking slots |
| QR | qrcode | ^1.5 | Guest-pass QR codes |
| Toasts | sonner | ^2.0 | Notifications UI |
| Runtime | Node.js | — | Prod server + dev |
| Package/runtime | Bun | — | Install + server build step (`bun`, `bunx`) |
| API framework | Express | ^4.21 | REST API |
| ORM | Prisma | ^6.3 | DB access + migrations |
| Database | PostgreSQL | — | System of record |
| Auth | jsonwebtoken | ^9.0 | JWT sign/verify |
| Hashing | bcryptjs | ^2.4 | Password hashing (cost 12) |
| Rate limiting | express-rate-limit | ^8.5 | Login/register/reset limiters |
| Security headers | helmet | ^8.3 | HSTS, nosniff, frameguard |
| CORS | cors | ^2.8 | Allowlist-based |
| Logging | morgan | ^1.10 | HTTP request logs |
| Tests | Vitest + Testing Library | ^4.1 | Unit/component tests |
| Lint/format | ESLint + Prettier | ^9 / ^3.8 | `@tanstack/eslint-config` |

## System Modules

Each resource follows **route → middleware → controller → model → Prisma**. Generic CRUD is factored into `utils/crudRouter.js` + `utils/crudController.js`; resources with ownership rules add explicit routers.

| Module | Purpose | Read roles | Write roles | Notable endpoints |
| --- | --- | --- | --- | --- |
| **Auth** | Login, register, logout, password reset, session | public / self | — | `/auth/*` |
| **Residents** | Resident directory + profile | STAFF, MGMT | STAFF, MGMT | CRUD |
| **Staff** | Staff directory | STAFF, MGMT | MGMT | CRUD |
| **Facilities** | Amenities catalog | any auth | STAFF, MGMT | CRUD |
| **Bookings** | Facility reservations | STAFF list; owner get | member create; STAFF update | `/resident/:id`, ownership-gated |
| **Restaurants** | Dining venues | any auth | STAFF, MGMT | CRUD |
| **Tables** | Restaurant tables | any auth | STAFF, MGMT | `/restaurant/:id` |
| **Dining Reservations** | Table bookings | STAFF list; owner get | member create; STAFF update | `/resident/:id`, ownership-gated |
| **Guests** | Guest passes + check-in/out | STAFF list; owner get | member create/edit own | `/:id/check-in`, `/:id/check-out` |
| **Events** | Community events + RSVP | any auth | STAFF, MGMT | `/:id/rsvp`, `/:id/rsvp/cancel` |
| **Notices** | Announcements | any auth | STAFF, MGMT | CRUD |
| **Notifications** | In-app notifications | any auth | STAFF, MGMT create/delete | `/:id/read` |

*Inputs:* JSON bodies + JWT (cookie/Bearer). *Outputs:* JSON. *Connected services:* PostgreSQL via Prisma only.

## API Documentation

Base path: `/api`. Auth via `stayflow_token` httpOnly cookie **or** `Authorization: Bearer <jwt>`. All non-auth routers sit behind `requireAuth`. Errors return `{ "error": "message" }` with the status below.

### Auth — `/api/auth`

| Method | URL | Purpose | Auth | Request | Success | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| POST | `/register` | Create MEMBER account | public (rate-limited) | `{email,password,displayName,residentId?}` | 201 `{token,user}` + cookie | 400, 409 |
| POST | `/login` | Sign in | public (rate-limited) | `{email,password}` | 200 `{token,user}` + cookie | 401, 403, 429 |
| POST | `/logout` | Clear cookie | any | — | 204 | — |
| POST | `/forgot-password` | Request reset link | public (rate-limited) | `{email}` | 200 generic message | 400 |
| POST | `/reset-password` | Set new password | public (rate-limited) | `{token,password}` | 200 message | 400 |
| GET | `/me` | Current user | requireAuth | — | 200 `user` | 401, 404 |

### Resource routers (all under `requireAuth`)

Generic CRUD (`GET /`, `GET /:id`, `POST /`, `PUT /:id`, `DELETE /:id`) applies to **residents, staff, facilities, restaurants, tables, events, notices** with the role gates in System Modules above. Extra endpoints:

| Method | URL | Purpose | Role |
| --- | --- | --- | --- |
| GET | `/bookings` | List all | STAFF/MGMT |
| GET | `/bookings/resident/:residentId` | Resident's bookings | owner or STAFF/MGMT |
| POST | `/bookings` | Create (residentId forced from JWT) | any member |
| PUT | `/bookings/:id` | Update / confirm | STAFF/MGMT |
| DELETE | `/bookings/:id` | Cancel own | owner |
| GET/POST/PUT/DELETE | `/dining-reservations/*` | Same shape as bookings | same |
| GET | `/guests/resident/:residentId` | Host's guests | owner or STAFF/MGMT |
| POST | `/guests/:id/check-in` · `/check-out` | Front-desk actions | STAFF/MGMT |
| GET | `/tables/restaurant/:restaurantId` | Tables by venue | any auth |
| POST | `/events/:id/rsvp` · `/rsvp/cancel` | RSVP toggle | member (own) |
| GET | `/notifications` | List | any auth |
| POST | `/notifications/:id/read` | Mark read | any auth |
| GET | `/health` | Liveness → `{status:'ok',time}` | public |

## Deployment

**Model:** one Railway service runs `node scripts/start.mjs`, serving API + static + SSR from one port.

```mermaid
graph TD
  Dev["git push → GitHub"] --> Railway["Railway build & deploy"]
  Railway -->|build| B["vite build && (cd server && bun install && bunx prisma generate)"]
  Railway -->|start| S["node scripts/start.mjs"]
  S --> API["/api → Express"]
  S --> Web["/* → SSR + static"]
  API --> PG[("Railway PostgreSQL")]
```

- **Local dev (frontend + API together):** `bun install && bun --bun run dev` (Vite on :3000). Backend env in root `.env` powers the merged path.
- **Local dev (API standalone):** `cd server && npm install && npm run dev` (`node --watch`, :4000).
- **Build:** `bun --bun run build` → `vite build` then server install + `prisma generate`.
- **Migrate prod DB:** `cd server && npm run prisma:deploy`.
- **Docker / Compose / Kubernetes / GitHub Actions CI:** none present. Deploy is Railway-native.

## Configuration Guide

| File | Purpose |
| --- | --- |
| `vite.config.ts` | Vite plugins: devtools, tailwind, TanStack Start, React |
| `tsconfig.json` / `tsr.config.json` | TS config + TanStack Router codegen |
| `eslint.config.js` / `prettier.config.js` | Lint + format (`@tanstack/eslint-config`) |
| `components.json` | shadcn/ui generator config |
| `server/prisma/schema.prisma` | Data model, enums, datasource — see [Schema.md](Schema.md) |
| `server/src/config/env.js` | Env validation + defaults (required: `DATABASE_URL`, `JWT_SECRET`) |
| `server/src/config/db.js` | Prisma client singleton |
| `scripts/start.mjs` | Prod server: MIME map, static caching, API/SSR routing |

## Automation

| Concern | Status |
| --- | --- |
| Cron jobs / Scheduled tasks | None in repo |
| Queues / Background workers | None |
| Webhooks | None |
| Retries / timeouts | Rate limiters (login 10/15min, register 10/hr, reset 5/hr); account lock 15 min after 5 fails |
| Async side-effects | Audit logging (`logAuthEvent`) is fire-and-forget; failures logged to console, never block auth |

## Performance

- **Static caching:** hashed `assets/*` served `immutable, max-age=1y`; other static `max-age=1h` (`start.mjs`).
- **SSR:** TanStack Start server rendering for fast first paint.
- **DB indexes:** unique constraints + `auth_events` indexes on `userId/type/createdAt`.
- **Client state:** zustand avoids over-fetching; profile persisted locally.
- **Caching layer / Redis / CDN:** none beyond HTTP cache headers.

## Testing

- **Runner:** Vitest + `@testing-library/react` + `jsdom`.
- **Command:** `bun --bun run test` → `vitest run`.
- **Scope present:** unit/component harness configured.
- **Integration / E2E / coverage config:** none committed.

## Backup & Recovery

- **Database:** managed by Railway PostgreSQL — use Railway backups/snapshots + `pg_dump` for logical backups.
- **File storage:** no user-uploaded files (images are static/remote references) — nothing app-side to back up.
- **Recovery:** restore Postgres snapshot → re-run `prisma migrate deploy` → redeploy service.
- **Disaster recovery:** no documented DR/runbook; relies on Railway platform durability.

## Diagrams

### Dependency Graph

```mermaid
graph TD
  FE["Frontend"] --> React & TanStack & Vite & Tailwind & zustand & Recharts & lucide
  BE["Backend"] --> Express & Prisma & jsonwebtoken & bcryptjs & helmet & cors & rateLimit["express-rate-limit"] & morgan
  Prisma --> PostgreSQL
```

### Data Flow Diagram

```mermaid
graph LR
  U["User action"] --> C["React component"] --> A["api client"] --> E["Express route"] --> MW["guards"] --> Ctrl["controller"] --> M["model"] --> P["Prisma"] --> DB[("Postgres")]
  DB --> P --> M --> Ctrl --> E --> A --> C --> U
```

### Infrastructure Diagram

```mermaid
graph TD
  Client["Browser"] -->|HTTPS| Railway["Railway service — Node"]
  Railway --> Proc["scripts/start.mjs (API+SSR+static)"]
  Proc --> PG[("Railway PostgreSQL")]
```

### Network Flow Diagram

```mermaid
graph LR
  Browser -->|"HTTPS 443"| Node
  Node -->|"/api"| Express
  Node -->|"static / SSR"| Web
  Express -->|"5432 (Prisma)"| Postgres
```

### Package Diagram

```mermaid
graph TD
  subgraph frontend
    routes --> components --> lib
  end
  subgraph backend
    routesB["routes"] --> middleware --> controllers --> models --> config
    utils
  end
  lib -->|HTTP| routesB
```

### Component Diagram

```mermaid
graph LR
  AppShell --> Sidebar & TopBar & MobileNav
  Pages --> KpiCard & Charts & FacilityCard & ReservationRow & QRCode & GlobalSearch & NotificationBell
  Charts --> Recharts
  Pages --> UIkit["ui/ (Radix + Tailwind)"]
```

### Class Diagram (Models)

```mermaid
classDiagram
  class UserModel {
    findByEmail()
    findById()
    findAuthState()
    create()
    setLoginState()
    setResetToken()
    applyPasswordReset()
  }
  class BookingModel {
    findAll()
    findById()
    findByResident()
    create()
    update()
    remove()
  }
  class crudController {
    list()
    getOne()
    create()
    update()
    remove()
  }
  crudController <.. BookingModel
```

## Maintenance Guide

- **Update deps:** bump `package.json` / `server/package.json`, reinstall, run tests + lint.
- **Schema change:** edit `schema.prisma` → `npm run prisma:migrate` (dev) → `prisma:deploy` (prod).
- **Deploy:** push to GitHub → Railway auto-builds/starts.
- **Rollback:** redeploy previous Railway deployment; revert schema only with a compensating migration (never hand-edit applied SQL).
- **Rotate demo creds:** `TEST_PASSWORD=… node server/scripts/reset-test-passwords.js`.
- **Create STAFF/MGMT users:** manually via seed / Prisma Studio (no API endpoint by design).

## Credits

- **Author:** QUAN7UM
- **Contributors:** none documented.
- **Company:** not specified.
- **License:** see [License.md](License.md).
