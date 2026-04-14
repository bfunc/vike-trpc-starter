import type { Database } from 'better-sqlite3';

export type Di = ReturnType<typeof createDi>;

export function createDi(_deps: { db: Database }) {
  return {};
}
