import { COLLECTIONS, SubscriptionSource, type SubscriptionSnapshot } from '@ipolens/shared';
import mongoose, { Schema, model, type Model } from 'mongoose';
import { multiple, optionalMultiple, type Stored } from './helpers';

export type SubscriptionSnapshotDoc = Stored<SubscriptionSnapshot, 'ipoId'>;

// Category multiples, shared with the denormalised ipos.latestSubscription.
export const subscriptionFiguresDefinition = {
  at: { type: Date, required: true },
  qib: multiple,
  nii: multiple,
  bnii: optionalMultiple,
  snii: optionalMultiple,
  retail: multiple,
  employee: optionalMultiple,
  total: multiple,
  source: { type: String, enum: SubscriptionSource.options, required: true },
};

const subscriptionSnapshotSchema = new Schema<SubscriptionSnapshotDoc>({
  ipoId: { type: Schema.Types.ObjectId, ref: 'Ipo', required: true },
  ...subscriptionFiguresDefinition,
});

subscriptionSnapshotSchema.index({ ipoId: 1, at: -1 });

export const SubscriptionSnapshotModel =
  (mongoose.models.SubscriptionSnapshot as Model<SubscriptionSnapshotDoc> | undefined) ??
  model<SubscriptionSnapshotDoc>('SubscriptionSnapshot', subscriptionSnapshotSchema, COLLECTIONS.subscriptionSnapshots);
