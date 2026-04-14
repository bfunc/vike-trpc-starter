import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '$src/trpc/trpc';
import { UserCreateInputSchema, UserUpdateInputSchema, UsersListQuerySchema } from '../schema';

export const usersRouter = createTRPCRouter({
  list: publicProcedure.input(UsersListQuerySchema).query(({ ctx, input }) => ctx.di.users.list(input)),

  getById: publicProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .query(({ ctx, input }) => ctx.di.users.getById(input.id)),

  create: publicProcedure.input(UserCreateInputSchema).mutation(({ ctx, input }) => ctx.di.users.create(input)),

  update: publicProcedure.input(UserUpdateInputSchema).mutation(({ ctx, input }) => ctx.di.users.update(input)),

  delete: publicProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(({ ctx, input }) => ctx.di.users.delete(input.id))
});