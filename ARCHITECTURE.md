# Architecture Specification — Enterprise Starter Template

## 1. Project Identity

- **Project name:** `enterprise-starter`
- **Type:** Full-stack web application (SPA + API server, single process)
- **Target use case:** Enterprise internal tools, admin panels, CRUD dashboards
- **Language:** TypeScript (strict mode everywhere)

---

## 2. Technology Stack

### Runtime & Framework

| Layer              | Package                        | Version constraint |
| ------------------ | ------------------------------ | ------------------ |
| Meta-framework     | `vike`                         | ^0.4.x             |
| Vike React adapter | `vike-react`                   | ^0.6.x             |
| UI library         | `react`, `react-dom`           | ^19.x              |
| HTTP server        | `fastify`                      | ^5.x               |
| API layer          | `@trpc/server`, `@trpc/client` | ^11.x              |
| tRPC React Query   | `@trpc/tanstack-react-query`   | ^11.x              |
| Server state       | `@tanstack/react-query`        | ^5.x               |
| Validation         | `zod`                          | ^3.x               |
| Database driver    | `better-sqlite3`               | ^12.x              |
| Database types     | `@types/better-sqlite3`        | ^7.x               |

### Data Grid

| Package             | Version constraint | License    |
| ------------------- | ------------------ | ---------- |
| `ag-grid-community` | ^33.x              | MIT (free) |
| `ag-grid-react`     | ^33.x              | MIT (free) |

> IMPORTANT: Use only `ag-grid-community` and `ag-grid-react`. Do NOT install `ag-grid-enterprise`. Do NOT import anything from enterprise modules.

### Build & Dev Tooling

| Tool              | Package                        |
| ----------------- | ------------------------------ |
| Build tool        | `vite` ^7.x                    |
| React Vite plugin | `@vitejs/plugin-react` ^5.x    |
| Type checker      | `typescript` ^5.x              |
| Formatter         | `prettier` ^3.x                |
| Test runner       | `vitest` ^3.x                  |
| Test utilities    | `@testing-library/react` ^16.x |
| TS executor       | `tsx` ^4.x                     |
| Env loader        | `dotenv` ^17.x                 |

### Middleware & Utilities

| Package            | Purpose                                                  |
| ------------------ | -------------------------------------------------------- |
| `@vikejs/fastify`  | Vike + Fastify server integration                        |
| `fastify-raw-body` | Preserves request bodies for adapter/middleware handling |

---

## 3. Directory Structure

```
enterprise-starter/
├── +server.ts                      # Vike server entry (Fastify + tRPC wiring)
├── components/                     # Shared UI components (not feature-specific)
│   ├── Icons.tsx                   # SVG icon exports
│   ├── Link.tsx                    # Client-side navigation link wrapper
│   └── ui/
│       └── ConfirmModal.tsx        # Generic delete-confirmation modal
│
├── database/
│   └── sqlite/
│       ├── db.ts                   # SQLite singleton (better-sqlite3)
│       └── migrations/
│           └── 001_initial.sql     # Initial schema (users table)
│
├── features/
│   └── users/                      # Users feature module
│       ├── schema.ts               # Zod schemas — single source of truth
│       ├── db/
│       │   └── users-queries.ts    # SQLite queries + row mapping
│       ├── server/
│       │   ├── users-service.ts    # Business logic (DI-injected)
│       │   └── users-router.ts     # tRPC router procedures
│       └── ui/
│           ├── UsersFeature.tsx    # Page-level component
│           └── UsersGrid.tsx       # AG Grid wrapper component
│
├── pages/                          # Vike file-system routes
│   ├── +Layout.tsx                 # Root layout (nav + React Query provider)
│   ├── +config.ts                  # Vike global config (SSR disabled)
│   ├── +Head.tsx                   # Global <head> (title, meta, AG Grid CSS)
│   ├── index/
│   │   └── +Page.tsx               # Home / dashboard redirect
│   └── users/
│       └── +Page.tsx               # Users list page
│
├── server/
│   ├── di.ts                       # Dependency injection container factory
│   ├── api.ts                      # Non-tRPC routes (health check)
│   ├── trpc-handler.ts             # tRPC Fastify handler with DI context
│   └── helpers/
│       ├── http-error-handler.ts   # Fastify error hook
│       └── trpc-logging.ts         # tRPC request logger middleware
│
├── shared/
│   ├── app-styles.css              # Global CSS reset + design tokens
│   └── helpers/
│       └── date-helpers.ts         # Date formatting utilities
│
├── trpc/
│   ├── server.ts                   # Root appRouter (merges all feature routers)
│   ├── client.ts                   # tRPC client + React Query integration
│   ├── trpc.ts                     # tRPC init (publicProcedure, error formatter)
│   └── context.ts                  # tRPC context type definition
│
├── .env-EXAMPLE                    # Template for required env vars
├── .gitignore
├── .prettierrc.json
├── global.d.ts                     # Ambient type declarations
├── package.json
├── tsconfig.json
├── vite.config.ts
└── vitest.setup.ts
```

