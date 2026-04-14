import type { Database } from 'better-sqlite3';
import { createUsersService } from '$src/features/users/server/users-service';

export type Di = ReturnType<typeof createDi>;

export function createDi(deps: { db: Database }) {
  return {
    users: createUsersService(deps)
  };
}
