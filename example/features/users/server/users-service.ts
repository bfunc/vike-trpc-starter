import type Database from 'better-sqlite3';
import { TRPCError } from '@trpc/server';
import {
  deleteUser,
  findUserByEmail,
  findUserById,
  listUsers,
  updateUser,
  insertUser
} from '../db/users-queries';
import type { UserCreateInput, UserUpdateInput, UsersListQuery } from '../schema';

export type UsersService = ReturnType<typeof createUsersService>;

export function createUsersService({ db }: { db: Database.Database }) {
  return {
    list(query: UsersListQuery) {
      return listUsers(db, query);
    },

    getById(id: number) {
      const user = findUserById(db, id);
      if (!user) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found.' });
      }
      return user;
    },

    create(input: UserCreateInput) {
      const existingUser = findUserByEmail(db, input.email);
      if (existingUser) {
        throw new TRPCError({ code: 'CONFLICT', message: 'A user with this email already exists.' });
      }

      return insertUser(db, input);
    },

    update(input: UserUpdateInput) {
      const currentUser = findUserById(db, input.id);
      if (!currentUser) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found.' });
      }

      if (input.email && input.email.toLowerCase() !== currentUser.email.toLowerCase()) {
        const existingUser = findUserByEmail(db, input.email);
        if (existingUser && existingUser.id !== input.id) {
          throw new TRPCError({ code: 'CONFLICT', message: 'A user with this email already exists.' });
        }
      }

      const user = updateUser(db, input);
      if (!user) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found.' });
      }

      return user;
    },

    delete(id: number) { 
      const deleted = deleteUser(db, id);
      if (!deleted) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found.' });
      }
    }
  };
}