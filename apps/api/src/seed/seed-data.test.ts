import { Board, IpoStatus } from '@ipolens/shared';
import { describe, expect, it } from 'vitest';
import { buildSeedData } from './seed-data';

const NOW = new Date('2026-10-22T08:30:00Z'); // 14:00 IST, mid-session

describe('buildSeedData', () => {
  const data = buildSeedData(NOW);

  it('has 6 IPOs covering every status and both boards', () => {
    expect(data.ipos).toHaveLength(6);
    expect(new Set(data.ipos.map((i) => i.status))).toEqual(new Set(IpoStatus.options));
    expect(new Set(data.ipos.map((i) => i.board))).toEqual(new Set(Board.options));
  });

  it('stores money as integer paise', () => {
    for (const ipo of data.ipos) {
      for (const v of [ipo.priceBand.minPaise, ipo.priceBand.maxPaise, ipo.minInvestmentPaise, ipo.issueSizePaise]) {
        expect(Number.isInteger(v)).toBe(true);
      }
      expect(ipo.freshIssuePaise + ipo.ofsPaise).toBe(ipo.issueSizePaise);
      expect(ipo.minInvestmentPaise).toBe(ipo.lotSize * ipo.priceBand.maxPaise);
    }
  });

  it('has subscription history for every IPO that has opened, and none in the future', () => {
    for (const ipo of data.ipos) {
      const history = data.snapshots.filter((s) => s.ipoId === ipo._id);
      const hasOpened = ['OPEN', 'CLOSED', 'ALLOTMENT', 'LISTED'].includes(ipo.status);
      expect(history.length > 0).toBe(hasOpened);
      expect(history.every((s) => s.at <= NOW)).toBe(true);
      // Monotonic: bids only accumulate.
      for (let i = 1; i < history.length; i++) expect(history[i]!.total).toBeGreaterThanOrEqual(history[i - 1]!.total);
      if (hasOpened) expect(ipo.latestSubscription?.at).toEqual(history.at(-1)!.at);
    }
  });

  it('keeps each status consistent with its dates', () => {
    for (const ipo of data.ipos) {
      const { open, close, listing } = ipo.dates;
      if (ipo.status === 'UPCOMING') expect(open!.getTime()).toBeGreaterThan(NOW.getTime());
      if (ipo.status === 'OPEN') {
        expect(open!.getTime()).toBeLessThanOrEqual(NOW.getTime());
        expect(close!.getTime()).toBeGreaterThan(NOW.getTime());
      }
      if (ipo.status === 'LISTED') {
        expect(listing!.getTime()).toBeLessThan(NOW.getTime());
        expect(ipo.listing).toBeDefined();
      }
    }
  });

  it('omits the bNII/sNII split for SME issues', () => {
    const smeIds = new Set(data.ipos.filter((i) => i.board === 'SME').map((i) => i._id));
    for (const s of data.snapshots.filter((s) => smeIds.has(s.ipoId))) {
      expect(s.bnii).toBeUndefined();
      expect(s.snii).toBeUndefined();
    }
  });

  it('links the AI report to its IPO, with no advice words', () => {
    const [report] = data.aiReports;
    const ipo = data.ipos.find((i) => i._id === report!.ipoId);
    expect(ipo?.aiReportId).toBe(report!._id);
    const text = JSON.stringify([report!.summary, report!.pros, report!.cons, report!.risks]);
    expect(text).not.toMatch(/\b(buy|subscribe|avoid|apply)\b/i);
  });
});
