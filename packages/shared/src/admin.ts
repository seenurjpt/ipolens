import { z } from 'zod';
import { IpoStatus } from './enums';
import { JobName } from './jobs';
import { AiReport } from './schemas/ai-report';
import { ObjectIdString, Timestamp } from './schemas/common';
import { Ipo, IpoInput } from './schemas/ipo';

// Request and response shapes for /v1/admin (SPEC: Backend API routes, Admin).

const withAsOf = <T extends z.ZodRawShape>(shape: T) => z.object({ ...shape, asOf: Timestamp });

export const IdParams = z.object({ id: ObjectIdString });

// ---------- summary ----------
export const AdminSummaryResponse = withAsOf({
  ipoCounts: z.record(IpoStatus, z.number().int()),
  pendingReports: z.number().int(),
});
export type AdminSummaryResponse = z.infer<typeof AdminSummaryResponse>;

// ---------- IPOs ----------
export const ReportState = z.enum(['NONE', 'PENDING', 'PUBLISHED']);
export type ReportState = z.infer<typeof ReportState>;

export const AdminIpoListQuery = z.object({
  status: z
    .string()
    .transform((s) => s.split(',').map((v) => v.trim()))
    .pipe(z.array(IpoStatus).min(1))
    .optional(),
  q: z.string().trim().min(1).max(60).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
});
export type AdminIpoListQuery = z.infer<typeof AdminIpoListQuery>;

export const AdminIpoRow = Ipo.extend({ reportState: ReportState });
export type AdminIpoRow = z.infer<typeof AdminIpoRow>;

export const AdminIpoListResponse = withAsOf({
  items: z.array(AdminIpoRow),
  page: z.number().int(),
  pageSize: z.number().int(),
  total: z.number().int(),
});
export type AdminIpoListResponse = z.infer<typeof AdminIpoListResponse>;

export const AdminIpoResponse = withAsOf({ ipo: Ipo });
export type AdminIpoResponse = z.infer<typeof AdminIpoResponse>;

/**
 * Editable IPO fields, all optional. Nested objects (dates, priceBand, registrar, reservation,
 * documents, listing) replace the stored object whole. Subscription and the report link are
 * owned by jobs and cannot be edited here; minInvestmentPaise is derived from lot and band.
 */
export const IpoPatch = IpoInput.omit({ latestSubscription: true, aiReportId: true, minInvestmentPaise: true })
  .partial()
  .strict()
  .refine((p) => Object.keys(p).length > 0, { message: 'Nothing to update' });
export type IpoPatch = z.infer<typeof IpoPatch>;

// ---------- reports ----------
const IpoRef = Ipo.pick({ _id: true, name: true, slug: true });

export const AdminReportListQuery = z.object({
  published: z.enum(['true', 'false']).transform((v) => v === 'true').optional(),
});

export const AdminReportRow = AiReport.pick({
  _id: true,
  ipoId: true,
  version: true,
  model: true,
  published: true,
  reviewedBy: true,
  createdAt: true,
}).extend({ scoreTotal: z.number(), ipo: IpoRef.nullable() });
export type AdminReportRow = z.infer<typeof AdminReportRow>;

export const AdminReportListResponse = withAsOf({ items: z.array(AdminReportRow) });
export type AdminReportListResponse = z.infer<typeof AdminReportListResponse>;

export const AdminReportResponse = withAsOf({
  report: AiReport,
  ipo: Ipo.pick({ _id: true, name: true, slug: true, status: true, documents: true }).nullable(),
});
export type AdminReportResponse = z.infer<typeof AdminReportResponse>;

export const PublishReportBody = z.object({
  published: z.boolean(),
  reviewedBy: z.string().trim().min(1).max(60),
});
export type PublishReportBody = z.infer<typeof PublishReportBody>;

// ---------- jobs ----------
export const JobParams = z.object({ name: JobName });

export const TriggerJobBody = z.object({ ipoId: ObjectIdString.optional() }).default({});
export type TriggerJobBody = z.infer<typeof TriggerJobBody>;

export const TriggerJobResponse = withAsOf({ jobId: z.string() });
export type TriggerJobResponse = z.infer<typeof TriggerJobResponse>;

export const JobRun = z.object({
  id: z.string(),
  name: z.string(),
  state: z.string(),
  ipoId: z.string().optional(),
  createdAt: Timestamp,
  finishedAt: Timestamp.optional(),
  failedReason: z.string().optional(),
});
export type JobRun = z.infer<typeof JobRun>;

export const JobRunsResponse = withAsOf({
  counts: z.record(z.string(), z.number().int()),
  runs: z.array(JobRun),
});
export type JobRunsResponse = z.infer<typeof JobRunsResponse>;
