import { z } from 'zod';
import { Board, IpoStatus } from './enums';
import { RegistrarCode } from './registrars';
import { Timestamp } from './schemas/common';
import { AiReport } from './schemas/ai-report';
import { Ipo } from './schemas/ipo';
import { SubscriptionFigures } from './schemas/subscription';

// Request and response shapes for the /v1 API (SPEC: Backend API routes).
// Every response carries asOf so the app can show "Updated 3 min ago".

const withAsOf = <T extends z.ZodRawShape>(shape: T) => z.object({ ...shape, asOf: Timestamp });

export const ErrorResponse = z.object({ error: z.string(), message: z.string() });
export type ErrorResponse = z.infer<typeof ErrorResponse>;

// ---------- GET /v1/ipos ----------
export const IpoSort = z.enum(['closeAsc', 'closeDesc', 'openAsc', 'openDesc', 'listingDesc']);
export type IpoSort = z.infer<typeof IpoSort>;

export const IpoListQuery = z.object({
  // One status or a comma-separated list, e.g. "CLOSED,ALLOTMENT".
  status: z
    .string()
    .transform((s) => s.split(',').map((v) => v.trim()))
    .pipe(z.array(IpoStatus).min(1))
    .optional(),
  board: Board.optional(),
  q: z.string().trim().min(1).max(60).optional(), // name or symbol search
  sort: IpoSort.default('closeAsc'),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
});
export type IpoListQuery = z.infer<typeof IpoListQuery>;

export const IpoCard = Ipo.pick({
  _id: true,
  slug: true,
  name: true,
  symbol: true,
  board: true,
  status: true,
  logoUrl: true,
  priceBand: true,
  lotSize: true,
  minInvestmentPaise: true,
  issueSizePaise: true,
  dates: true,
  latestSubscription: true,
  listing: true,
});
export type IpoCard = z.infer<typeof IpoCard>;

export const IpoListResponse = withAsOf({
  items: z.array(IpoCard),
  page: z.number().int(),
  pageSize: z.number().int(),
  total: z.number().int(),
});
export type IpoListResponse = z.infer<typeof IpoListResponse>;

// ---------- GET /v1/ipos/:slug ----------
export const SlugParams = z.object({ slug: z.string().min(1).max(120) });

export const IpoDetailResponse = withAsOf({ ipo: Ipo });
export type IpoDetailResponse = z.infer<typeof IpoDetailResponse>;

// ---------- GET /v1/ipos/:slug/subscription ----------
export const SubscriptionResponse = withAsOf({
  latest: SubscriptionFigures.nullable(),
  history: z.array(SubscriptionFigures),
});
export type SubscriptionResponse = z.infer<typeof SubscriptionResponse>;

// ---------- GET /v1/ipos/:slug/report ----------
export const ReportResponse = withAsOf({ report: AiReport });
export type ReportResponse = z.infer<typeof ReportResponse>;

// ---------- GET /v1/calendar ----------
export const CalendarQuery = z
  .object({ from: z.coerce.date().optional(), to: z.coerce.date().optional() })
  .refine((q) => !q.from || !q.to || q.from <= q.to, { message: 'from must be on or before to' });

export const CalendarEventType = z.enum(['OPEN', 'CLOSE', 'ALLOTMENT', 'LISTING']);
export type CalendarEventType = z.infer<typeof CalendarEventType>;

export const CalendarEvent = z.object({
  type: CalendarEventType,
  date: Timestamp,
  ipo: Ipo.pick({ _id: true, slug: true, name: true, board: true, status: true }),
});
export type CalendarEvent = z.infer<typeof CalendarEvent>;

export const CalendarResponse = withAsOf({ from: Timestamp, to: Timestamp, events: z.array(CalendarEvent) });
export type CalendarResponse = z.infer<typeof CalendarResponse>;

// ---------- GET /v1/listings/recent ----------
export const RecentListingsQuery = z.object({ limit: z.coerce.number().int().min(1).max(50).default(20) });

export const RecentListing = IpoCard.required({ listing: true });
export const RecentListingsResponse = withAsOf({ items: z.array(RecentListing) });
export type RecentListingsResponse = z.infer<typeof RecentListingsResponse>;

// ---------- GET /v1/registrars/:code ----------
export const RegistrarParams = z.object({ code: RegistrarCode });

export const RegistrarResponse = withAsOf({
  registrar: z.object({
    code: RegistrarCode,
    name: z.string(),
    allotmentUrl: z.string().url(),
    allowedHosts: z.array(z.string()),
    panFieldSelector: z.string().optional(),
  }),
});
export type RegistrarResponse = z.infer<typeof RegistrarResponse>;
