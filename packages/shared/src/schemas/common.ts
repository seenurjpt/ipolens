import { z } from 'zod';

// A MongoDB ObjectId as it crosses the wire: 24 hex chars.
export const ObjectIdString = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid ObjectId');

// All money is stored in paise as integers (SPEC: Data model).
export const Paise = z.number().int().nonnegative();

// Timestamps are stored in UTC and rendered in IST by clients.
export const Timestamp = z.coerce.date();

export const Percent = z.number().min(0).max(100);

export const Slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be kebab-case');

/** Adds the fields every stored document carries. */
export const withDocMeta = <T extends z.ZodRawShape>(shape: z.ZodObject<T>) =>
  shape.extend({ _id: ObjectIdString, createdAt: Timestamp, updatedAt: Timestamp });
