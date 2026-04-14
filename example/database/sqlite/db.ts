import Database from 'better-sqlite3';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { runMigrations } from './run-migrations';

let _db: Database.Database | undefined;

export function getDb(): Database.Database {
  if (!_db) {
    const file = process.env.SQLITE_FILE ?? './data/enterprise-starter.db';
    if (file !== ':memory:') {
      const dir = path.dirname(file);
      if (dir !== '.') {
        mkdirSync(dir, { recursive: true });
      }
    }
    _db = new Database(file);
    _db.pragma('journal_mode = WAL');
    _db.pragma('foreign_keys = ON');
    runMigrations(_db);
  }
  return _db;
}
