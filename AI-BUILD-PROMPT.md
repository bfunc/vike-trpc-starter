# AI Build Prompt — Enterprise Starter Template

Paste this prompt to an AI coding agent (Claude Code, Cursor, Copilot Workspace, etc.) to scaffold the full project from scratch.

---

## PROMPT START

You are building a production-ready enterprise web application starter template called **enterprise-starter**.

This is a generic internal-tools / admin-panel foundation — not specific to any domain. It ships with one working feature: a **Users management table** with full CRUD functionality.

Read every section of this prompt carefully before writing any code. Follow all rules exactly.

---

### GOAL

Scaffold the complete `enterprise-starter` project with:

- All configuration files
- A SQLite database layer with migrations
- A tRPC API with a `users` router
- A React UI with an AG Grid Community data grid
- A working dev server (`npm run dev`)

Do NOT generate placeholder files. Every file must be complete and functional.

---

### TECH STACK (exact versions)

```json
{
  "dependencies": {
    "vike": "^0.4.253",
    "vike-react": "^0.6.20",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "fastify": "^5.7.0",
    "@trpc/server": "^11.0.0",
    "@trpc/client": "^11.0.0",
    "@trpc/tanstack-react-query": "^11.0.0",
    "@tanstack/react-query": "^5.90.0",
    "zod": "^3.25.0",
    "better-sqlite3": "^12.6.0",
    "ag-grid-community": "^33.0.0",
    "ag-grid-react": "^33.0.0",
    "@vikejs/fastify": "^0.2.4",
    "fastify-raw-body": "^5.0.0",
    "dotenv": "^17.0.0"
  },
  "devDependencies": {
    "vite": "^7.3.0",
    "@vitejs/plugin-react": "^5.1.0",
    "typescript": "^5.9.0",
    "tsx": "^4.21.0",
    "prettier": "^3.5.0",
    "vitest": "^3.2.0",
    "@testing-library/react": "^16.3.0",
    "@types/better-sqlite3": "^7.6.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0"
  }
}
```

**AG Grid**: Use `ag-grid-community` + `ag-grid-react` ONLY. Never import from `ag-grid-enterprise`.

---

### CRITICAL RULES (read before writing any code)

1. **Schema first**: Always create `features/<name>/schema.ts` with Zod schemas before writing queries, services, routers, or UI.
2. **Single source of truth**: All TypeScript types for a feature come from `z.infer<>` in that feature's `schema.ts`. No duplicates.
3. **No barrel files**: Never create `index.ts` re-export files.
4. **No `any`**: Use `unknown` + Zod parsing at boundaries.
5. **No non-null assertions (`!`)**: Validate and handle nullability explicitly.
6. **Strict TypeScript**: `"strict": true` in tsconfig. All types must pass `tsc --noEmit`.
7. **tRPC only for API**: All client-server data calls go through tRPC procedures. No direct fetch calls for data.
8. **SSR disabled**: Set `ssr: false` in `pages/+config.ts`. All pages are SPA.
9. **Feature module isolation**: Code in `features/users/db/` only does SQL. Code in `features/users/server/` only does business logic. Code in `features/users/ui/` only does rendering.
10. **kebab-case files, PascalCase components**: `users-queries.ts`, `UsersGrid.tsx`.
11. **Verbatim module syntax**: Use `import type { Foo }` for type-only imports.
12. **Path alias**: Configure `$src/` → project root in both `tsconfig.json` and `vite.config.ts`.
13. **Server wiring**: Implement root `+server.ts` with `@vikejs/fastify`, register `/api/trpc` before Vike page handling.
14. **Dev command**: Use `vike dev` (do not run a separate Fastify entry for dev).
15. **Type unknown errors**: In server error handlers, narrow `unknown` before reading properties (e.g. `statusCode`, `message`).
16. **tRPC options proxy usage**: With `createTRPCOptionsProxy`, use React Query with `queryOptions()` and `mutationOptions()`; do not call `trpc.<procedure>.useMutation(...)`.
17. **No redundant error state**: Reuse TanStack Query mutation/query state (`isError`, `error`, `reset`) instead of mirroring the same error in extra local state.
18. **Readable error mapping**: Keep JSX clean by deriving user-facing error messages in named variables/helpers; avoid long nested inline ternaries.
19. **No silent mutation failures**: Every mutation (create, update, delete) must surface an error message to the user on failure. Never leave a failed mutation invisible — the user must always know what went wrong.

---

### FILE STRUCTURE TO GENERATE

