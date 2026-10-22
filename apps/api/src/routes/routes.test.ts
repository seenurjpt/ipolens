import {
  CalendarResponse,
  IpoDetailResponse,
  IpoListResponse,
  RecentListingsResponse,
  ReportResponse,
  SubscriptionResponse,
  type SubscriptionFigures,
} from '@ipolens/shared';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { buildApp } from '../app';
import { seedDatabase } from '../seed';
import type { SubscriptionCache } from '../services/subscription-cache';
import { useTestMongo } from '../test/mongo';

useTestMongo();

// Controls what the "Redis" cache returns, per test.
let cachedLatest: SubscriptionFigures | null = null;
const fakeCache: SubscriptionCache = { getLatest: async () => cachedLatest };

const app = buildApp({ logger: false, subscriptionCache: fakeCache });
const api = () => request(app.server);

beforeAll(async () => {
  await seedDatabase();
  await app.ready();
});
afterAll(() => app.close());

describe('GET /v1/ipos', () => {
  it('lists every IPO with asOf and a 60 s cache header', async () => {
    const res = await api().get('/v1/ipos').expect(200);
    const body = IpoListResponse.parse(res.body);
    expect(body.total).toBe(6);
    expect(body.items).toHaveLength(6);
    expect(body.asOf).toBeInstanceOf(Date);
    expect(res.headers['cache-control']).toBe('public, max-age=60, s-maxage=60');
  });

  it('returns list cards, not full documents', async () => {
    const res = await api().get('/v1/ipos').expect(200);
    const card = res.body.items[0];
    expect(card).toHaveProperty('priceBand');
    expect(card).not.toHaveProperty('registrar');
    expect(card).not.toHaveProperty('__v');
    expect(card._id).toMatch(/^[a-f\d]{24}$/);
  });

  it('filters by status and board', async () => {
    const open = IpoListResponse.parse((await api().get('/v1/ipos?status=OPEN').expect(200)).body);
    expect(open.items.map((i) => i.name)).toEqual(['Acme Industries']);
    expect(open.items[0]!.latestSubscription?.total).toBeGreaterThan(0);

    const sme = IpoListResponse.parse((await api().get('/v1/ipos?board=SME').expect(200)).body);
    expect(sme.total).toBe(2);
    expect(sme.items.every((i) => i.board === 'SME')).toBe(true);
  });

  it('sorts by closing date, earliest first, by default', async () => {
    const { items } = IpoListResponse.parse((await api().get('/v1/ipos').expect(200)).body);
    const closes = items.map((i) => i.dates.close!.getTime());
    expect(closes).toEqual([...closes].sort((a, b) => a - b));
  });

  it('accepts a comma-separated status list', async () => {
    const body = IpoListResponse.parse((await api().get('/v1/ipos?status=CLOSED,ALLOTMENT').expect(200)).body);
    expect(body.items.map((i) => i.status).sort()).toEqual(['ALLOTMENT', 'CLOSED']);
  });

  it('paginates', async () => {
    const body = IpoListResponse.parse((await api().get('/v1/ipos?pageSize=4&page=2').expect(200)).body);
    expect(body).toMatchObject({ page: 2, pageSize: 4, total: 6 });
    expect(body.items).toHaveLength(2);
  });

  it('searches by name or symbol, case-insensitively', async () => {
    const byName = IpoListResponse.parse((await api().get('/v1/ipos?q=kavya').expect(200)).body);
    expect(byName.items.map((i) => i.symbol)).toEqual(['KAVYA']);
    const bySymbol = IpoListResponse.parse((await api().get('/v1/ipos?q=VARDHAN').expect(200)).body);
    expect(bySymbol.total).toBe(1);
  });

  it('rejects an unknown status with 400', async () => {
    const res = await api().get('/v1/ipos?status=SOMETIME').expect(400);
    expect(res.body.error).toBe('BadRequest');
  });
});

describe('GET /v1/ipos/:slug', () => {
  it('returns the full IPO with registrar and documents', async () => {
    const res = await api().get('/v1/ipos/acme-industries-ipo').expect(200);
    const { ipo } = IpoDetailResponse.parse(res.body);
    expect(ipo.registrar.code).toBe('MUFG_INTIME');
    expect(ipo.documents.rhpUrl).toContain('acme-industries-ipo');
    expect(ipo.aiReportId).toMatch(/^[a-f\d]{24}$/);
  });

  it('returns a JSON 404 for an unknown slug', async () => {
    const res = await api().get('/v1/ipos/no-such-ipo').expect(404);
    expect(res.body).toEqual({ error: 'NotFound', message: 'No IPO with slug "no-such-ipo"' });
  });
});

