// Zod schemas, TS types, enums and constants shared by api, worker, mobile and admin.
export * from './enums';
export * from './registrars';
export * from './schemas/common';
export * from './schemas/subscription';
export * from './schemas/ipo';
export * from './schemas/ai-report';
export * from './schemas/user';
export * from './api';

/** Redis key holding the latest subscription snapshot (JSON SubscriptionFigures) of an IPO. */
export const subscriptionCacheKey = (ipoId: string) => `sub:${ipoId}`;

// MongoDB collection names (SPEC: Data model).
export const COLLECTIONS = {
  ipos: 'ipos',
  subscriptionSnapshots: 'subscriptionSnapshots',
  aiReports: 'aiReports',
  users: 'users',
  pans: 'pans',
  applications: 'applications',
  alertSubscriptions: 'alertSubscriptions',
} as const;
