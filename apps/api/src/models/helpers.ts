import type { Types } from 'mongoose';

/**
 * A shared Zod type as Mongoose stores it: `_id` is dropped (Mongoose adds it) and the
 * listed reference fields become ObjectIds, keeping their optionality.
 */
export type Stored<T, Refs extends keyof T = never> = Omit<T, '_id' | Refs> & {
  [K in keyof Pick<T, Refs>]: undefined extends T[K] ? Types.ObjectId | undefined : Types.ObjectId;
};

const isInteger = { validator: Number.isInteger, message: '{PATH} must be an integer number of paise' };

/** Money in paise as a non-negative integer (SPEC: Data model). */
export const paise = { type: Number, required: true, min: 0, validate: isInteger } as const;
export const optionalPaise = { type: Number, min: 0, validate: isInteger } as const;

/** Subscription multiple, e.g. 12.4 (times subscribed). */
export const multiple = { type: Number, required: true, min: 0 } as const;
export const optionalMultiple = { type: Number, min: 0 } as const;
