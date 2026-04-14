import type Database from 'better-sqlite3';
import { nowIso } from '$src/shared/helpers/date-helpers';
import {
  UserCreateInputSchema,
  UserSchema,
  UserUpdateInputSchema,
  UsersListQuerySchema,
  type User,
  type UserCreateInput,
  type UserUpdateInput,
  type UsersListQuery
} from '../schema';

type SqlWhere = {
  clause: string;
  params: unknown[];
};

type UserRow = {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  department: string | null;
  is_active: number;
  created_at: string;
  updated_at: string;
};

export function toRow(raw: Record<string, unknown>): User {
  return UserSchema.parse({
    ...raw,
    is_active: Number(raw.is_active) === 1
  });
}

function buildUsersWhere(query: UsersListQuery): SqlWhere {
  const filters = UsersListQuerySchema.parse(query);
  const clauses: string[] = [];
  const params: unknown[] = [];

  if (filters.search) {
    clauses.push('(name LIKE ? OR email LIKE ?)');
    const pattern = `%${filters.search}%`;
    params.push(pattern, pattern);
  }

  if (filters.role) {
    clauses.push('role = ?');
    params.push(filters.role);
  }

  if (typeof filters.is_active === 'boolean') {
    clauses.push('is_active = ?');
    params.push(filters.is_active ? 1 : 0);
  }

  return {
    clause: clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '',
    params
  };
}

export function listUsers(db: Database.Database, query: UsersListQuery): User[] {
  const filters = UsersListQuerySchema.parse(query);
  const where = buildUsersWhere(filters);
  const rows = db
    .prepare(
      `
        SELECT id, name, email, role, department, is_active, created_at, updated_at
        FROM users
        ${where.clause}
        ORDER BY created_at DESC, id DESC
        LIMIT ? OFFSET ?
      `
    )
    .all(...where.params, filters.limit, filters.offset) as UserRow[];

  return rows.map(row => toRow(row));
}

export function countUsers(db: Database.Database, query: UsersListQuery): number {
  const filters = UsersListQuerySchema.parse(query);
  const where = buildUsersWhere(filters);
  const row = db
    .prepare(
      `
        SELECT COUNT(*) as count
        FROM users
        ${where.clause}
      `
    )
    .get(...where.params) as { count: number } | undefined;

  return row?.count ?? 0;
}

export function findUserById(db: Database.Database, id: number): User | undefined {
  const row = db
    .prepare(
      `
        SELECT id, name, email, role, department, is_active, created_at, updated_at
        FROM users
        WHERE id = ?
      `
    )
    .get(id) as UserRow | undefined;

  return row ? toRow(row) : undefined;
}

export function findUserByEmail(db: Database.Database, email: string): User | undefined {
  const row = db
    .prepare(
      `
        SELECT id, name, email, role, department, is_active, created_at, updated_at
        FROM users
        WHERE lower(email) = lower(?)
      `
    )
    .get(email) as UserRow | undefined;

  return row ? toRow(row) : undefined;
}

export function insertUser(db: Database.Database, input: UserCreateInput): User {
  const payload = UserCreateInputSchema.parse(input);
  const timestamp = nowIso();
  const department = payload.department?.trim() ? payload.department.trim() : null;
  const result = db
    .prepare(
      `
        INSERT INTO users (name, email, role, department, is_active, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `
    )
    .run(
      payload.name,
      payload.email,
      payload.role,
      department,
      payload.is_active ? 1 : 0,
      timestamp,
      timestamp
    );

  return findUserById(db, Number(result.lastInsertRowid)) as User;
}

export function updateUser(db: Database.Database, input: UserUpdateInput): User | undefined {
  const payload = UserUpdateInputSchema.parse(input);
  const updates: string[] = [];
  const params: unknown[] = [];

  if (payload.name !== undefined) {
    updates.push('name = ?');
    params.push(payload.name);
  }

  if (payload.email !== undefined) {
    updates.push('email = ?');
    params.push(payload.email);
  }

  if (payload.role !== undefined) {
    updates.push('role = ?');
    params.push(payload.role);
  }

  if (payload.department !== undefined) {
    updates.push('department = ?');
    params.push(payload.department?.trim() ? payload.department.trim() : null);
  }

  if (payload.is_active !== undefined) {
    updates.push('is_active = ?');
    params.push(payload.is_active ? 1 : 0);
  }

  updates.push('updated_at = ?');
  params.push(nowIso(), payload.id);

  const result = db
    .prepare(
      `
        UPDATE users
        SET ${updates.join(', ')}
        WHERE id = ?
      `
    )
    .run(...params);

  if (result.changes === 0) {
    return undefined;
  }

  return findUserById(db, payload.id);
}

export function deleteUser(db: Database.Database, id: number): boolean {
  const result = db.prepare('DELETE FROM users WHERE id = ?').run(id);
  return result.changes > 0;
}