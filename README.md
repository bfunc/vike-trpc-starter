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

| Concern | Choice | Why |
|---|---|---|
| Meta-framework | Vike + vike-react | File-system routing, SSR-capable, Fastify-friendly |
| UI | React 19 + TypeScript | Industry standard |
| Backend | Fastify + tRPC | Type-safe API with zero boilerplate |
| Database | SQLite via better-sqlite3 | Zero-config, file-based, enterprise-safe for small-medium scale |
| Data grid | AG Grid Community | Free, feature-rich, enterprise-familiar |
| Validation | Zod | Runtime + compile-time type safety |
| Server state | @tanstack/react-query | Caching, refetch, loading states |
| Build | Vite 7 | Fast HMR, tree-shaking |
| Styling | CSS Modules | Scoped styles, no extra runtime |
