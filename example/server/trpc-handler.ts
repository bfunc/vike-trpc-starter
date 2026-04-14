import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import type { FastifyInstance } from 'fastify';
import { getDb } from '$src/database/sqlite/db';
import { createDi } from '$src/server/di';
import { appRouter } from '$src/trpc/server';

export function registerTrpcHandler(app: FastifyInstance): void {
  const handler = async (request: Request): Promise<Response> => {
    const db = getDb();
    const di = createDi({ db });
    return fetchRequestHandler({
      endpoint: '/api/trpc',
      req: request,
      router: appRouter,
      createContext: () => ({ db, di })
    });
  };

  app.all('/api/trpc', async (req, reply) => {
    const url = `http://${req.hostname}${req.url}`;
    const webRequest = new Request(url, {
      method: req.method,
      headers: req.headers as Record<string, string>,
      body: ['GET', 'HEAD'].includes(req.method) ? undefined : JSON.stringify(req.body)
    });
    const response = await handler(webRequest);
    const body = await response.text();
    reply
      .status(response.status)
      .headers(Object.fromEntries(response.headers.entries()))
      .send(body);
  });

  app.all('/api/trpc/*', async (req, reply) => {
    const url = `http://${req.hostname}${req.url}`;
    const webRequest = new Request(url, {
      method: req.method,
      headers: req.headers as Record<string, string>,
      body: ['GET', 'HEAD'].includes(req.method) ? undefined : JSON.stringify(req.body)
    });
    const response = await handler(webRequest);
    const body = await response.text();
    reply
      .status(response.status)
      .headers(Object.fromEntries(response.headers.entries()))
      .send(body);
  });
}
