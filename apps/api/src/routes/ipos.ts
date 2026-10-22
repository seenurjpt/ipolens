import {
  ErrorResponse,
  IpoDetailResponse,
  IpoListQuery,
  IpoListResponse,
  ReportResponse,
  SlugParams,
  SubscriptionResponse,
  type IpoSort,
} from '@ipolens/shared';
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import type { PipelineStage, Types } from 'mongoose';
import { CACHE_SECONDS, cacheFor, notFound } from '../lib/http';
import { CARD_PROJECTION } from '../lib/projections';
import { toPlain } from '../lib/serialize';
import { AiReportModel, IpoModel, SubscriptionSnapshotModel, type IpoDoc } from '../models';
import type { SubscriptionCache } from '../services/subscription-cache';

const SORT_FIELDS: Record<IpoSort, [field: string, direction: 1 | -1]> = {
  closeAsc: ['dates.close', 1],
  closeDesc: ['dates.close', -1],
  openAsc: ['dates.open', 1],
  openDesc: ['dates.open', -1],
  listingDesc: ['dates.listing', -1],
};

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const ipoRoutes: FastifyPluginAsyncZod<{ subscriptionCache: SubscriptionCache }> = async (
  app,
  { subscriptionCache },
) => {
  app.get(
    '/ipos',
    { schema: { querystring: IpoListQuery, response: { 200: IpoListResponse } } },
    async (req, reply) => {
      const { status, board, q, sort, page, pageSize } = req.query;
      const match: Record<string, unknown> = {};
      if (status) match.status = { $in: status };
      if (board) match.board = board;
      if (q) {
        const re = new RegExp(escapeRegex(q), 'i');
        match.$or = [{ name: re }, { symbol: re }];
      }

      // IPOs without the sort date (e.g. an upcoming issue with no schedule yet) go last
      // in both directions; name breaks ties so paging is stable.
      const [field, direction] = SORT_FIELDS[sort];
      const pipeline: PipelineStage[] = [
        { $match: match },
        { $addFields: { _missingSortDate: { $cond: [{ $ifNull: [`$${field}`, false] }, 0, 1] } } },
        {
          $facet: {
            items: [
              { $sort: { _missingSortDate: 1, [field]: direction, name: 1 } },
              { $skip: (page - 1) * pageSize },
              { $limit: pageSize },
              { $project: CARD_PROJECTION },
            ],
            total: [{ $count: 'n' }],
          },
        },
      ];
      const [result] = await IpoModel.aggregate<{ items: (IpoDoc & { _id: Types.ObjectId })[]; total: { n: number }[] }>(pipeline);

      cacheFor(reply, CACHE_SECONDS.public);
      return {
        items: toPlain(result?.items ?? []),
        page,
        pageSize,
        total: result?.total[0]?.n ?? 0,
        asOf: new Date(),
      };
    },
  );

  app.get(
    '/ipos/:slug',
    { schema: { params: SlugParams, response: { 200: IpoDetailResponse, 404: ErrorResponse } } },
    async (req, reply) => {
      const ipo = await IpoModel.findOne({ slug: req.params.slug }).lean();
      if (!ipo) throw notFound(`No IPO with slug "${req.params.slug}"`);
      cacheFor(reply, CACHE_SECONDS.public);
      return { ipo: toPlain(ipo), asOf: new Date() };
    },
  );

  app.get(
    '/ipos/:slug/subscription',
    { schema: { params: SlugParams, response: { 200: SubscriptionResponse, 404: ErrorResponse } } },
    async (req, reply) => {
      const ipo = await IpoModel.findOne({ slug: req.params.slug }, { latestSubscription: 1 }).lean();
      if (!ipo) throw notFound(`No IPO with slug "${req.params.slug}"`);

      const [cached, history] = await Promise.all([
        subscriptionCache.getLatest(ipo._id.toHexString()),
        SubscriptionSnapshotModel.find({ ipoId: ipo._id }, { _id: 0, ipoId: 0, __v: 0 }).sort({ at: 1 }).lean(),
      ]);
      const latest = cached ?? ipo.latestSubscription ?? null;

      cacheFor(reply, CACHE_SECONDS.subscription);
      // asOf is the time of the newest figures, which drives "Updated X min ago".
      return { latest, history, asOf: latest?.at ?? new Date() };
    },
  );

  app.get(
    '/ipos/:slug/report',
    { schema: { params: SlugParams, response: { 200: ReportResponse, 404: ErrorResponse } } },
    async (req, reply) => {
      const ipo = await IpoModel.findOne({ slug: req.params.slug }, { _id: 1 }).lean();
      if (!ipo) throw notFound(`No IPO with slug "${req.params.slug}"`);

      const report = await AiReportModel.findOne({ ipoId: ipo._id, published: true }).sort({ version: -1 }).lean();
      if (!report) throw notFound('The analysis report for this IPO is not ready yet');

      cacheFor(reply, CACHE_SECONDS.public);
      return { report: toPlain(report), asOf: new Date() };
    },
  );
};
