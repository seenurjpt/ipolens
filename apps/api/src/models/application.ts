import { AllotmentResult, ApplicationCategory, COLLECTIONS, type Application } from '@ipolens/shared';
import mongoose, { Schema, model, type Model } from 'mongoose';
import type { Stored } from './helpers';

export type ApplicationDoc = Stored<Application, 'userId' | 'ipoId' | 'panId'>;

const applicationSchema = new Schema<ApplicationDoc>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  ipoId: { type: Schema.Types.ObjectId, ref: 'Ipo', required: true },
  panId: { type: Schema.Types.ObjectId, ref: 'Pan', required: true },
  category: { type: String, enum: ApplicationCategory.options, required: true },
  lots: { type: Number, required: true, min: 1 },
  allotment: { type: String, enum: AllotmentResult.options, required: true, default: 'UNKNOWN' },
  sharesAllotted: { type: Number, min: 1 },
  markedAt: { type: Date, required: true, default: () => new Date() },
});

applicationSchema.index({ userId: 1, ipoId: 1, panId: 1 }, { unique: true });
// "Allotment out" fan-out finds every applicant of one IPO.
applicationSchema.index({ ipoId: 1 });

export const ApplicationModel =
  (mongoose.models.Application as Model<ApplicationDoc> | undefined) ??
  model<ApplicationDoc>('Application', applicationSchema, COLLECTIONS.applications);
