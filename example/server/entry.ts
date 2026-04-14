import 'dotenv/config';
import Fastify from 'fastify';
import { getDb } from '$src/database/sqlite/db';
import { registerErrorHandler } from '$src/server/helpers/http-error-handler';
import { registerTrpcLogging } from '$src/server/helpers/trpc-logging';
import { registerApiRoutes } from '$src/server/api';
import { registerTrpcHandler } from '$src/server/trpc-handler';

async function start() {
  const app = Fastify({ logger: true });

  // initialize DB (runs migrations)
  getDb();

  registerErrorHandler(app);
  registerTrpcLogging(app);
  registerApiRoutes(app);
  registerTrpcHandler(app);

  // Vike middleware — serves the SPA for all non-API routes
  const { default: vikeHandler } = await import('vike/server');
  // @ts-expect-error vike server typing varies by version
  app.all('/*', async (req, reply) => {
    // Let Vike handle SPA routing
    await vikeHandler(req.raw, reply.raw);
  });

  const port = Number(process.env.PORT ?? 3000);
  await app.listen({ port, host: '0.0.0.0' });
  console.log(`Server listening on http://localhost:${port}`);
}

start().catch(err => {
  console.error(err);
  process.exit(1);
});
