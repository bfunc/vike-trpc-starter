# Feature Specification — Users

This document fully specifies the **Users** feature: the single working feature shipped with the enterprise starter template.

---

## 1. Overview

The Users feature provides a full list view of application users displayed in an **AG Grid Community** data grid. Users can be created, edited, and deleted from this screen.

This feature demonstrates the complete vertical slice of the architecture:
- SQLite schema and migrations
- Zod validation schemas
- DB query layer
- Service layer with DI
- tRPC router
- React UI with AG Grid

---

## 2. Database Schema

### Migration: `database/sqlite/migrations/001_initial.sql`

```sql
CREATE TABLE IF NOT EXISTS users (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT    NOT NULL,
  email       TEXT    NOT NULL UNIQUE,
  role        TEXT    NOT NULL DEFAULT 'viewer',
  department  TEXT,
  is_active   INTEGER NOT NULL DEFAULT 1,   -- 0 = inactive, 1 = active
  created_at  TEXT    NOT NULL,             -- ISO 8601 string
  updated_at  TEXT    NOT NULL              -- ISO 8601 string
);
```

**Allowed role values:** `'admin'`, `'editor'`, `'viewer'`

### Migration Runner (`database/sqlite/run-migrations.ts`)

- Reads all `*.sql` files from `migrations/` in filename order
- Executes each inside a transaction
- Tracks applied migrations in a `_migrations` table to avoid re-running

### DB Singleton (`database/sqlite/db.ts`)

- Creates the database file at `SQLITE_FILE` env path
- Runs migrations at startup
- Enables WAL mode and foreign keys
- Exports `getDb()` function returning the singleton `Database` instance

---

## 3. Zod Schemas (`features/users/schema.ts`)

```typescript
// Base user shape (matches DB row)
export const UserSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1).max(200),
  email: z.string().email().max(320),
  role: z.enum(['admin', 'editor', 'viewer']),
  department: z.string().max(200).nullable(),
  is_active: z.boolean(),
  created_at: z.string(),   // ISO 8601
  updated_at: z.string(),   // ISO 8601
});
export type User = z.infer<typeof UserSchema>;

// Input schema for creating a new user
export const UserCreateInputSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email().max(320),
  role: z.enum(['admin', 'editor', 'viewer']).default('viewer'),
  department: z.string().max(200).optional(),
  is_active: z.boolean().default(true),
});
export type UserCreateInput = z.infer<typeof UserCreateInputSchema>;

// Input schema for updating an existing user
export const UserUpdateInputSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1).max(200).optional(),
  email: z.string().email().max(320).optional(),
  role: z.enum(['admin', 'editor', 'viewer']).optional(),
  department: z.string().max(200).nullable().optional(),
  is_active: z.boolean().optional(),
});
export type UserUpdateInput = z.infer<typeof UserUpdateInputSchema>;

// Input schema for the list query
export const UsersListQuerySchema = z.object({
  search: z.string().optional(),           // filter by name or email
  role: z.enum(['admin', 'editor', 'viewer']).optional(),
  is_active: z.boolean().optional(),
  limit: z.number().int().min(1).max(1000).default(500),
  offset: z.number().int().min(0).default(0),
});
export type UsersListQuery = z.infer<typeof UsersListQuerySchema>;
```

---

## 4. DB Query Layer (`features/users/db/users-queries.ts`)

All functions accept a `db: Database.Database` argument (no module-level singleton — DI handles that).

### `toRow(raw: Record<string, unknown>): User`

Maps a raw SQLite row (where booleans are integers) to the `User` type:
- `is_active`: SQLite integer (0/1) → boolean
- All other fields: direct passthrough after Zod parse

### Functions to implement

| Function | Signature | SQL notes |
|---|---|---|
| `listUsers` | `(db, query: UsersListQuery) => User[]` | LIKE search on name + email, optional role + is_active filter, LIMIT/OFFSET |
| `countUsers` | `(db, query: UsersListQuery) => number` | Same WHERE clause, returns COUNT(*) |
| `findUserById` | `(db, id: number) => User \| undefined` | SELECT by id |
| `findUserByEmail` | `(db, email: string) => User \| undefined` | SELECT by email |
| `insertUser` | `(db, input: UserCreateInput) => User` | INSERT, set created_at + updated_at to now ISO string, return inserted row |
| `updateUser` | `(db, input: UserUpdateInput) => User \| undefined` | UPDATE only provided fields + updated_at, return updated row |
| `deleteUser` | `(db, id: number) => boolean` | DELETE by id, return true if a row was deleted |

