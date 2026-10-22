import { COLLECTIONS, SCORE_WEIGHTS, type AiReport } from '@ipolens/shared';
import mongoose, { Schema, model, type Model } from 'mongoose';
import type { Stored } from './helpers';

export type AiReportDoc = Stored<AiReport, 'ipoId'>;

const evidencedPoint = new Schema(
  {
    text: { type: String, required: true },
    evidence: {
      page: { type: Number, required: true, min: 1 },
      quote: { type: String, required: true },
    },
  },
  { _id: false },
);

const financialYear = new Schema(
  {
    fy: { type: String, required: true, match: /^FY\d{2}$/ },
    revenueCr: { type: Number, required: true },
    ebitdaCr: { type: Number, required: true },
    patCr: { type: Number, required: true },
    netWorthCr: { type: Number, required: true },
    debtCr: { type: Number, required: true, min: 0 },
    roePct: { type: Number, required: true },
    rocePct: { type: Number, required: true },
  },
  { _id: false },
);

const points = (max: number, required = true) => ({ type: Number, required, min: 0, max });

const aiReportSchema = new Schema<AiReportDoc>(
  {
    ipoId: { type: Schema.Types.ObjectId, ref: 'Ipo', required: true },
    version: { type: Number, required: true, min: 1 },
    model: { type: String, required: true },
    sourceDocKey: { type: String, required: true },
    reviewedBy: String,
    published: { type: Boolean, required: true, default: false },
    summary: { type: String, required: true },
    business: {
      model: { type: String, required: true },
      segments: { type: [String], default: [] },
      customers: String,
    },
    financials: { type: [financialYear], default: [] },
    valuation: {
      postIssuePe: Number,
      peerPe: {
        type: [new Schema({ name: { type: String, required: true }, pe: { type: Number, required: true } }, { _id: false })],
        default: [],
      },
      marketCapCr: { type: Number, required: true, min: 0 },
    },
    pros: { type: [evidencedPoint], default: [] },
    cons: { type: [evidencedPoint], default: [] },
    risks: { type: [evidencedPoint], default: [] },
    score: {
      total: { type: Number, required: true, min: 0, max: 100 },
      breakdown: {
        growth: points(SCORE_WEIGHTS.growth),
        profitability: points(SCORE_WEIGHTS.profitability),
        balanceSheet: points(SCORE_WEIGHTS.balanceSheet),
        valuation: points(SCORE_WEIGHTS.valuation),
        governance: points(SCORE_WEIGHTS.governance),
        subscriptionSignal: points(SCORE_WEIGHTS.subscriptionSignal, false),
      },
    },
    disclaimerVersion: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

// Old versions are kept when a report is re-scored (SPEC: AI analysis pipeline > Refresh).
aiReportSchema.index({ ipoId: 1, version: -1 }, { unique: true });

export const AiReportModel =
  (mongoose.models.AiReport as Model<AiReportDoc> | undefined) ??
  model<AiReportDoc>('AiReport', aiReportSchema, COLLECTIONS.aiReports);
