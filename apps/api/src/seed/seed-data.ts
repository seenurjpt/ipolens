import {
  AiReportInput,
  IpoInput,
  REGISTRARS,
  SubscriptionSnapshotInput,
  type Board,
  type IpoStatus,
  type RegistrarCode,
} from '@ipolens/shared';
import { Types } from 'mongoose';

// Fake data for local development and tests. Every date is relative to `now`, so each
// IPO's status stays consistent with its schedule whenever the seed runs.

type WithId<T> = T & { _id: string };

export interface SeedData {
  ipos: WithId<IpoInput>[];
  snapshots: SubscriptionSnapshotInput[];
  aiReports: WithId<AiReportInput>[];
}

const IST_OFFSET_MS = 330 * 60_000;
const rupees = (r: number) => Math.round(r * 100);

/** Midnight IST, `dayOffset` days from today in IST, as a UTC Date. */
function istDay(now: Date, dayOffset: number): Date {
  const ist = new Date(now.getTime() + IST_OFFSET_MS);
  return new Date(Date.UTC(ist.getUTCFullYear(), ist.getUTCMonth(), ist.getUTCDate() + dayOffset) - IST_OFFSET_MS);
}

const atIst = (day: Date, hours: number, minutes = 0) => new Date(day.getTime() + (hours * 60 + minutes) * 60_000);

interface FinalSubscription {
  qib: number;
  bnii?: number; // mainboard only
  snii?: number; // mainboard only
  nii?: number; // SME only, where NII is not split
  retail: number;
  employee?: number;
}

interface IpoSpec {
  name: string;
  symbol: string;
  isin?: string;
  board: Board;
  status: IpoStatus;
  industry: string;
  registrar: RegistrarCode;
  leadManagers: string[];
  priceBand: [number, number]; // rupees
  issueSizeCr: number;
  ofsCr: number;
  /** Day offsets from today (IST). */
  days: { open: number; close: number; allotment: number; refund: number; demat: number; listing: number };
  reservation: IpoInput['reservation'];
  finalSubscription?: FinalSubscription;
  listing?: { openRupees: number; closeRupees: number };
}

const SPECS: IpoSpec[] = [
  {
    name: 'Nimbus Cloudworks',
    symbol: 'NIMBUS',
    board: 'MAINBOARD',
    status: 'UPCOMING',
    industry: 'IT Services',
    registrar: 'KFIN',
    leadManagers: ['Axis Capital', 'JM Financial'],
    priceBand: [412, 434],
    issueSizeCr: 1250,
    ofsCr: 450,
    days: { open: 5, close: 7, allotment: 8, refund: 9, demat: 9, listing: 10 },
    reservation: { qibPct: 50, niiPct: 15, retailPct: 35, employeeQuota: 150_000 },
  },
  {
    name: 'Acme Industries',
    symbol: 'ACME',
    isin: 'INE0AC101012',
    board: 'MAINBOARD',
    status: 'OPEN',
    industry: 'Industrial Machinery',
    registrar: 'MUFG_INTIME',
    leadManagers: ['ICICI Securities', 'Kotak Mahindra Capital'],
    priceBand: [285, 300],
    issueSizeCr: 820,
    ofsCr: 320,
    days: { open: -1, close: 1, allotment: 2, refund: 3, demat: 3, listing: 4 },
    reservation: { qibPct: 50, niiPct: 15, retailPct: 35, employeeQuota: 80_000 },
    finalSubscription: { qib: 96.4, bnii: 61.2, snii: 38.5, retail: 14.8, employee: 6.2 },
  },
  {
    name: 'Sahyadri Agro Foods',
    symbol: 'SAHYADRI',
    isin: 'INE0SA201013',
    board: 'SME',
    status: 'CLOSED',
    industry: 'Food Processing',
    registrar: 'BIGSHARE',
    leadManagers: ['Hem Securities'],
    priceBand: [118, 124],
    issueSizeCr: 42,
    ofsCr: 6,
    days: { open: -3, close: -1, allotment: 0, refund: 1, demat: 1, listing: 2 },
    reservation: { qibPct: 20, niiPct: 30, retailPct: 50 },
    finalSubscription: { qib: 48.1, nii: 212.6, retail: 157.3 },
  },
  {
    name: 'Vardhan Precision Engineering',
    symbol: 'VARDHAN',
    isin: 'INE0VP301014',
    board: 'MAINBOARD',
    status: 'ALLOTMENT',
    industry: 'Auto Components',
    registrar: 'KFIN',
    leadManagers: ['SBI Capital Markets', 'Nuvama Wealth'],
    priceBand: [540, 568],
    issueSizeCr: 1480,
    ofsCr: 980,
    days: { open: -5, close: -3, allotment: -2, refund: -1, demat: -1, listing: 1 },
    reservation: { qibPct: 50, niiPct: 15, retailPct: 35 },
    finalSubscription: { qib: 42.7, bnii: 18.9, snii: 12.4, retail: 4.6 },
  },
  {
    name: 'Kavya Textiles',
    symbol: 'KAVYA',
    isin: 'INE0KT401015',
    board: 'SME',
    status: 'LISTED',
    industry: 'Textiles',
    registrar: 'SKYLINE',
    leadManagers: ['Gretex Corporate Services'],
    priceBand: [128, 128],
    issueSizeCr: 28,
    ofsCr: 0,
    days: { open: -12, close: -10, allotment: -9, refund: -8, demat: -8, listing: -7 },
    reservation: { qibPct: 0, niiPct: 50, retailPct: 50 },
    finalSubscription: { qib: 0, nii: 88.2, retail: 64.9 },
    listing: { openRupees: 152, closeRupees: 159.6 },
  },
  {
    name: 'Orion Fintech',
    symbol: 'ORIONFIN',
    board: 'MAINBOARD',
    status: 'WITHDRAWN',
    industry: 'Financial Services',
    registrar: 'MUFG_INTIME',
    leadManagers: ['Motilal Oswal Investment Advisors'],
    priceBand: [196, 206],
    issueSizeCr: 610,
    ofsCr: 610,
    days: { open: 2, close: 4, allotment: 5, refund: 6, demat: 6, listing: 7 },
    reservation: { qibPct: 75, niiPct: 15, retailPct: 10 },
  },
];

