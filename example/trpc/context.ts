import type { Database } from 'better-sqlite3';
import type { Di } from '$src/server/di';

export type TrpcContext = {
  db: Database;
  di: Di;
};
