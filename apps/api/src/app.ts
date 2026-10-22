import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import Fastify, { type FastifyError, type FastifyServerOptions } from 'fastify';
import {
  hasZodFastifySchemaValidationErrors,
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod';
import type { Redis } from 'ioredis';
import { env } from './env';
import { HttpError, RATE_LIMITS } from './lib/http';
import { redactLogLine } from './lib/redact';
import { v1Routes } from './routes';
import { noSubscriptionCache, type SubscriptionCache } from './services/subscription-cache';

export interface AppOptions {
  /** Pino options; false disables logging. Redaction is always applied when logging. */
  logger?: false | Exclude<FastifyServerOptions['logger'], boolean | undefined>;
  subscriptionCache?: SubscriptionCache;
  /** Shares rate-limit counters across API instances. In-memory when omitted. */
  redis?: Redis;
  rateLimitMax?: number;
}

export function buildApp(opts: AppOptions = {}) {
  const app = Fastify({
    logger:
      opts.logger === false
        ? false
        : {
            level: env.NODE_ENV === 'production' ? 'info' : 'debug',
            ...opts.logger,
            // Never log a PAN (SPEC: Backend API routes > Rules).
            redact: ['req.headers.authorization'],
            hooks: { streamWrite: redactLogLine },
          },
    trustProxy: true, // rate limiting keys on the client IP behind the edge cache
  }).withTypeProvider<ZodTypeProvider>();

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  app.setErrorHandler((err: FastifyError, req, reply) => {
    if (hasZodFastifySchemaValidationErrors(err)) {
      return reply.status(400).send({ error: 'BadRequest', message: err.message });
    }
    if (err instanceof HttpError) {
      return reply.status(err.statusCode).send({ error: err.error, message: err.message });
    }
    const status = err.statusCode ?? 500;
    if (status >= 500) req.log.error(err);
    return reply.status(status).send({
      error: status >= 500 ? 'InternalServerError' : (err.code ?? 'Error'),
      message: status >= 500 ? 'Something went wrong' : err.message,
    });
  });

  app.setNotFoundHandler((req, reply) =>
    reply.status(404).send({ error: 'NotFound', message: `No route for ${req.method} ${req.url}` }),
  );

  // Public data is read-only, so any origin may GET it (the Expo web build runs on another port).
  app.register(cors, { origin: true, methods: ['GET', 'HEAD'] });

  app.register(rateLimit, {
    max: opts.rateLimitMax ?? RATE_LIMITS.public,
    timeWindow: '1 minute',
    redis: opts.redis,
    skipOnError: true, // a Redis outage must not take the API down
    errorResponseBuilder: (_req, ctx) => ({
      statusCode: ctx.statusCode,
      code: 'TooManyRequests',
      message: `Rate limit exceeded, retry in ${ctx.after}`,
    }),
  });

  // Registered before the rate-limit plugin loads, so uptime pings are never limited.
  app.get('/health', async () => ({ ok: true, asOf: new Date().toISOString() }));

  app.register(v1Routes, { prefix: '/v1', subscriptionCache: opts.subscriptionCache ?? noSubscriptionCache });

  return app;
}