```
enterprise-starter/
├── +server.ts
├── components/
│   ├── Icons.tsx
│   ├── Link.tsx
│   └── ui/
│       └── ConfirmModal.tsx
├── database/
│   └── sqlite/
│       ├── db.ts
│       ├── run-migrations.ts
│       └── migrations/
│           └── 001_initial.sql
├── features/
│   └── users/
│       ├── schema.ts
│       ├── db/
│       │   └── users-queries.ts
│       ├── server/
│       │   ├── users-service.ts
│       │   └── users-router.ts
│       └── ui/
│           ├── UsersFeature.tsx
│           ├── UsersGrid.tsx
│           └── UserFormModal.tsx
├── pages/
│   ├── +Layout.tsx
│   ├── +config.ts
│   ├── +Head.tsx
│   ├── index/
│   │   └── +Page.tsx
│   └── users/
│       └── +Page.tsx
├── server/
│   ├── di.ts
│   ├── api.ts
│   ├── trpc-handler.ts
│   └── helpers/
│       ├── http-error-handler.ts
│       └── trpc-logging.ts
├── shared/
│   ├── app-styles.css
│   └── helpers/
│       └── date-helpers.ts
├── trpc/
│   ├── server.ts
│   ├── client.ts
│   ├── trpc.ts
│   └── context.ts
├── .env-EXAMPLE
├── .gitignore
├── .prettierrc.json
├── global.d.ts
├── package.json
├── tsconfig.json
├── vite.config.ts
└── vitest.setup.ts
```

---

### DATABASE LAYER

#### `database/sqlite/migrations/001_initial.sql`

```sql
CREATE TABLE IF NOT EXISTS users (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT    NOT NULL,
  email       TEXT    NOT NULL UNIQUE,
  role        TEXT    NOT NULL DEFAULT 'viewer',
  department  TEXT,
  is_active   INTEGER NOT NULL DEFAULT 1,
  created_at  TEXT    NOT NULL,
  updated_at  TEXT    NOT NULL
);

CREATE TABLE IF NOT EXISTS _migrations (
  filename TEXT PRIMARY KEY,
  applied_at TEXT NOT NULL
);
```

#### `database/sqlite/db.ts`

- Import `Database` from `better-sqlite3`
- Module-level singleton variable `_db: Database.Database | undefined`
- Export `getDb(): Database.Database`
- On first call: create DB at `process.env.SQLITE_FILE ?? './data/enterprise-starter.db'`
- Set pragmas: `journal_mode = WAL`, `foreign_keys = ON`
- Call `runMigrations(_db)` before returning

#### `database/sqlite/run-migrations.ts`

- Read all `.sql` files from `database/sqlite/migrations/` sorted by filename
- For each file not already in `_migrations` table: execute SQL in a transaction, then insert filename + now ISO string into `_migrations`
- Export `runMigrations(db: Database.Database): void`

---

### ZOD SCHEMAS (`features/users/schema.ts`)

Define and export all of these:

```typescript
UserSchema; // Full user row
User; // z.infer<typeof UserSchema>
UserCreateInputSchema;
UserCreateInput;
UserUpdateInputSchema;
UserUpdateInput;
UsersListQuerySchema;
UsersListQuery;
```

**UserSchema fields:**

- `id`: positive integer
- `name`: string, min 1, max 200
- `email`: valid email, max 320
- `role`: enum `['admin', 'editor', 'viewer']`
- `department`: nullable string, max 200
- `is_active`: boolean (SQLite stores as 0/1 — map in toRow())
- `created_at`: string (ISO 8601)
- `updated_at`: string (ISO 8601)

**UserCreateInputSchema**: omit `id`, `created_at`, `updated_at`; role defaults to `'viewer'`; is_active defaults to `true`; department optional.

**UserUpdateInputSchema**: `id` required; all other fields optional (same constraints as create).

**UsersListQuerySchema**: `search` (optional string), `role` (optional enum), `is_active` (optional boolean), `limit` (1–1000, default 500), `offset` (default 0).

---

### DB QUERIES (`features/users/db/users-queries.ts`)

Import `type { Database } from 'better-sqlite3'` and all schemas from `$src/features/users/schema.ts`.

Implement `toRow(raw: unknown): User` using `UserSchema.parse()`.

Note: SQLite stores booleans as integers. Before parsing, cast `is_active` from raw row: `{ ...raw, is_active: Boolean((raw as any).is_active) }`.

Implement all these exported functions (each takes `db: Database` as first param):

