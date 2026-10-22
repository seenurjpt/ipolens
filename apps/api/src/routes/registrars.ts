import { REGISTRARS, RegistrarParams, RegistrarResponse } from '@ipolens/shared';
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { CACHE_SECONDS, cacheFor } from '../lib/http';

export const registrarRoutes: FastifyPluginAsyncZod = async (app) => {
  app.get(
    '/registrars/:code',
    { schema: { params: RegistrarParams, response: { 200: RegistrarResponse } } },
    async (req, reply) => {
      const { code } = req.params;
      cacheFor(reply, CACHE_SECONDS.public);
      return { registrar: { code, ...REGISTRARS[code] }, asOf: new Date() };
    },
  );
};
