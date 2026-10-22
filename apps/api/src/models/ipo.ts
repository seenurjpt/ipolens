import { Board, COLLECTIONS, Exchange, IpoStatus, IssueType, RegistrarCode, type Ipo } from '@ipolens/shared';
import mongoose, { Schema, model, type Model } from 'mongoose';
import { optionalPaise, paise, type Stored } from './helpers';
import { subscriptionFiguresDefinition } from './subscription-snapshot';

export type IpoDoc = Stored<Ipo, 'aiReportId'>;

const percent = { type: Number, required: true, min: 0, max: 100 } as const;

const ipoSchema = new Schema<IpoDoc>(
  {
    slug: { type: String, required: true },
    name: { type: String, required: true },
    symbol: { type: String, required: true },
    isin: String,
    board: { type: String, enum: Board.options, required: true },
    exchanges: { type: [{ type: String, enum: Exchange.options }], required: true },
    issueType: { type: String, enum: IssueType.options, required: true },
    status: { type: String, enum: IpoStatus.options, required: true },
    priceBand: {
      minPaise: paise,
      maxPaise: paise,
    },
    lotSize: { type: Number, required: true, min: 1 },
    minInvestmentPaise: paise,
    issueSizePaise: paise,
    freshIssuePaise: paise,
    ofsPaise: paise,
    dates: {
      open: Date,
      close: Date,
      allotment: Date,
      refundInitiation: Date,
      dematCredit: Date,
      listing: Date,
    },
    registrar: {
      code: { type: String, enum: RegistrarCode.options, required: true },
      name: { type: String, required: true },
      allotmentUrl: { type: String, required: true },
    },
    leadManagers: { type: [String], default: [] },
    industry: { type: String, required: true },
    logoUrl: String,
    reservation: {
      qibPct: percent,
      niiPct: percent,
      retailPct: percent,
      employeeQuota: { type: Number, min: 0 },
      shareholderQuota: { type: Number, min: 0 },
    },
    documents: {
      drhpUrl: String,
      rhpUrl: String,
      storedPdfKey: String,
    },
    latestSubscription: { type: new Schema(subscriptionFiguresDefinition, { _id: false }), required: false },
    listing: {
      type: new Schema(
        { pricePaise: paise, openPaise: paise, closePaise: optionalPaise, gainPct: { type: Number, required: true } },
        { _id: false },
      ),
      required: false,
    },
    aiReportId: { type: Schema.Types.ObjectId, ref: 'AiReport' },
    sourceRefs: { nse: String, bse: String },
  },
  { timestamps: true },
);

ipoSchema.index({ slug: 1 }, { unique: true });
ipoSchema.index({ status: 1, 'dates.close': 1 });
ipoSchema.index({ board: 1, status: 1 });

export const IpoModel = (mongoose.models.Ipo as Model<IpoDoc> | undefined) ?? model<IpoDoc>('Ipo', ipoSchema, COLLECTIONS.ipos);