- **`listUsers(db, query: UsersListQuery): User[]`**
  - Build WHERE clause dynamically: if `search` provided, add `(name LIKE ? OR email LIKE ?)` with `%${search}%`; if `role` provided, add `role = ?`; if `is_active` provided, add `is_active = ?` (convert boolean to 0/1)
  - ORDER BY `name ASC`
  - Apply LIMIT and OFFSET
  - Map each row through `toRow()`

- **`countUsers(db, query: UsersListQuery): number`**
  - Same WHERE as listUsers but `SELECT COUNT(*)`
  - Return the count as number

- **`findUserById(db, id: number): User | undefined`**
  - SELECT \* WHERE id = ?
  - Return `toRow(row)` or `undefined`

- **`findUserByEmail(db, email: string): User | undefined`**
  - SELECT \* WHERE email = ?
  - Return `toRow(row)` or `undefined`

- **`insertUser(db, input: UserCreateInput): User`**
  - Set `created_at` and `updated_at` to `new Date().toISOString()`
  - Convert `is_active` to integer (1/0)
  - INSERT and return the inserted row via `findUserById(db, result.lastInsertRowid as number)!`

- **`updateUser(db, input: UserUpdateInput): User | undefined`**
  - Build SET clause from only the provided optional fields
  - Always include `updated_at = ?` with current ISO string
  - If no optional fields provided, just update `updated_at`
  - Convert `is_active` to integer if present
  - UPDATE WHERE id = ?
  - Return `findUserById(db, input.id)`

- **`deleteUser(db, id: number): boolean`**
  - DELETE WHERE id = ?
  - Return `stmt.changes > 0`

---

### SERVICE LAYER (`features/users/server/users-service.ts`)

Import `TRPCError` from `@trpc/server`. Import DB functions and types.

Export `createUsersService({ db }: { db: Database.Database })` returning an object with:

- **`list(query: UsersListQuery): User[]`** — calls `listUsers`
- **`getById(id: number): User`** — calls `findUserById`; throws `TRPCError({ code: 'NOT_FOUND' })` if undefined
- **`create(input: UserCreateInput): User`** — checks `findUserByEmail` first; throws `TRPCError({ code: 'CONFLICT', message: 'Email already exists' })` if found; calls `insertUser`
- **`update(input: UserUpdateInput): User`** — calls `getById` first (throws NOT_FOUND); if email provided and changed, check for conflict; calls `updateUser`
- **`delete(id: number): void`** — calls `getById` first (throws NOT_FOUND); calls `deleteUser`

---

### TRPC ROUTER (`features/users/server/users-router.ts`)

```typescript
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "$src/trpc/trpc";
import {
  UserCreateInputSchema,
  UserUpdateInputSchema,
  UsersListQuerySchema,
} from "$src/features/users/schema";

export const usersRouter = createTRPCRouter({
  list: publicProcedure
    .input(UsersListQuerySchema)
    .query(({ ctx, input }) => ctx.di.users.list(input)),
  getById: publicProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .query(({ ctx, input }) => ctx.di.users.getById(input.id)),
  create: publicProcedure
    .input(UserCreateInputSchema)
    .mutation(({ ctx, input }) => ctx.di.users.create(input)),
  update: publicProcedure
    .input(UserUpdateInputSchema)
    .mutation(({ ctx, input }) => ctx.di.users.update(input)),
  delete: publicProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(({ ctx, input }) => {
      ctx.di.users.delete(input.id);
    }),
});
```

---

### TRPC INFRASTRUCTURE

#### `trpc/trpc.ts`

```typescript
import { initTRPC } from "@trpc/server";
import type { TrpcContext } from "./context";

const t = initTRPC.context<TrpcContext>().create({
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;
```

Import `ZodError` from `zod`.

#### `trpc/context.ts`

```typescript
import type { Database } from "better-sqlite3";
import type { Di } from "$src/server/di";

export type TrpcContext = {
  db: Database;
  di: Di;
};
```

#### `trpc/server.ts`

```typescript
import { createTRPCRouter } from "./trpc";
import { usersRouter } from "$src/features/users/server/users-router";

export const appRouter = createTRPCRouter({
  users: usersRouter,
});

export type AppRouter = typeof appRouter;
```

#### `trpc/client.ts`

```typescript
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import { QueryClient } from "@tanstack/react-query";
import type { AppRouter } from "./server";

export const queryClient = new QueryClient();

const trpcClient = createTRPCClient<AppRouter>({
  links: [httpBatchLink({ url: "/api/trpc" })],
});

export const trpc = createTRPCOptionsProxy<AppRouter>({
  client: trpcClient,
  queryClient,
});
```

---

### DEPENDENCY INJECTION (`server/di.ts`)

