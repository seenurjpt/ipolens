import { z } from 'zod';
import { Board, Exchange, IpoStatus, IssueType } from '../enums';
import { RegistrarCode } from '../registrars';
import { ObjectIdString, Paise, Percent, Slug, Timestamp, withDocMeta } from './common';
import { SubscriptionFigures } from './subscription';

export const PriceBand = z
  .object({ minPaise: Paise, maxPaise: Paise })
  .refine((b) => b.minPaise <= b.maxPaise, { message: 'minPaise must be <= maxPaise' });

// Dates are optional because an IPO is often announced before its schedule is fixed.
export const IpoDates = z.object({
  open: Timestamp.optional(),
  close: Timestamp.optional(),
  allotment: Timestamp.optional(),
  refundInitiation: Timestamp.optional(),
  dematCredit: Timestamp.optional(),
  listing: Timestamp.optional(),
});

export const Registrar = z.object({
  code: RegistrarCode,
  name: z.string().min(1),
  allotmentUrl: z.string().url(),
});

// Quotas are share counts reserved for that category.
export const Reservation = z.object({
  qibPct: Percent,
  niiPct: Percent,
  retailPct: Percent,
  employeeQuota: z.number().int().nonnegative().optional(),
  shareholderQuota: z.number().int().nonnegative().optional(),
});

export const IpoDocuments = z.object({
  drhpUrl: z.string().url().optional(),
  rhpUrl: z.string().url().optional(),
  storedPdfKey: z.string().optional(),
});

export const ListingResult = z.object({
  pricePaise: Paise,
  openPaise: Paise,
  closePaise: Paise.optional(), // filled at the close snapshot
  gainPct: z.number(),
});

export const IpoInput = z.object({
  slug: Slug,
  name: z.string().min(1),
  symbol: z.string().min(1),
  isin: z.string().regex(/^IN[A-Z0-9]{9}\d$/, 'Invalid Indian ISIN').optional(),
  board: Board,
  exchanges: z.array(Exchange).min(1),
  issueType: IssueType,
  status: IpoStatus,
  priceBand: PriceBand,
  lotSize: z.number().int().positive(),
  minInvestmentPaise: Paise,
  issueSizePaise: Paise,
  freshIssuePaise: Paise,
  ofsPaise: Paise,
  dates: IpoDates,
  registrar: Registrar,
  leadManagers: z.array(z.string().min(1)),
  industry: z.string().min(1),
  logoUrl: z.string().url().optional(),
  reservation: Reservation,
  documents: IpoDocuments,
  latestSubscription: SubscriptionFigures.optional(),
  listing: ListingResult.optional(),
  aiReportId: ObjectIdString.optional(),
  sourceRefs: z.object({ nse: z.string().optional(), bse: z.string().optional() }),
});
export type IpoInput = z.infer<typeof IpoInput>;

export const Ipo = withDocMeta(IpoInput);
export type Ipo = z.infer<typeof Ipo>;
