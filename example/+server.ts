import vike, { toFetchHandler } from '@vikejs/fastify';
import fastify from 'fastify';
import rawBody from 'fastify-raw-body';
import type { Server } from 'vike/types';
import { getDb } from '$src/database/sqlite/db';
import { registerApiRoutes } from '$src/server/api';
import { registerErrorHandler } from '$src/server/helpers/http-error-handler';
import { registerTrpcLogging } from '$src/server/helpers/trpc-logging';
import { registerTrpcHandler } from '$src/server/trpc-handler';

const port = process.env.PORT ? Number.parseInt(process.env.PORT, 10) : 3000;

async function getHandler() {
  const app = fastify({
    // Keep HMR stable while reloading in dev.
    forceCloseConnections: true,
    logger: true
  });

  // Required so request bodies remain accessible through the adapter chain.
  await app.register(rawBody);

  // Initialize DB and HTTP/tRPC routes before Vike route handling.
  getDb();
  registerErrorHandler(app);
  registerTrpcLogging(app);
  registerApiRoutes(app);
  registerTrpcHandler(app);

  await vike(app);
  await app.ready();

  return toFetchHandler(app.routing.bind(app));
}

export default {
  fetch: await getHandler(),
  prod: { port }
} as Server;
