import { Types } from 'mongoose';

type Plain<T> = T extends Types.ObjectId
  ? string
  : T extends Date
    ? Date
    : T extends (infer U)[]
      ? Plain<U>[]
      : T extends object
        ? { [K in keyof T]: Plain<T[K]> }
        : T;

/**
 * Turns a lean Mongoose document into the wire shape of the shared Zod schemas:
 * ObjectIds become hex strings, Dates stay Dates (JSON turns them into ISO strings).
 */
export function toPlain<T>(value: T): Plain<T> {
  if (value instanceof Types.ObjectId) return value.toHexString() as Plain<T>;
  if (value instanceof Date || value === null || typeof value !== 'object') return value as Plain<T>;
  if (Array.isArray(value)) return value.map(toPlain) as Plain<T>;
  return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, toPlain(v)])) as Plain<T>;
}
