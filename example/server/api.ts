import type { FastifyInstance } from 'fastify';

export function registerApiRoutes(app: FastifyInstance): void {
  app.get('/health', async (_request, _reply) => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });
}