describe('GET /v1/ipos/:slug/subscription', () => {
  it('returns the history in time order, with latest from MongoDB on a cache miss', async () => {
    cachedLatest = null;
    const res = await api().get('/v1/ipos/acme-industries-ipo/subscription').expect(200);
    const body = SubscriptionResponse.parse(res.body);
    expect(body.history.length).toBeGreaterThan(0);
    const times = body.history.map((s) => s.at.getTime());
    expect(times).toEqual([...times].sort((a, b) => a - b));
    expect(body.latest).toEqual(body.history.at(-1));
    expect(body.asOf).toEqual(body.latest!.at);
    expect(res.headers['cache-control']).toBe('public, max-age=15, s-maxage=15');
  });

  it('prefers the live figures from the cache', async () => {
    const at = new Date();
    cachedLatest = { at, qib: 120, nii: 70, bnii: 80, snii: 50, retail: 20, total: 75, source: 'MERGED' };
    const body = SubscriptionResponse.parse((await api().get('/v1/ipos/acme-industries-ipo/subscription').expect(200)).body);
    expect(body.latest?.qib).toBe(120);
    expect(body.asOf).toEqual(at);
    cachedLatest = null;
  });

  it('returns an empty history for an IPO that has not opened', async () => {
    const body = SubscriptionResponse.parse((await api().get('/v1/ipos/nimbus-cloudworks-ipo/subscription').expect(200)).body);
    expect(body).toMatchObject({ latest: null, history: [] });
  });
});

describe('GET /v1/ipos/:slug/report', () => {
  it('returns the published report', async () => {
    const { report } = ReportResponse.parse((await api().get('/v1/ipos/acme-industries-ipo/report').expect(200)).body);
    expect(report.score.total).toBe(61);
    expect(report.financials).toHaveLength(3);
  });

  it('returns 404 while no report is published', async () => {
    const res = await api().get('/v1/ipos/nimbus-cloudworks-ipo/report').expect(404);
    expect(res.body.message).toMatch(/not ready/);
  });
});

describe('GET /v1/calendar', () => {
  it('returns dated events in order, without withdrawn IPOs', async () => {
    const body = CalendarResponse.parse((await api().get('/v1/calendar').expect(200)).body);
    const times = body.events.map((e) => e.date.getTime());
    expect(times).toEqual([...times].sort((a, b) => a - b));
    expect(body.events.some((e) => e.type === 'OPEN' && e.ipo.slug === 'acme-industries-ipo')).toBe(true);
    expect(body.events.some((e) => e.ipo.status === 'WITHDRAWN')).toBe(false);
    expect(body.events.every((e) => e.date >= body.from && e.date <= body.to)).toBe(true);
  });

  it('rejects from after to, and ranges over 92 days', async () => {
    await api().get('/v1/calendar?from=2026-10-10&to=2026-10-01').expect(400);
    await api().get('/v1/calendar?from=2026-01-01&to=2026-12-31').expect(400);
  });
});

describe('GET /v1/listings/recent', () => {
  it('returns listed IPOs with their listing gain', async () => {
    const { items } = RecentListingsResponse.parse((await api().get('/v1/listings/recent').expect(200)).body);
    expect(items.map((i) => i.name)).toEqual(['Kavya Textiles']);
    expect(items[0]!.listing.gainPct).toBe(18.75);
  });
});

describe('GET /v1/registrars/:code', () => {
  it('returns the allotment page and allowed hosts', async () => {
    const res = await api().get('/v1/registrars/KFIN').expect(200);
    expect(res.body.registrar).toMatchObject({
      code: 'KFIN',
      allotmentUrl: 'https://ipostatus.kfintech.com/',
      allowedHosts: ['ipostatus.kfintech.com'],
    });
  });

  it('rejects an unknown registrar', async () => {
    await api().get('/v1/registrars/NOPE').expect(400);
  });
});

describe('unknown routes', () => {
  it('return a JSON 404', async () => {
    const res = await api().get('/v1/nothing-here').expect(404);
    expect(res.body.error).toBe('NotFound');
  });
});