---

## 4. Architectural Patterns

### 4.1 Feature Module Pattern

Every feature lives in `features/<name>/` and follows this structure exactly:

```
features/<name>/
├── schema.ts              # Zod schemas and inferred TS types (source of truth)
├── db/
│   └── <name>-queries.ts  # SQL queries; row-to-type mapping functions
├── server/
│   ├── <name>-service.ts  # Business logic; receives DI object
│   └── <name>-router.ts   # tRPC procedures (calls service)
└── ui/
    └── <Name>Feature.tsx  # React component(s) for this feature
```

Rules:

- `schema.ts` defines all types — do NOT duplicate types elsewhere
- `db/` only does SQL and mapping — no business logic
- `server/` only does business logic and tRPC routing — no SQL
- `ui/` only does rendering — calls tRPC via React Query

### 4.2 Dependency Injection

`server/di.ts` creates a plain object container:

```typescript
export type Di = ReturnType<typeof createDi>;

export function createDi(deps: { db: Database }) {
  return {
    users: createUsersService(deps),
    // add more services here as features grow
  };
}
```

The tRPC context carries `{ db, di }` and procedures destructure what they need.

### 4.3 tRPC Setup

**Root router** (`trpc/server.ts`):

```typescript
export const appRouter = createTRPCRouter({
  users: usersRouter,
});
export type AppRouter = typeof appRouter;
```

**Client** (`trpc/client.ts`):

- Creates a tRPC client pointing at `/api/trpc`
- Wraps with `@tanstack/react-query`
- Exports `trpc` proxy and `queryClient`

**Error formatter** (`trpc/trpc.ts`):

- Injects `zodError` into error responses for validation failures

**Handler** (`server/trpc-handler.ts`):

- Adapts tRPC to Fastify
- Creates `di` fresh per request (stateless)
- Attaches `{ db, di }` to context

### 4.4 Database Singleton

`database/sqlite/db.ts` returns a module-level singleton:

```typescript
import Database from "better-sqlite3";
let _db: Database.Database | undefined;

export function getDb(): Database.Database {
  if (!_db) {
    _db = new Database(process.env.SQLITE_FILE ?? "./data.db");
    _db.pragma("journal_mode = WAL");
    _db.pragma("foreign_keys = ON");
    runMigrations(_db);
  }
  return _db;
}
```

Migrations run synchronously at startup using a `migrations/` SQL file loader.

### 4.5 Request → Response Flow

```
Browser
  └─ tRPC React Query hook (trpc.<router>.<procedure>.useQuery/useMutation)
       └─ HTTP POST /api/trpc
      └─ Vike server entry (`+server.ts`)
        └─ Fastify route (`/api/trpc*`)
          └─ Fastify tRPC handler
            └─ Context creation (db + di)
              └─ tRPC procedure
                └─ Service method
                  └─ DB query function
                    └─ SQLite → mapped row → Zod validated → response
```

### 4.6 Server Wiring (Important)

Use Vike's server entry at project root (`+server.ts`) as the single wiring point in dev and production:

- Start dev with `vike dev` (not a standalone `tsx server/entry.ts` flow)
- Register Fastify routes (`registerTrpcHandler`, `registerApiRoutes`) before Vike route handling
- Keep tRPC endpoint mounted at `/api/trpc` and `/api/trpc/*`

