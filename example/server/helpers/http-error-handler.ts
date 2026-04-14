import type { FastifyInstance } from 'fastify';

export function registerErrorHandler(app: FastifyInstance): void {
  app.setErrorHandler((error, _request, reply) => {
    app.log.error(error);
    const statusCode =
      typeof error === 'object' && error !== null && 'statusCode' in error
        ? Number((error as { statusCode?: number }).statusCode ?? 500)
        : 500;
    const message =
      error instanceof Error ? error.message : 'Internal Server Error';
    reply.status(statusCode).send({
      error: message,
      statusCode
    });
  });
}
