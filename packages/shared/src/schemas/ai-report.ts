import { z } from 'zod';
import { ObjectIdString, Timestamp } from './common';

// Points per score dimension (SPEC: AI analysis pipeline > Score).
export const SCORE_WEIGHTS = {
  growth: 20,
  profitability: 20,
  balanceSheet: 15,
  valuation: 20,
  governance: 15,
  subscriptionSignal: 10,
} as const;

const points = (max: number) => z.number().min(0).max(max);

export const ScoreBreakdown = z.object({
  growth: points(SCORE_WEIGHTS.growth),
  profitability: points(SCORE_WEIGHTS.profitability),
  balanceSheet: points(SCORE_WEIGHTS.balanceSheet),
  valuation: points(SCORE_WEIGHTS.valuation),
  governance: points(SCORE_WEIGHTS.governance),
  // Filled after subscription closes; absent on the first version of a report.
  subscriptionSignal: points(SCORE_WEIGHTS.subscriptionSignal).optional(),
});

export const Score = z
  .object({ total: z.number().int().min(0).max(100), breakdown: ScoreBreakdown })
  .refine(
    ({ total, breakdown }) =>
      Math.round(Object.values(breakdown).reduce<number>((sum, v) => sum + (v ?? 0), 0)) === total,
    { message: 'total must equal the rounded sum of the breakdown' },
  );

export const Evidence = z.object({ page: z.number().int().positive(), quote: z.string().min(1) });

export const EvidencedPoint = z.object({ text: z.string().min(1), evidence: Evidence });

// Figures in crore, as disclosed in the DRHP/RHP. PAT, net worth and returns can be negative.
export const FinancialYear = z.object({
  fy: z.string().regex(/^FY\d{2}$/, 'Use the FY24 form'),
  revenueCr: z.number(),
  ebitdaCr: z.number(),
  patCr: z.number(),
  netWorthCr: z.number(),
  debtCr: z.number().nonnegative(),
  roePct: z.number(),
  rocePct: z.number(),
});

export const AiReportInput = z.object({
  ipoId: ObjectIdString,
  version: z.number().int().positive(),
  model: z.string().min(1),
  sourceDocKey: z.string().min(1),
  reviewedBy: z.string().optional(),
  published: z.boolean(),
  summary: z.string().min(1),
  business: z.object({
    model: z.string().min(1),
    segments: z.array(z.string().min(1)),
    customers: z.string().optional(),
  }),
  financials: z.array(FinancialYear),
  valuation: z.object({
    postIssuePe: z.number().optional(),
    peerPe: z.array(z.object({ name: z.string().min(1), pe: z.number() })),
    marketCapCr: z.number().nonnegative(),
  }),
  pros: z.array(EvidencedPoint),
  cons: z.array(EvidencedPoint),
  risks: z.array(EvidencedPoint),
  score: Score,
  disclaimerVersion: z.string().min(1),
});
export type AiReportInput = z.infer<typeof AiReportInput>;

export const AiReport = AiReportInput.extend({ _id: ObjectIdString, createdAt: Timestamp });
export type AiReport = z.infer<typeof AiReport>;