If this wiring is skipped, `/api/trpc` may be handled by Vike's page pipeline and return HTML error output (`<p>An error occurred...</p>`), which breaks tRPC JSON parsing in the browser.

### 4.7 Vike Config (Client-Side Rendering Only)

`pages/+config.ts`:

```typescript
import vikeReact from "vike-react/config";
export default {
  extends: [vikeReact],
  ssr: false, // All pages run as SPA
};
```

This keeps the setup simple. SSR can be enabled per-page later.

### 4.8 Root Layout

`pages/+Layout.tsx` provides:

- `<QueryClientProvider>` wrapping all pages
- Top navigation bar with links to each feature
- Page `<main>` wrapper

### 4.9 TypeScript Error Typing

Use these patterns consistently to avoid runtime/type mismatches:

- Treat framework error handler inputs as `unknown` and narrow before property access.
- In Fastify `setErrorHandler`, derive `statusCode` via runtime checks (`typeof error === 'object'`, `'statusCode' in error`) and derive message via `error instanceof Error`.
- With `createTRPCOptionsProxy`, use React Query hooks with generated options:
  - `useQuery(trpc.users.list.queryOptions(...))`
  - `useMutation({ ...trpc.users.create.mutationOptions(), ...handlers })`
- Do not call `trpc.<procedure>.useMutation(...)` when using options proxy mode.
- Do not duplicate query/mutation error data in extra local state unless there is a real UX need. Prefer built-ins such as `isError`, `error`, and `reset()` from TanStack Query.
- Keep error UI logic readable: derive display text in a named variable (or small helper) before JSX instead of embedding long ternaries inline.
- Target both goals at once: type-safe error handling and code that is easy for humans to scan.
- **Every mutation must handle errors visibly.** Silent failures are not acceptable. Always display a user-facing error message when a mutation fails — whether inline in a form, inside a confirmation modal, or as a page-level notice.

---

## 5. TypeScript Configuration

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "bundler",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "strict": true,
    "verbatimModuleSyntax": true,
    "paths": {
      "$src/*": ["./*"]
    }
  }
}
```

Path alias `$src/` maps to project root — use it for cross-feature imports.

---

## 6. Prettier Configuration

```json
{
  "arrowParens": "avoid",
  "printWidth": 120,
  "trailingComma": "none",
  "singleQuote": true
}
```

---

## 7. Environment Variables

`.env-EXAMPLE`:

```
# SQLite database file path (relative to project root)
SQLITE_FILE=./data/enterprise-starter.db

# Server port
PORT=3000
```

No secrets are required for local development. SQLite is file-based.

---

## 8. Vite Configuration

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import vike from "vike/plugin";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [vike(), react()],
  resolve: {
    alias: { $src: "/" },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    pool: "forks",
    poolOptions: { forks: { singleFork: true } },
  },
});
```

---

## 9. NPM Scripts

```json
{
  "scripts": {
    "dev": "vike dev",
    "build": "vike build",
    "preview": "vike build && vike preview",
    "typecheck": "tsc --noEmit",
    "format": "prettier --write .",
    "test": "vitest run",
    "test:watch": "vitest",
    "db:migrate": "tsx database/sqlite/run-migrations.ts"
  }
}
```

---

## 10. Code Conventions

| Convention             | Rule                                                                      |
| ---------------------- | ------------------------------------------------------------------------- |
| File naming            | Folders + `.ts` files: `kebab-case`. React components: `PascalCase.tsx`   |
| Imports                | Use `type` keyword for type-only imports                                  |
| No barrel files        | Do NOT create `index.ts` re-export files                                  |
| No `any`               | Use `unknown` + Zod narrowing instead                                     |
| No non-null assertions | Validate at boundaries instead                                            |
| Schema first           | Always define Zod schema before writing queries or components             |
| Single source of truth | One `schema.ts` per feature — no duplicate type definitions               |
| Comments               | Only where logic is non-obvious. No JSDoc on every function               |
| Error handling         | Validate at system boundaries (HTTP in, tRPC in). Trust internal code     |
| Error typing           | Narrow `unknown` before reading properties; use `instanceof Error` checks |
