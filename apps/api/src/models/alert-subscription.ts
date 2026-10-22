import { AlertType, COLLECTIONS, type AlertSubscription } from '@ipolens/shared';
import mongoose, { Schema, model, type Model } from 'mongoose';
import type { Stored } from './helpers';

export type AlertSubscriptionDoc = Stored<AlertSubscription, 'userId' | 'ipoId'>;

const alertSubscriptionSchema = new Schema<AlertSubscriptionDoc>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  // Absent for a global preference, set for a per-IPO one.
  ipoId: { type: Schema.Types.ObjectId, ref: 'Ipo' },
  type: { type: String, enum: AlertType.options, required: true },
  enabled: { type: Boolean, required: true, default: true },
});

alertSubscriptionSchema.index({ userId: 1, ipoId: 1, type: 1 }, { unique: true });
// Notification fan-out: who wants this alert for this IPO.
alertSubscriptionSchema.index({ ipoId: 1, type: 1, enabled: 1 });

export const AlertSubscriptionModel =
  (mongoose.models.AlertSubscription as Model<AlertSubscriptionDoc> | undefined) ??
  model<AlertSubscriptionDoc>('AlertSubscription', alertSubscriptionSchema, COLLECTIONS.alertSubscriptions);
