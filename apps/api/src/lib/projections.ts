import { IpoCard } from '@ipolens/shared';

/** Mongo projection for the fields of an IPO list card. */
export const CARD_PROJECTION = Object.fromEntries(Object.keys(IpoCard.shape).map((k) => [k, 1]));
