import type { ApplicationCategory, Ipo } from '@ipolens/shared';

import type { Application } from './store';

export const CATEGORY_LABELS: Record<ApplicationCategory, string> = {
  RETAIL: 'Retail',
  SHNI: 'Small HNI (sNII)',
  BHNI: 'Big HNI (bNII)',
  EMPLOYEE: 'Employee',
  SHAREHOLDER: 'Shareholder',
};

/** Retail bids are capped at ₹2 lakh per PAN; sHNI at ₹10 lakh. */
const CATEGORY_LIMIT_PAISE: Partial<Record<ApplicationCategory, number>> = {
  RETAIL: 2_00_000_00,
  EMPLOYEE: 5_00_000_00,
  SHAREHOLDER: 2_00_000_00,
  SHNI: 10_00_000_00,
};

/** The most lots one PAN can bid in a category at the upper price band. */
export function maxLots(ipo: Pick<Ipo, 'lotSize' | 'priceBand'>, category: ApplicationCategory): number {
  const limit = CATEGORY_LIMIT_PAISE[category];
  const lotPaise = ipo.lotSize * ipo.priceBand.maxPaise;
  return limit ? Math.max(1, Math.floor(limit / lotPaise)) : 500;
}

/** Shares used for listing P&L: what the user reported, else one lot. */
export const allottedShares = (app: Application, ipo: Pick<Ipo, 'lotSize'>) => app.sharesAllotted ?? ipo.lotSize;

/**
 * Listing-day gain or loss in paise at the listing price, against the upper price band.
 * Null until the IPO has listed and the user is allotted.
 */
export function listingPnlPaise(app: Application, ipo: Ipo): number | null {
  if (!ipo.listing || app.allotment !== 'ALLOTTED') return null;
  return (ipo.listing.pricePaise - ipo.priceBand.maxPaise) * allottedShares(app, ipo);
}

/** Allotment is out but the user has not recorded their result yet. */
export const awaitsAllotmentCheck = (app: Application, ipo: Ipo) =>
  app.allotment === 'UNKNOWN' && (ipo.status === 'ALLOTMENT' || ipo.status === 'LISTED');

export const canCheckAllotment = (ipo: Pick<Ipo, 'status'>) =>
  ipo.status === 'CLOSED' || ipo.status === 'ALLOTMENT' || ipo.status === 'LISTED';

export const canMarkApplied = (ipo: Pick<Ipo, 'status'>) => ipo.status !== 'UPCOMING' && ipo.status !== 'WITHDRAWN';