---

## 5. Service Layer (`features/users/server/users-service.ts`)

```typescript
export type UsersService = ReturnType<typeof createUsersService>;

export function createUsersService({ db }: { db: Database.Database }) {
  return {
    list(query: UsersListQuery): User[],
    getById(id: number): User,              // throws TRPCError NOT_FOUND if missing
    create(input: UserCreateInput): User,   // throws TRPCError CONFLICT if email exists
    update(input: UserUpdateInput): User,   // throws TRPCError NOT_FOUND if missing
    delete(id: number): void,              // throws TRPCError NOT_FOUND if missing
  };
}
```

**Error handling rules:**
- Use `TRPCError` with appropriate codes: `NOT_FOUND`, `CONFLICT`, `BAD_REQUEST`
- Never throw raw JS errors from service layer
- Duplicate email on create → `CONFLICT`
- Non-existent id on get/update/delete → `NOT_FOUND`

---

## 6. tRPC Router (`features/users/server/users-router.ts`)

```typescript
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
    .mutation(({ ctx, input }) => ctx.di.users.delete(input.id)),
});
```

Mounted at `trpc/server.ts`:
```typescript
export const appRouter = createTRPCRouter({
  users: usersRouter,
});
```

---

## 7. UI Components

### 7.1 Page: `pages/users/+Page.tsx`

Thin wrapper — just renders `<UsersFeature />`. No logic here.

### 7.2 `features/users/ui/UsersFeature.tsx`

Responsibilities:
- Fetches user list via `trpc.users.list.useQuery({ limit: 500 })`
- Manages modal state (create / edit / delete)
- Renders toolbar (title + "New User" button) + `<UsersGrid />`
- Opens `<UserFormModal>` for create/edit
- Opens `<ConfirmModal>` for delete
- After any mutation: calls `queryClient.refetchQueries(trpc.users.list.queryFilter())`

### 7.3 `features/users/ui/UsersGrid.tsx`

Responsibilities:
- Renders AG Grid Community grid
- Column definitions (see section 7.4)
- Receives `users: User[]`, `onEdit: (user: User) => void`, `onDelete: (user: User) => void` as props
- Handles row-level action buttons via AG Grid cell renderer

**AG Grid setup:**
```typescript
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
// theme: className="ag-theme-alpine" on the wrapper div
// domLayout: 'autoHeight'
// pagination: true, paginationPageSize: 50
```

### 7.4 Column Definitions

| Field | Header | Type | Notes |
|---|---|---|---|
| `name` | Name | string | Sortable, filterable |
| `email` | Email | string | Sortable, filterable |
| `role` | Role | string | Filter via dropdown |
| `department` | Department | string | Nullable, filterable |
| `is_active` | Active | boolean | Render as "Yes"/"No" badge |
| `created_at` | Created | string | Format as `YYYY-MM-DD` |
| Actions | — | custom | Edit + Delete buttons |

### 7.5 `features/users/ui/UserFormModal.tsx`

A modal form (using a simple `<dialog>` element or a div overlay) for creating and editing users.

Fields: `name`, `email`, `role` (select), `department` (optional), `is_active` (checkbox)

- In create mode: calls `trpc.users.create.useMutation`
- In edit mode: pre-populates fields, calls `trpc.users.update.useMutation`
- Shows field-level validation errors from Zod (via tRPC error response `zodError`)
- Closes on success or cancel

### 7.6 Shared `components/ui/ConfirmModal.tsx`

Props: `title: string`, `message: string`, `onConfirm: () => void`, `onCancel: () => void`, `isLoading: boolean`

Used by UsersFeature for delete confirmation.

---

## 8. Navigation

`pages/+Layout.tsx` navigation bar includes a link to `/users` labeled "Users".

Home page (`pages/index/+Page.tsx`) may redirect to `/users` or show a simple welcome card with a link.

---

## 9. Seed Data (Optional)

Create a `database/sqlite/seed.ts` script that inserts 20 sample users with realistic names, emails, mixed roles, and departments. Run with `tsx database/sqlite/seed.ts`. This is helpful for demo and development.

---

## 10. Error States in UI

| Scenario | UI Behavior |
|---|---|
| List query loading | AG Grid shows loading overlay |
| List query error | Show error message above grid |
| Create/update conflict (email exists) | Show inline error in form modal |
| Delete failure | Show toast or alert |
| Network error | React Query retries 3x, then shows error |
