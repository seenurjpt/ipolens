import { SubscriptionFigures, subscriptionCacheKey } from '@ipolens/shared';
import type { Redis } from 'ioredis';

/** Latest live subscription for an IPO, written by the worker's poll-subscription job. */
export interface SubscriptionCache {
  getLatest(ipoId: string): Promise<SubscriptionFigures | null>;
}

export const noSubscriptionCache: SubscriptionCache = { getLatest: async () => null };

/**
 * Redis-backed cache. A miss, a malformed value or Redis being down all return null, and the
 * route falls back to the snapshot denormalised on the IPO document.
 */
export function redisSubscriptionCache(redis: Redis, onError: (err: unknown) => void): SubscriptionCache {
  return {
    async getLatest(ipoId) {
      try {
        const raw = await redis.get(subscriptionCacheKey(ipoId));
        if (!raw) return null;
        const parsed = SubscriptionFigures.safeParse(JSON.parse(raw));
        return parsed.success ? parsed.data : null;
      } catch (err) {
        onError(err);
        return null;
      }
    },
  };
}
