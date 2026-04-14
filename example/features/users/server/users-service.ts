import { TRPCError } from '@trpc/server';
import type { Database } from 'better-sqlite3';
import {
  listUsers,
  findUserById,
  findUserByEmail,
  insertUser,
  updateUser,
  deleteUser
} from '$src/features/users/db/users-queries';
import type { User, UserCreateInput, UserUpdateInput, UsersListQuery } from '$src/features/users/schema';

export type UsersService = ReturnType<typeof createUsersService>;

export function createUsersService({ db }: { db: Database }) {
  return {
    list(query: UsersListQuery): User[] {
      return listUsers(db, query);
    },

    getById(id: number): User {
      const user = findUserById(db, id);
      if (!user) throw new TRPCError({ code: 'NOT_FOUND', message: `User ${id} not found` });
      return user;
    },

    create(input: UserCreateInput): User {
      const existing = findUserByEmail(db, input.email);
      if (existing) throw new TRPCError({ code: 'CONFLICT', message: 'Omg error!' });
      return insertUser(db, input);
    },

    update(input: UserUpdateInput): User {
      // ensure exists
      this.getById(input.id);
      // check email conflict if email is changing
      if (input.email !== undefined) {
        const existing = findUserByEmail(db, input.email);
        if (existing && existing.id !== input.id) {
          throw new TRPCError({ code: 'CONFLICT', message: 'Email already exists' });
        }
      }  
      const updated = updateUser(db, input);
      if (!updated) throw new TRPCError({ code: 'NOT_FOUND', message: `User ${input.id} not found` });
      return updated;
    },

    delete(id: number): void {
      this.getById(id);
      deleteUser(db, id);
    }
  };
}
