import { z } from 'zod';
import { AlertType, AllotmentResult, ApplicationCategory, DevicePlatform } from '../enums';
import { ObjectIdString, Timestamp } from './common';

// ---------- users ----------
export const FcmToken = z.object({
  token: z.string().min(1),
  platform: DevicePlatform,
  updatedAt: Timestamp,
});

export const UserInput = z.object({
  firebaseUid: z.string().min(1),
  phone: z.string().regex(/^\+\d{8,15}$/, 'Use E.164, e.g. +919876543210').optional(),
  email: z.string().email().optional(),
  fcmTokens: z.array(FcmToken),
});
export type UserInput = z.infer<typeof UserInput>;

export const User = UserInput.extend({ _id: ObjectIdString, createdAt: Timestamp });
export type User = z.infer<typeof User>;

// ---------- pans ----------
// Format: 5 letters, 4 digits, 1 letter (e.g. ABCDE1234F).
export const PAN_REGEX = /^[A-Z]{5}\d{4}[A-Z]$/;
export const PanNumber = z.string().toUpperCase().regex(PAN_REGEX, 'Invalid PAN');

export const PanLabel = z.string().trim().min(1).max(30);

// Stored form. panEnc is AES-256-GCM ciphertext, panHash an HMAC used for de-duplication.
export const PanRecordInput = z.object({
  userId: ObjectIdString,
  label: PanLabel,
  panEnc: z.string().min(1),
  panLast4: z.string().regex(/^\d{3}[A-Z]$/, 'Last 4 chars of a PAN'),
  panHash: z.string().min(1),
});
export type PanRecordInput = z.infer<typeof PanRecordInput>;

export const PanRecord = PanRecordInput.extend({ _id: ObjectIdString, createdAt: Timestamp });
export type PanRecord = z.infer<typeof PanRecord>;

// The only shape the API returns for a saved PAN outside /reveal.
export const PanPublic = PanRecord.pick({ _id: true, label: true, panLast4: true, createdAt: true });
export type PanPublic = z.infer<typeof PanPublic>;

// ---------- applications ("My IPOs") ----------
export const ApplicationInput = z
  .object({
    userId: ObjectIdString,
    ipoId: ObjectIdString,
    panId: ObjectIdString,
    category: ApplicationCategory,
    lots: z.number().int().positive(),
    allotment: AllotmentResult.default('UNKNOWN'),
    sharesAllotted: z.number().int().positive().optional(),
    markedAt: Timestamp,
  })
  .refine((a) => a.sharesAllotted === undefined || a.allotment === 'ALLOTTED', {
    message: 'sharesAllotted is only set when allotment is ALLOTTED',
    path: ['sharesAllotted'],
  });
export type ApplicationInput = z.infer<typeof ApplicationInput>;

export const Application = ApplicationInput.and(z.object({ _id: ObjectIdString }));
export type Application = z.infer<typeof Application>;

// ---------- alertSubscriptions ----------
// No ipoId means a global preference (e.g. NEW_IPO for every new mainboard issue).
export const AlertSubscriptionInput = z.object({
  userId: ObjectIdString,
  ipoId: ObjectIdString.optional(),
  type: AlertType,
  enabled: z.boolean(),
});
export type AlertSubscriptionInput = z.infer<typeof AlertSubscriptionInput>;

export const AlertSubscription = AlertSubscriptionInput.extend({ _id: ObjectIdString });
export type AlertSubscription = z.infer<typeof AlertSubscription>;
