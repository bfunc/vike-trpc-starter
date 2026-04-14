import type { FastifyInstance } from 'fastify';

export function registerTrpcLogging(app: FastifyInstance): void {
  app.addHook('onRequest', async (request, _reply) => {
    if (request.url.startsWith('/api/trpc')) {
      app.log.info({ method: request.method, url: request.url }, 'tRPC request');
    }
  });
}
