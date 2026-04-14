# Enterprise Starter Template — Specification Index

This folder contains documentation for an AI agent to scaffold a production-ready enterprise web application starter project.

## Purpose

These specs describe a **generic, opinionated starter template** — not related to LinguaSense — that teams can use as a foundation for internal enterprise tools, admin dashboards, and CRUD-heavy applications.

## Scope

The `example/` app is currently in **exercise mode**: the Users feature was intentionally removed.

Use the specs in this repository to rebuild it end-to-end:

- `FEATURE-USERS.md` defines the exact Users requirements (DB schema, API, UI)
- `AI-BUILD-PROMPT.md` provides a full scaffold/build prompt for an AI coding agent

## How to Use

1. Read [ARCHITECTURE.md](./ARCHITECTURE.md) — tech stack, folder structure, patterns, conventions
2. Read [FEATURE-USERS.md](./FEATURE-USERS.md) — the Users feature spec (DB schema, API, UI)
3. Use [AI-BUILD-PROMPT.md](./AI-BUILD-PROMPT.md) — the full prompt to hand to an AI coding agent

## Key Technology Choices

- Language: TypeScript
- Runtime: Node.js + Browser
- Infra: Vike (Fullstack from Vite)
- Server: Fastify + tRPC + Zod
- Client: React + React (Tanstack) Query

| Concern        | Choice                    | Why                                                             |
| -------------- | ------------------------- | --------------------------------------------------------------- |
| Meta-framework | Vike + vike-react         | File-system routing, SSR-capable, Fastify-friendly              |
| UI             | React 19 + TypeScript     | Industry standard                                               |
| Backend        | Fastify + tRPC            | Type-safe API with zero boilerplate                             |
| Database       | SQLite via better-sqlite3 | Zero-config, file-based, enterprise-safe for small-medium scale |
| Data grid      | AG Grid Community         | Free, feature-rich, enterprise-familiar                         |
| Validation     | Zod                       | Runtime + compile-time type safety                              |
| Server state   | @tanstack/react-query     | Caching, refetch, loading states                                |
| Build          | Vite 7                    | Fast HMR, tree-shaking                                          |
| Styling        | CSS Modules               | Scoped styles, no extra runtime                                 |

## Feature prompt example

Build Users CRUD feature end-to-end in example folder

- clean UX
- use AG Grid community

Constraints:

Keep existing stack and architecture (Vike + Fastify + tRPC + React Query + SQLite + Zod).
Recreate Users CRUD with list/create/update/delete and usable UI.
Use strict TypeScript and pass typecheck.
Preserve current code style and folder conventions.
Errors must be visible to users for all failed mutations.
Keep implementation readable and minimal; avoid unnecessary local state when built-in query/mutation state is sufficient.
Do not introduce enterprise AG Grid packages.
Do not add backend/frontend split; keep one-project flow.
Acceptance:

/users route exists and works.
Users can be listed, created, edited, deleted.
SQLite schema and data flow are wired correctly.
Mutation failures display clear messages (no silent fail).
npm run typecheck passes.
Deliverables:

Code changes only in this repo.
Brief summary of what was implemented.
Commands run for validation.