const round2 = (n: number) => Math.round(n * 100) / 100;

/**
 * Half-hourly snapshots, 10:00–17:00 IST on each bidding day, up to `now`.
 * Each category follows its own curve; QIB demand arrives mostly on the last day.
 */
function subscriptionHistory(
  ipoId: string,
  spec: IpoSpec,
  open: Date,
  close: Date,
  now: Date,
): SubscriptionSnapshotInput[] {
  const final = spec.finalSubscription;
  if (!final) return [];

  const slots: Date[] = [];
  for (let day = open; day <= close; day = istDay(day, 1)) {
    for (let half = 20; half <= 34; half++) slots.push(atIst(day, 0, half * 30));
  }

  const { qibPct, niiPct, retailPct } = spec.reservation;
  return slots
    .filter((at) => at <= now)
    .map((at, i) => {
      const p = (i + 1) / slots.length;
      const qib = round2(final.qib * p ** 4);
      const retail = round2(final.retail * p ** 1.5);
      const employee = final.employee === undefined ? undefined : round2(final.employee * p ** 1.5);
      let nii: number;
      let bnii: number | undefined;
      let snii: number | undefined;
      if (final.bnii !== undefined && final.snii !== undefined) {
        bnii = round2(final.bnii * p ** 2.5);
        snii = round2(final.snii * p ** 2.5);
        nii = round2((2 * bnii + snii) / 3); // bNII is two-thirds of the NII book
      } else {
        nii = round2((final.nii ?? 0) * p ** 2.5);
      }
      const total = round2((qib * qibPct + nii * niiPct + retail * retailPct) / (qibPct + niiPct + retailPct));
      return { ipoId, at, qib, nii, bnii, snii, retail, employee, total, source: 'MERGED' as const };
    });
}