```typescript
import type { Database } from "better-sqlite3";
import { createUsersService } from "$src/features/users/server/users-service";

export type Di = ReturnType<typeof createDi>;

export function createDi(deps: { db: Database }) {
  return {
    users: createUsersService(deps),
  };
}
```

---

### SERVER ENTRY (`+server.ts`)

Bootstrap Fastify through Vike server integration:

1. Create Fastify app in root `+server.ts`
2. Register `fastify-raw-body`
3. Register error handler, `/health`, and tRPC routes (`/api/trpc`, `/api/trpc/*`) before Vike route handling
4. Register Vike Fastify integration via `@vikejs/fastify`
5. Export `{ fetch, prod }` server object for Vike

#### `server/trpc-handler.ts`

- Create a Fastify route for `ALL /api/trpc` and `ALL /api/trpc/*`
- On each request: call `getDb()`, create `di = createDi({ db })`, call tRPC `fetchRequestHandler` with context `{ db, di }`
- Use `@trpc/server/adapters/fetch` adapter

#### `server/helpers/http-error-handler.ts`

Fastify `setErrorHandler` that:

- Logs the error
- Returns `{ error: message, statusCode }` JSON with the appropriate HTTP status code

---

### UI COMPONENTS

#### `pages/+config.ts`

```typescript
import vikeReact from "vike-react/config";
export default { extends: [vikeReact], ssr: false };
```

#### `pages/+Head.tsx`

```tsx
export default function Head() {
  return (
    <>
      <title>Enterprise Starter</title>
      <meta name="description" content="Enterprise internal tools starter" />
    </>
  );
}
```

AG Grid CSS is imported directly in `UsersGrid.tsx`, not here.

#### `pages/+Layout.tsx`

```tsx
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "$src/trpc/client";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <nav>
        <a href="/">Enterprise Starter</a>
        <a href="/users">Users</a>
      </nav>
      <main>{children}</main>
    </QueryClientProvider>
  );
}
```

#### `pages/index/+Page.tsx`

Simple welcome page with a heading "Enterprise Starter" and a link to `/users`.

#### `pages/users/+Page.tsx`

```tsx
import UsersFeature from "$src/features/users/ui/UsersFeature";
export default function UsersPage() {
  return <UsersFeature />;
}
```

#### `features/users/ui/UsersFeature.tsx`

This is the main orchestration component. It must:

1. Call `useQuery(trpc.users.list.queryOptions({ limit: 500 }))` — get users list
2. Hold state: `modalMode: 'create' | 'edit' | null`, `selectedUser: User | null`, `deleteTarget: User | null`
3. Hold `queryClient = useQueryClient()`
4. Define `refetchUsers = () => queryClient.refetchQueries(trpc.users.list.queryFilter())`
5. Render:
   - Page header: `<h1>Users</h1>` + `<button onClick={() => setModalMode('create')}>New User</button>`
   - Loading state when query is loading
   - Error message when query fails
   - `<UsersGrid users={data ?? []} onEdit={user => { setSelectedUser(user); setModalMode('edit'); }} onDelete={user => setDeleteTarget(user)} />`
   - `<UserFormModal>` (open when `modalMode !== null`)
   - `<ConfirmModal>` (open when `deleteTarget !== null`)
6. On delete confirm: use React Query `useMutation({ ...trpc.users.delete.mutationOptions(), onSuccess: ... })`
7. For delete errors, prefer `deleteMutation.isError` + `deleteMutation.error` directly; use `deleteMutation.reset()` to clear stale errors when reopening/closing modal.

#### `features/users/ui/UsersGrid.tsx`

AG Grid Community grid component.

```typescript
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { AgGridReact } from "ag-grid-react";
```

Props: `users: User[]`, `onEdit: (user: User) => void`, `onDelete: (user: User) => void`

Column definitions:

| field        | headerName | Options                                                              |
| ------------ | ---------- | -------------------------------------------------------------------- |
| `name`       | Name       | `sortable: true, filter: true, flex: 2`                              |
| `email`      | Email      | `sortable: true, filter: true, flex: 2`                              |
| `role`       | Role       | `sortable: true, filter: true, flex: 1`                              |
| `department` | Department | `filter: true, flex: 1, valueFormatter: ({ value }) => value ?? '—'` |
| `is_active`  | Active     | `flex: 1, valueFormatter: ({ value }) => value ? 'Yes' : 'No'`       |
| `created_at` | Created    | `flex: 1, valueFormatter: ({ value }) => value.slice(0, 10)`         |
| Actions      | —          | `flex: 1, cellRenderer` — renders Edit + Delete buttons              |

