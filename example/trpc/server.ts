import { createTRPCRouter } from './trpc';
import { usersRouter } from '$src/features/users/server/users-router';

export const appRouter = createTRPCRouter({
	users: usersRouter
});

export type AppRouter = typeof appRouter;
