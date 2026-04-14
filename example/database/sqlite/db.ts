import Database from 'better-sqlite3';
import { runMigrations } from './run-migrations';

let _db: Database.Database | undefined;

export function getDb(): Database.Database {
  if (!_db) {
    const file = process.env.SQLITE_FILE ?? './data/enterprise-starter.db';
    _db = new Database(file);
    _db.pragma('journal_mode = WAL');
    _db.pragma('foreign_keys = ON');
    runMigrations(_db);
  }
  return _db;
}
