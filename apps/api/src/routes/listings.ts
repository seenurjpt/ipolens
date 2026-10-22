import { RecentListingsQuery, RecentListingsResponse } from '@ipolens/shared';
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { CACHE_SECONDS, cacheFor } from '../lib/http';
import { CARD_PROJECTION } from '../lib/projections';
import { toPlain } from '../lib/serialize';
import { IpoModel } from '../models';

export const listingRoutes: FastifyPluginAsyncZod = async (app) => {
  app.get(
    '/listings/recent',
    { schema: { querystring: RecentListingsQuery, response: { 200: RecentListingsResponse } } },
    async (req, reply) => {
      const docs = await IpoModel.find({ status: 'LISTED', listing: { $exists: true } }, CARD_PROJECTION)
        .sort({ 'dates.listing': -1 })
        .limit(req.query.limit)
        .lean();
      cacheFor(reply, CACHE_SECONDS.public);
      // The query already requires a listing; flatMap narrows the type to match.
      const items = toPlain(docs).flatMap(({ listing, ...card }) => (listing ? [{ ...card, listing }] : []));
      return { items, asOf: new Date() };
    },
  );
};