export function buildSeedData(now: Date = new Date()): SeedData {
  const ipos: SeedData['ipos'] = [];
  const snapshots: SeedData['snapshots'] = [];
  const aiReports: SeedData['aiReports'] = [];

  for (const spec of SPECS) {
    const _id = new Types.ObjectId().toHexString();
    const [minRupees, maxRupees] = spec.priceBand;
    const maxPaise = rupees(maxRupees);
    // Mainboard lots target about ₹15,000; SME lots about ₹1.3 lakh.
    const lotSize = Math.floor((spec.board === 'SME' ? 130_000 : 15_000) / maxRupees);
    const d = spec.days;
    const dates = {
      open: istDay(now, d.open),
      close: istDay(now, d.close),
      allotment: istDay(now, d.allotment),
      refundInitiation: istDay(now, d.refund),
      dematCredit: istDay(now, d.demat),
      listing: istDay(now, d.listing),
    };
    const slug = `${spec.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-ipo`;
    const history = subscriptionHistory(_id, spec, dates.open, dates.close, now);
    const latest = history.at(-1);

    const ipo = IpoInput.parse({
      slug,
      name: spec.name,
      symbol: spec.symbol,
      isin: spec.isin,
      board: spec.board,
      exchanges: spec.board === 'SME' ? ['NSE'] : ['NSE', 'BSE'],
      issueType: minRupees === maxRupees ? 'FIXED' : 'BOOK_BUILT',
      status: spec.status,
      priceBand: { minPaise: rupees(minRupees), maxPaise },
      lotSize,
      minInvestmentPaise: lotSize * maxPaise,
      issueSizePaise: rupees(spec.issueSizeCr * 1e7),
      freshIssuePaise: rupees((spec.issueSizeCr - spec.ofsCr) * 1e7),
      ofsPaise: rupees(spec.ofsCr * 1e7),
      dates,
      registrar: {
        code: spec.registrar,
        name: REGISTRARS[spec.registrar].name,
        allotmentUrl: REGISTRARS[spec.registrar].allotmentUrl,
      },
      leadManagers: spec.leadManagers,
      industry: spec.industry,
      reservation: spec.reservation,
      documents: { rhpUrl: `https://example.com/docs/${slug}-rhp.pdf` },
      latestSubscription: latest, // parse strips ipoId
      listing: spec.listing && {
        pricePaise: rupees(spec.listing.openRupees),
        openPaise: rupees(spec.listing.openRupees),
        closePaise: rupees(spec.listing.closeRupees),
        gainPct: round2(((spec.listing.openRupees - maxRupees) / maxRupees) * 100),
      },
      sourceRefs: { nse: spec.symbol },
    });

    ipos.push({ ...ipo, _id });
    snapshots.push(...history.map((s) => SubscriptionSnapshotInput.parse(s)));
  }

  // One published report, on the open IPO, so the report screen and route have data.
  const acme = ipos.find((i) => i.status === 'OPEN')!;
  const reportId = new Types.ObjectId().toHexString();
  acme.aiReportId = reportId;
  aiReports.push({
    _id: reportId,
    ...AiReportInput.parse({
      ipoId: acme._id,
      version: 1,
      model: 'seed',
      sourceDocKey: `docs/${acme.slug}-rhp.pdf`,
      reviewedBy: 'seed',
      published: true,
      summary:
        'Acme Industries makes CNC machining centres and spare parts for auto and general engineering customers. ' +
        'Revenue grew steadily over three years with stable margins; part of the issue is an offer for sale by promoters.',
      business: {
        model: 'Manufacture and sale of CNC machines, plus annual service contracts',
        segments: ['Machines', 'Spares and service'],
        customers: 'Auto OEMs and tier-1 suppliers; top 10 customers are 41% of revenue',
      },
      financials: [
        { fy: 'FY24', revenueCr: 612.4, ebitdaCr: 98.1, patCr: 54.3, netWorthCr: 402.7, debtCr: 88.5, roePct: 13.5, rocePct: 17.2 },
        { fy: 'FY25', revenueCr: 731.9, ebitdaCr: 121.6, patCr: 68.9, netWorthCr: 469.8, debtCr: 74.2, roePct: 14.7, rocePct: 18.9 },
        { fy: 'FY26', revenueCr: 868.2, ebitdaCr: 147.0, patCr: 85.6, netWorthCr: 553.1, debtCr: 61.0, roePct: 15.5, rocePct: 20.1 },
      ],
      valuation: {
        postIssuePe: 31.4,
        peerPe: [
          { name: 'Peer Machine Tools Ltd', pe: 38.2 },
          { name: 'Precision Systems Ltd', pe: 29.6 },
        ],
        marketCapCr: 2690,
      },
      pros: [
        { text: 'Revenue grew at a 19% CAGR from FY24 to FY26', evidence: { page: 212, quote: 'Revenue from operations increased to ₹868.2 crore' } },
        { text: 'Debt reduced in each of the last three years', evidence: { page: 230, quote: 'Total borrowings stood at ₹61.0 crore' } },
      ],
      cons: [
        { text: '39% of the issue is an offer for sale, which does not fund the business', evidence: { page: 88, quote: 'Offer for Sale of up to ₹320 crore' } },
        { text: 'Top 10 customers make up 41% of revenue', evidence: { page: 34, quote: 'our top ten customers contributed 41.2%' } },
      ],
      risks: [
        { text: 'Demand is tied to the auto sector capex cycle', evidence: { page: 31, quote: 'A slowdown in the automotive industry' } },
      ],
      score: { total: 61, breakdown: { growth: 14, profitability: 13, balanceSheet: 11, valuation: 12, governance: 11 } },
      disclaimerVersion: '2026-10-v1',
    }),
  });

  return { ipos, snapshots, aiReports };
}
