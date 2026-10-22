import { CalendarQuery, CalendarResponse, ErrorResponse, type CalendarEvent, type CalendarEventType } from '@ipolens/shared';
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { CACHE_SECONDS, HttpError, cacheFor } from '../lib/http';
import { toPlain } from '../lib/serialize';
import { IpoModel } from '../models';

const DAY_MS = 86_400_000;
const MAX_RANGE_DAYS = 92;

const EVENT_FIELDS: [CalendarEventType, 'open' | 'close' | 'allotment' | 'listing'][] = [
  ['OPEN', 'open'],
  ['CLOSE', 'close'],
  ['ALLOTMENT', 'allotment'],
  ['LISTING', 'listing'],
];

export const calendarRoutes: FastifyPluginAsyncZod = async (app) => {
  app.get(
    '/calendar',
    { schema: { querystring: CalendarQuery, response: { 200: CalendarResponse, 400: ErrorResponse } } },
    async (req, reply) => {
      const now = Date.now();
      const from = req.query.from ?? new Date(now - 7 * DAY_MS);
      const to = req.query.to ?? new Date(now + 30 * DAY_MS);
      if (to.getTime() - from.getTime() > MAX_RANGE_DAYS * DAY_MS) {
        throw new HttpError(400, 'BadRequest', `The range can be at most ${MAX_RANGE_DAYS} days`);
      }

      const inRange = { $gte: from, $lte: to };
      const ipos = await IpoModel.find(
        { status: { $ne: 'WITHDRAWN' }, $or: EVENT_FIELDS.map(([, f]) => ({ [`dates.${f}`]: inRange })) },
        { slug: 1, name: 1, board: 1, status: 1, dates: 1 },
      ).lean();

      const events: CalendarEvent[] = [];
      for (const doc of ipos) {
        const { dates, ...summary } = toPlain(doc);
        for (const [type, field] of EVENT_FIELDS) {
          const date = dates[field];
          if (date && date >= from && date <= to) events.push({ type, date, ipo: summary });
        }
      }
      events.sort((a, b) => a.date.getTime() - b.date.getTime() || a.ipo.name.localeCompare(b.ipo.name));

      cacheFor(reply, CACHE_SECONDS.public);
      return { from, to, events, asOf: new Date() };
    },
  );
};
