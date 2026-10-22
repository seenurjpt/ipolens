import { z } from 'zod';

export const Board = z.enum(['MAINBOARD', 'SME']);
export type Board = z.infer<typeof Board>;

export const Exchange = z.enum(['NSE', 'BSE']);
export type Exchange = z.infer<typeof Exchange>;

export const IssueType = z.enum(['BOOK_BUILT', 'FIXED']);
export type IssueType = z.infer<typeof IssueType>;

export const IpoStatus = z.enum(['UPCOMING', 'OPEN', 'CLOSED', 'ALLOTMENT', 'LISTED', 'WITHDRAWN']);
export type IpoStatus = z.infer<typeof IpoStatus>;

export const SubscriptionSource = z.enum(['NSE', 'BSE', 'MERGED']);
export type SubscriptionSource = z.infer<typeof SubscriptionSource>;

export const ApplicationCategory = z.enum(['RETAIL', 'SHNI', 'BHNI', 'EMPLOYEE', 'SHAREHOLDER']);
export type ApplicationCategory = z.infer<typeof ApplicationCategory>;

export const AllotmentResult = z.enum(['UNKNOWN', 'ALLOTTED', 'NOT_ALLOTTED']);
export type AllotmentResult = z.infer<typeof AllotmentResult>;

export const AlertType = z.enum(['OPEN', 'LAST_DAY', 'ALLOTMENT_OUT', 'LISTING', 'SUB_MILESTONE', 'NEW_IPO']);
export type AlertType = z.infer<typeof AlertType>;

export const DevicePlatform = z.enum(['android', 'ios', 'web']);
export type DevicePlatform = z.infer<typeof DevicePlatform>;
