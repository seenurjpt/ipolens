import {
  AdminIpoListResponse,
  AdminIpoResponse,
  AdminReportListResponse,
  AdminReportResponse,
  AdminSummaryResponse,
  JobRunsResponse,
  type JobName,
} from '@ipolens/shared';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { buildApp } from '../app';
import { AiReportModel, IpoModel } from '../models';
import { seedDatabase } from '../seed';
import { QueueUnavailableError, type JobQueue } from '../services/job-queue';
import { useTestMongo } from '../test/mongo';

useTestMongo();

const TOKEN = 'test-admin-token';
const auth = { Authorization: `Bearer ${TOKEN}` };

// Records what was queued; `down` simulates Redis being unreachable.
const queued: { name: JobName; data: { ipoId?: string } }[] = [];
let down = false;
const fakeQueue: JobQueue = {
  async add(name, data) {
    if (down) throw new QueueUnavailableError();
    queued.push({ name, data });
    return String(queued.length);
  },
  async recent() {
    if (down) throw new QueueUnavailableError();
    return {
      counts: { completed: queued.length },
      runs: queued.map((q, i) => ({ id: String(i + 1), name: q.name, state: 'completed', ipoId: q.data.ipoId, createdAt: new Date() })),
    };
  },
  async close() {},
};

const app = buildApp({ logger: false, adminToken: TOKEN, jobQueue: fakeQueue });
const api = () => request(app.server);

let acmeId: string;
let reportId: string;

beforeAll(async () => {
  await seedDatabase();
  await app.ready();
  const acme = await IpoModel.findOne({ slug: 'acme-industries-ipo' }).lean();
  acmeId = acme!._id.toHexString();
  reportId = acme!.aiReportId!.toHexString();
});
afterAll(() => app.close());

describe('admin auth', () => {
  it('answers 503 on every admin route while no token is configured', async () => {
    const off = buildApp({ logger: false, adminToken: null });
    await off.ready();
    const res = await request(off.server).get('/v1/admin/ipos').set(auth).expect(503);
    expect(res.body.error).toBe('AdminDisabled');
    await off.close();
  });

  it('rejects a missing or wrong token with 401', async () => {
    await api().get('/v1/admin/ipos').expect(401);
    await api().get('/v1/admin/ipos').set({ Authorization: 'Bearer nope' }).expect(401);
    await api().get('/v1/admin/ipos').set({ Authorization: TOKEN }).expect(401); // no "Bearer "
  });

  it('never lets admin responses be cached', async () => {
    const res = await api().get('/v1/admin/summary').set(auth).expect(200);
    expect(res.headers['cache-control']).toBe('no-store');
  });

  it('leaves the public API open', async () => {
    await api().get('/v1/ipos').expect(200);
  });
});

describe('GET /v1/admin/summary', () => {
  it('counts IPOs by status and reports awaiting review', async () => {
    const body = AdminSummaryResponse.parse((await api().get('/v1/admin/summary').set(auth).expect(200)).body);
    expect(body.ipoCounts).toMatchObject({ UPCOMING: 1, OPEN: 1, CLOSED: 1, ALLOTMENT: 1, LISTED: 1, WITHDRAWN: 1 });
    expect(body.pendingReports).toBe(0);
  });
});

describe('admin IPOs', () => {
  it('lists full IPO documents with their report state, newest first', async () => {
    const body = AdminIpoListResponse.parse((await api().get('/v1/admin/ipos').set(auth).expect(200)).body);
    expect(body.total).toBe(6);
    const opens = body.items.map((i) => i.dates.open!.getTime());
    expect(opens).toEqual([...opens].sort((a, b) => b - a));
    expect(body.items.find((i) => i._id === acmeId)).toMatchObject({ reportState: 'PUBLISHED', registrar: { code: 'MUFG_INTIME' } });
    expect(body.items.find((i) => i.slug === 'nimbus-cloudworks-ipo')?.reportState).toBe('NONE');
  });

  it('filters by status and search', async () => {
    const body = AdminIpoListResponse.parse((await api().get('/v1/admin/ipos?status=OPEN,LISTED&q=a').set(auth).expect(200)).body);
    expect(body.items.map((i) => i.symbol).sort()).toEqual(['ACME', 'KAVYA']);
  });

  it('gets one IPO, 404 for an unknown id, 400 for a malformed id', async () => {
    const { ipo } = AdminIpoResponse.parse((await api().get(`/v1/admin/ipos/${acmeId}`).set(auth).expect(200)).body);
    expect(ipo.name).toBe('Acme Industries');
    await api().get('/v1/admin/ipos/0123456789abcdef01234567').set(auth).expect(404);
    await api().get('/v1/admin/ipos/not-an-id').set(auth).expect(400);
  });

  it('patches fields, replaces nested objects whole and recomputes the minimum investment', async () => {
    const res = await api()
      .patch(`/v1/admin/ipos/${acmeId}`)
      .set(auth)
      .send({ industry: 'CNC Machines', lotSize: 48, priceBand: { minPaise: 29_000, maxPaise: 31_000 } })
      .expect(200);
    const { ipo } = AdminIpoResponse.parse(res.body);
    expect(ipo).toMatchObject({ industry: 'CNC Machines', lotSize: 48, priceBand: { minPaise: 29_000, maxPaise: 31_000 } });
    expect(ipo.minInvestmentPaise).toBe(48 * 31_000);
    // Untouched fields survive.
    expect(ipo.registrar.code).toBe('MUFG_INTIME');
    expect((await IpoModel.findById(acmeId).lean())?.minInvestmentPaise).toBe(48 * 31_000);
  });

  it('rejects invalid patches with 400', async () => {
    const patch = (body: object) => api().patch(`/v1/admin/ipos/${acmeId}`).set(auth).send(body);
    await patch({}).expect(400); // nothing to update
    await patch({ lotSize: 0 }).expect(400);
    await patch({ priceBand: { minPaise: 400, maxPaise: 300 } }).expect(400);
    await patch({ status: 'SOMETIME' }).expect(400);
    await patch({ minInvestmentPaise: 1 }).expect(400); // derived, not editable
    await patch({ aiReportId: reportId }).expect(400); // owned by the publish flow
  });

  it('answers 409 when the new slug is taken and 404 for an unknown IPO', async () => {
    await api().patch(`/v1/admin/ipos/${acmeId}`).set(auth).send({ slug: 'kavya-textiles-ipo' }).expect(409);
    await api().patch('/v1/admin/ipos/0123456789abcdef01234567').set(auth).send({ industry: 'x' }).expect(404);
  });
});

