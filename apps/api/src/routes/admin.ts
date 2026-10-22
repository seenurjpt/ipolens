import {
  AdminIpoListQuery,
  AdminIpoListResponse,
  AdminIpoResponse,
  AdminReportListQuery,
  AdminReportListResponse,
  AdminReportResponse,
  AdminSummaryResponse,
  ErrorResponse,
  IdParams,
  IpoPatch,
  IpoStatus,
  JobParams,
  JobRunsResponse,
  PER_IPO_JOBS,
  PublishReportBody,
  TriggerJobBody,
  TriggerJobResponse,
  type ReportState,
} from '@ipolens/shared';
import { createHash, timingSafeEqual } from 'node:crypto';
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import mongoose, { type PipelineStage, type Types } from 'mongoose';
import { HttpError, notFound } from '../lib/http';
import { toPlain } from '../lib/serialize';
import { AiReportModel, IpoModel, type IpoDoc } from '../models';
import { QueueUnavailableError, type JobQueue } from '../services/job-queue';

export interface AdminRouteOptions {
  /** Bearer token required on every admin request. Admin routes answer 503 while unset. */
  adminToken: string | undefined;
  jobQueue: JobQueue | undefined;
}

const digest = (s: string) => createHash('sha256').update(s).digest();

/** Constant-time comparison; hashing first gives both sides the same length. */
function tokenMatches(header: string | undefined, token: string): boolean {
  const presented = header?.startsWith('Bearer ') ? header.slice(7) : '';
  return timingSafeEqual(digest(presented), digest(token));
}

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const errors = { 400: ErrorResponse, 401: ErrorResponse, 404: ErrorResponse, 409: ErrorResponse, 503: ErrorResponse };

