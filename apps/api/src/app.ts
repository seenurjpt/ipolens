import Fastify from 'fastify';
import { serializerCompiler, validatorCompiler, type ZodTypeProvider } from 'fastify-type-provider-zod';
import { env } from './env';

export function buildApp() {
  const app = Fastify({
    logger: {
      level: env.NODE_ENV === 'production' ? 'info' : 'debug',
      // Never log a PAN or a token (SPEC: Backend API routes > Rules). Widened in Prompt 2.
      redact: ['req.headers.authorization', '*.pan', '*.panEnc'],
    },
  }).withTypeProvider<ZodTypeProvider>();

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  app.get('/health', async () => ({ ok: true, asOf: new Date().toISOString() }));

  // /v1 routes from src/routes are registered in Prompt 2.
  return app;
}
