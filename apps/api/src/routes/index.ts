import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import type { SubscriptionCache } from '../services/subscription-cache';
import { calendarRoutes } from './calendar';
import { ipoRoutes } from './ipos';
import { listingRoutes } from './listings';
import { registrarRoutes } from './registrars';

/** Public /v1 routes. User (/v1/me) and admin routes are added in Prompts 5 and 7. */
export const v1Routes: FastifyPluginAsyncZod<{ subscriptionCache: SubscriptionCache }> = async (app, opts) => {
  await app.register(ipoRoutes, { subscriptionCache: opts.subscriptionCache });
  await app.register(calendarRoutes);
  await app.register(listingRoutes);
  await app.register(registrarRoutes);
};
