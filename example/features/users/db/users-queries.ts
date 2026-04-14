import type { Database } from 'better-sqlite3';
import {
  UserSchema,
  UserCreateInputSchema,
  type User,
  type UserCreateInput,
  type UserUpdateInput,
  type UsersListQuery
} from '$src/features/users/schema';

function toRow(raw: unknown): User {
  const r = raw as Record<string, unknown>;
  return UserSchema.parse({ ...r, is_active: Boolean(r['is_active']) });
}

export function listUsers(db: Database, query: UsersListQuery): User[] {
  const conditions: string[] = [];
  const params: unknown[] = [];

  if (query.search) {
    conditions.push('(name LIKE ? OR email LIKE ?)');
    params.push(`%${query.search}%`, `%${query.search}%`);
  }
  if (query.role !== undefined) {
    conditions.push('role = ?');
    params.push(query.role);
  }
  if (query.is_active !== undefined) {
    conditions.push('is_active = ?');
    params.push(query.is_active ? 1 : 0);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const sql = `SELECT * FROM users ${where} ORDER BY name ASC LIMIT ? OFFSET ?`;
  params.push(query.limit, query.offset);

  return (db.prepare(sql).all(...params) as unknown[]).map(toRow);
}

export function countUsers(db: Database, query: UsersListQuery): number {
  const conditions: string[] = [];
  const params: unknown[] = [];

  if (query.search) {
    conditions.push('(name LIKE ? OR email LIKE ?)');
    params.push(`%${query.search}%`, `%${query.search}%`);
  }
  if (query.role !== undefined) {
    conditions.push('role = ?');
    params.push(query.role);
  }
  if (query.is_active !== undefined) {
    conditions.push('is_active = ?');
    params.push(query.is_active ? 1 : 0);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const sql = `SELECT COUNT(*) as count FROM users ${where}`;
  const row = db.prepare(sql).get(...params) as { count: number };
  return row.count;
}

export function findUserById(db: Database, id: number): User | undefined {
  const row = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  if (!row) return undefined;
  return toRow(row);
}

export function findUserByEmail(db: Database, email: string): User | undefined {
  const row = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!row) return undefined;
  return toRow(row);
}

export function insertUser(db: Database, input: UserCreateInput): User {
  const parsed = UserCreateInputSchema.parse(input);
  const now = new Date().toISOString();
  const result = db
    .prepare(
      `INSERT INTO users (name, email, role, department, is_active, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      parsed.name,
      parsed.email,
      parsed.role,
      parsed.department ?? null,
      parsed.is_active ? 1 : 0,
      now,
      now
    );
  const inserted = findUserById(db, result.lastInsertRowid as number);
  if (!inserted) throw new Error('Insert succeeded but row not found');
  return inserted;
}

export function updateUser(db: Database, input: UserUpdateInput): User | undefined {
  const now = new Date().toISOString();
  const setClauses: string[] = ['updated_at = ?'];
  const params: unknown[] = [now];

  if (input.name !== undefined) { setClauses.push('name = ?'); params.push(input.name); }
  if (input.email !== undefined) { setClauses.push('email = ?'); params.push(input.email); }
  if (input.role !== undefined) { setClauses.push('role = ?'); params.push(input.role); }
  if (input.department !== undefined) { setClauses.push('department = ?'); params.push(input.department); }
  if (input.is_active !== undefined) { setClauses.push('is_active = ?'); params.push(input.is_active ? 1 : 0); }

  params.push(input.id);
  db.prepare(`UPDATE users SET ${setClauses.join(', ')} WHERE id = ?`).run(...params);
  return findUserById(db, input.id);
}

export function deleteUser(db: Database, id: number): boolean {
  const result = db.prepare('DELETE FROM users WHERE id = ?').run(id);
  return result.changes > 0;
}