Grid container div: `className="ag-theme-alpine"`, `style={{ height: 600, width: '100%' }}`

Grid props: `rowData={users}`, `columnDefs={colDefs}`, `pagination={true}`, `paginationPageSize={50}`, `domLayout='normal'`

#### `features/users/ui/UserFormModal.tsx`

Modal form rendered as an overlay (`position: fixed`, centered, with backdrop).

Props:

```typescript
{
  mode: 'create' | 'edit';
  user?: User;           // populated in edit mode
  onClose: () => void;
  onSuccess: () => void; // called after successful mutation, before close
}
```

Form fields (all using controlled `useState`):

- `name` (text input, required)
- `email` (email input, required)
- `role` (select: admin / editor / viewer)
- `department` (text input, optional)
- `is_active` (checkbox)

On submit in create mode: call mutate from `useMutation({ ...trpc.users.create.mutationOptions(), ...handlers })`. On success: call `onSuccess()` then `onClose()`.

On submit in edit mode: call mutate from `useMutation({ ...trpc.users.update.mutationOptions(), ...handlers })` with `{ id: user.id, ...changedFields }`. On success: call `onSuccess()` then `onClose()`.

Display server error message below the form on mutation error.

#### `components/ui/ConfirmModal.tsx`

```typescript
type Props = {
  title: string;
  message: string;
  confirmLabel?: string;
  isLoading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};
```

Render as a simple modal overlay with title, message, Cancel button, and a Confirm (destructive) button. Show a spinner or "Loading…" text on the confirm button when `isLoading` is true.

---

### SHARED UTILITIES

#### `shared/app-styles.css`

Global styles:

- CSS reset (`*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }`)
- Base font: `font-family: system-ui, sans-serif; font-size: 16px; line-height: 1.5;`
- Nav bar styling: horizontal flex, padding, background color, gap between links
- Main content area: `padding: 24px; max-width: 1400px; margin: 0 auto;`
- Import in `pages/+Layout.tsx`

#### `shared/helpers/date-helpers.ts`

```typescript
export function formatDate(isoString: string): string {
  return isoString.slice(0, 10); // YYYY-MM-DD
}

export function nowIso(): string {
  return new Date().toISOString();
}
```

---

### CONFIGURATION FILES

#### `tsconfig.json`

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
    "skipLibCheck": true,
    "paths": { "$src/*": ["./*"] }
  },
  "include": ["./**/*.ts", "./**/*.tsx"],
  "exclude": ["node_modules", "dist"]
}
```

#### `vite.config.ts`

```typescript
import { defineConfig } from "vite";
import vike from "vike/plugin";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [vike(), react()],
  resolve: {
    alias: { $src: path.resolve(__dirname, ".") },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    pool: "forks",
    poolOptions: { forks: { singleFork: true } },
  },
});
```

#### `.prettierrc.json`

```json
{
  "arrowParens": "avoid",
  "printWidth": 120,
  "trailingComma": "none",
  "singleQuote": true
}
```

#### `vitest.setup.ts`

```typescript
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";
afterEach(cleanup);
```

#### `.env-EXAMPLE`

```
SQLITE_FILE=./data/enterprise-starter.db
PORT=3000
```

#### `.gitignore`

```
node_modules/
dist/
data/
*.db
.env
```

#### `global.d.ts`

```typescript
/// <reference types="vite/client" />
```

---

### BUILD VERIFICATION

After generating all files, verify:

1. Run `npm install` — no errors
2. Run `npx tsc --noEmit` — zero type errors
3. Run `npm run dev` — dev server starts on port 3000
4. Navigate to `http://localhost:3000/users` — AG Grid renders with empty state
5. Click "New User" — modal opens, form submits, user appears in grid
6. Click Edit on a row — modal pre-populates, update works
7. Click Delete on a row — confirm modal appears, deletion works

If typecheck fails, fix all errors before reporting completion. Do NOT skip type errors.

---

### SEED DATA (generate after core is working)

Create `database/sqlite/seed.ts`:

- Import `getDb`
- Call `deleteUser` for all existing rows (truncate: `db.exec('DELETE FROM users')`)
- Insert 20 sample users with:
  - Realistic first/last names
  - Valid email addresses (firstname.lastname@company.com)
  - Mixed roles (admin x3, editor x7, viewer x10)
  - Mixed departments: Engineering, Product, Design, Marketing, Operations, Finance
  - Mix of active (17) and inactive (3)
  - Dates spread over the past 2 years

Add script to `package.json`: `"db:seed": "tsx database/sqlite/seed.ts"`

---

## PROMPT END