export const adminRoutes: FastifyPluginAsyncZod<AdminRouteOptions> = async (app, { adminToken, jobQueue }) => {
  app.addHook('onRequest', async (req, reply) => {
    reply.header('cache-control', 'no-store');
    if (!adminToken) throw new HttpError(503, 'AdminDisabled', 'Admin API is disabled: ADMIN_API_TOKEN is not set');
    if (!tokenMatches(req.headers.authorization, adminToken)) {
      throw new HttpError(401, 'Unauthorized', 'A valid admin token is required');
    }
  });

  const requireQueue = () => {
    if (!jobQueue) throw new HttpError(503, 'QueueUnavailable', 'No job queue is configured');
    return jobQueue;
  };
  const queueCall = async <T>(fn: (q: JobQueue) => Promise<T>) => {
    try {
      return await fn(requireQueue());
    } catch (err) {
      if (err instanceof QueueUnavailableError) throw new HttpError(503, 'QueueUnavailable', err.message);
      throw err;
    }
  };

  // ---------- summary ----------
  app.get('/summary', { schema: { response: { 200: AdminSummaryResponse, ...errors } } }, async () => {
    const [byStatus, pendingReports] = await Promise.all([
      IpoModel.aggregate<{ _id: IpoStatus; n: number }>([{ $group: { _id: '$status', n: { $sum: 1 } } }]),
      AiReportModel.countDocuments({ published: false }),
    ]);
    const ipoCounts = Object.fromEntries(IpoStatus.options.map((s) => [s, byStatus.find((b) => b._id === s)?.n ?? 0]));
    return { ipoCounts, pendingReports, asOf: new Date() };
  });

  // ---------- IPOs ----------
  app.get(
    '/ipos',
    { schema: { querystring: AdminIpoListQuery, response: { 200: AdminIpoListResponse, ...errors } } },
    async (req) => {
      const { status, q, page, pageSize } = req.query;
      const match: Record<string, unknown> = {};
      if (status) match.status = { $in: status };
      if (q) {
        const re = new RegExp(escapeRegex(q), 'i');
        match.$or = [{ name: re }, { symbol: re }, { slug: re }];
      }
      // Newest issues first; IPOs with no dates yet go last.
      const pipeline: PipelineStage[] = [
        { $match: match },
        { $addFields: { _missingOpen: { $cond: [{ $ifNull: ['$dates.open', false] }, 0, 1] } } },
        {
          $facet: {
            items: [
              { $sort: { _missingOpen: 1, 'dates.open': -1, name: 1 } },
              { $skip: (page - 1) * pageSize },
              { $limit: pageSize },
              { $project: { _missingOpen: 0 } },
            ],
            total: [{ $count: 'n' }],
          },
        },
      ];
      const [result] = await IpoModel.aggregate<{ items: (IpoDoc & { _id: Types.ObjectId })[]; total: { n: number }[] }>(
        pipeline,
      );
      const items = result?.items ?? [];

      const reports = await AiReportModel.find({ ipoId: { $in: items.map((i) => i._id) } }, { ipoId: 1, published: 1 }).lean();
      const reportState = (id: Types.ObjectId): ReportState => {
        const own = reports.filter((r) => r.ipoId.equals(id));
        if (own.some((r) => r.published)) return 'PUBLISHED';
        return own.length > 0 ? 'PENDING' : 'NONE';
      };

      return {
        items: items.map((i) => ({ ...toPlain(i), reportState: reportState(i._id) })),
        page,
        pageSize,
        total: result?.total[0]?.n ?? 0,
        asOf: new Date(),
      };
    },
  );

  app.get('/ipos/:id', { schema: { params: IdParams, response: { 200: AdminIpoResponse, ...errors } } }, async (req) => {
    const ipo = await IpoModel.findById(req.params.id).lean();
    if (!ipo) throw notFound('No IPO with that id');
    return { ipo: toPlain(ipo), asOf: new Date() };
  });

  app.patch(
    '/ipos/:id',
    { schema: { params: IdParams, body: IpoPatch, response: { 200: AdminIpoResponse, ...errors } } },
    async (req) => {
      const ipo = await IpoModel.findById(req.params.id);
      if (!ipo) throw notFound('No IPO with that id');

      ipo.set(req.body);
      // Derived, so it can never disagree with the lot and band it comes from.
      ipo.minInvestmentPaise = ipo.lotSize * ipo.priceBand.maxPaise;

      try {
        await ipo.save();
      } catch (err) {
        if (err instanceof mongoose.Error.ValidationError) throw new HttpError(400, 'BadRequest', err.message);
        if ((err as { code?: number }).code === 11000) throw new HttpError(409, 'Conflict', 'Another IPO already uses that slug');
        throw err;
      }
      return { ipo: toPlain(ipo.toObject()), asOf: new Date() };
    },
  );

  // ---------- reports ----------
  app.get(
    '/reports',
    { schema: { querystring: AdminReportListQuery, response: { 200: AdminReportListResponse, ...errors } } },
    async (req) => {
      const filter = req.query.published === undefined ? {} : { published: req.query.published };
      const reports = await AiReportModel.find(filter, { ipoId: 1, version: 1, model: 1, published: 1, reviewedBy: 1, createdAt: 1, 'score.total': 1 })
        .sort({ published: 1, createdAt: -1 })
        .limit(200)
        .lean();
      const ipos = await IpoModel.find({ _id: { $in: reports.map((r) => r.ipoId) } }, { name: 1, slug: 1 }).lean();

      const items = reports.map(({ score, ...r }) => {
        const ipo = ipos.find((i) => i._id.equals(r.ipoId));
        return { ...toPlain(r), scoreTotal: score.total, ipo: ipo ? toPlain(ipo) : null };
      });
      return { items, asOf: new Date() };
    },
  );

  app.get('/reports/:id', { schema: { params: IdParams, response: { 200: AdminReportResponse, ...errors } } }, async (req) => {
    const report = await AiReportModel.findById(req.params.id).lean();
    if (!report) throw notFound('No report with that id');
    const ipo = await IpoModel.findById(report.ipoId, { name: 1, slug: 1, status: 1, documents: 1 }).lean();
    return { report: toPlain(report), ipo: ipo ? toPlain(ipo) : null, asOf: new Date() };
  });

  app.patch(
    '/reports/:id/publish',
    { schema: { params: IdParams, body: PublishReportBody, response: { 200: AdminReportResponse, ...errors } } },
    async (req) => {
      const report = await AiReportModel.findById(req.params.id);
      if (!report) throw notFound('No report with that id');

      report.published = req.body.published;
      report.reviewedBy = req.body.reviewedBy;
      await report.save();

      // The IPO points at the report the app shows: this one once published, otherwise the
      // newest remaining published version (or none).
      const current = req.body.published
        ? report
        : await AiReportModel.findOne({ ipoId: report.ipoId, published: true }).sort({ version: -1 });
      await IpoModel.updateOne(
        { _id: report.ipoId },
        current ? { $set: { aiReportId: current._id } } : { $unset: { aiReportId: 1 } },
      );

      const ipo = await IpoModel.findById(report.ipoId, { name: 1, slug: 1, status: 1, documents: 1 }).lean();
      return { report: toPlain(report.toObject()), ipo: ipo ? toPlain(ipo) : null, asOf: new Date() };
    },
  );

  // ---------- jobs ----------
  app.post(
    '/jobs/:name',
    { schema: { params: JobParams, body: TriggerJobBody, response: { 200: TriggerJobResponse, ...errors } } },
    async (req) => {
      const { name } = req.params;
      const { ipoId } = req.body ?? {};
      if (PER_IPO_JOBS.includes(name) && !ipoId) throw new HttpError(400, 'BadRequest', `${name} needs an ipoId`);
      if (ipoId && !(await IpoModel.exists({ _id: ipoId }))) throw notFound('No IPO with that id');
      const jobId = await queueCall((q) => q.add(name, ipoId ? { ipoId } : {}));
      return { jobId, asOf: new Date() };
    },
  );

  app.get('/jobs', { schema: { response: { 200: JobRunsResponse, ...errors } } }, async () => {
    const { counts, runs } = await queueCall((q) => q.recent(30));
    return { counts, runs, asOf: new Date() };
  });
};