describe('admin reports', () => {
  it('lists reports with their IPO, unpublished first', async () => {
    const draft = await AiReportModel.create({
      ...(await AiReportModel.findById(reportId).lean())!,
      _id: undefined,
      version: 2,
      published: false,
      reviewedBy: undefined,
    });
    const body = AdminReportListResponse.parse((await api().get('/v1/admin/reports').set(auth).expect(200)).body);
    expect(body.items.map((r) => [r.version, r.published])).toEqual([
      [2, false],
      [1, true],
    ]);
    expect(body.items[0]).toMatchObject({ ipo: { slug: 'acme-industries-ipo' }, scoreTotal: 61 });

    const pending = AdminReportListResponse.parse((await api().get('/v1/admin/reports?published=false').set(auth).expect(200)).body);
    expect(pending.items.map((r) => r._id)).toEqual([draft._id.toHexString()]);
  });

  it('returns one report with its IPO documents for the PDF links', async () => {
    const body = AdminReportResponse.parse((await api().get(`/v1/admin/reports/${reportId}`).set(auth).expect(200)).body);
    expect(body.report.score.total).toBe(61);
    expect(body.ipo?.documents.rhpUrl).toContain('acme-industries-ipo');
    await api().get('/v1/admin/reports/0123456789abcdef01234567').set(auth).expect(404);
  });

  it('publishing points the IPO at the report; unpublishing falls back to the previous version', async () => {
    const draft = await AiReportModel.findOne({ version: 2 }).lean();
    const draftId = draft!._id.toHexString();

    const res = await api()
      .patch(`/v1/admin/reports/${draftId}/publish`)
      .set(auth)
      .send({ published: true, reviewedBy: 'Asha' })
      .expect(200);
    expect(AdminReportResponse.parse(res.body).report).toMatchObject({ published: true, reviewedBy: 'Asha' });
    expect((await IpoModel.findById(acmeId).lean())?.aiReportId?.toHexString()).toBe(draftId);

    await api().patch(`/v1/admin/reports/${draftId}/publish`).set(auth).send({ published: false, reviewedBy: 'Asha' }).expect(200);
    expect((await IpoModel.findById(acmeId).lean())?.aiReportId?.toHexString()).toBe(reportId);
  });

  it('requires a reviewer name', async () => {
    await api().patch(`/v1/admin/reports/${reportId}/publish`).set(auth).send({ published: true, reviewedBy: ' ' }).expect(400);
  });
});

describe('admin jobs', () => {
  it('queues a sweep job without an IPO and a per-IPO job with one', async () => {
    down = false;
    queued.length = 0;
    await api().post('/v1/admin/jobs/discover-ipos').set(auth).send({}).expect(200);
    const res = await api().post('/v1/admin/jobs/ai-report').set(auth).send({ ipoId: acmeId }).expect(200);
    expect(res.body.jobId).toBe('2');
    expect(queued).toEqual([
      { name: 'discover-ipos', data: {} },
      { name: 'ai-report', data: { ipoId: acmeId } },
    ]);
  });

  it('rejects unknown jobs, per-IPO jobs without an IPO, and unknown IPOs', async () => {
    await api().post('/v1/admin/jobs/mine-bitcoin').set(auth).send({}).expect(400);
    await api().post('/v1/admin/jobs/enrich-ipo').set(auth).send({}).expect(400);
    await api().post('/v1/admin/jobs/enrich-ipo').set(auth).send({ ipoId: '0123456789abcdef01234567' }).expect(404);
  });

  it('lists recent runs', async () => {
    const body = JobRunsResponse.parse((await api().get('/v1/admin/jobs').set(auth).expect(200)).body);
    expect(body.runs.map((r) => r.name)).toEqual(['discover-ipos', 'ai-report']);
  });

  it('answers 503 when the queue is down or not configured', async () => {
    down = true;
    expect((await api().post('/v1/admin/jobs/discover-ipos').set(auth).send({}).expect(503)).body.error).toBe('QueueUnavailable');
    await api().get('/v1/admin/jobs').set(auth).expect(503);
    down = false;

    const noQueue = buildApp({ logger: false, adminToken: TOKEN });
    await noQueue.ready();
    await request(noQueue.server).get('/v1/admin/jobs').set(auth).expect(503);
    await noQueue.close();
  });
});
