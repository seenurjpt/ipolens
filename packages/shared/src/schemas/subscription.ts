import { z } from 'zod';
import { SubscriptionSource } from '../enums';
import { ObjectIdString, Timestamp } from './common';

const Multiple = z.number().nonnegative(); // times subscribed, e.g. 12.4

// Category-wise subscription at one point in time. Embedded in ipos.latestSubscription.
// bNII/sNII are absent for SME issues, where NII is not split.
export const SubscriptionFigures = z.object({
  at: Timestamp,
  qib: Multiple,
  nii: Multiple,
  bnii: Multiple.optional(),
  snii: Multiple.optional(),
  retail: Multiple,
  employee: Multiple.optional(),
  total: Multiple,
  source: SubscriptionSource,
});
export type SubscriptionFigures = z.infer<typeof SubscriptionFigures>;

// subscriptionSnapshots collection (time series for the history chart)
export const SubscriptionSnapshotInput = SubscriptionFigures.extend({ ipoId: ObjectIdString });
export type SubscriptionSnapshotInput = z.infer<typeof SubscriptionSnapshotInput>;

export const SubscriptionSnapshot = SubscriptionSnapshotInput.extend({ _id: ObjectIdString });
export type SubscriptionSnapshot = z.infer<typeof SubscriptionSnapshot>;
