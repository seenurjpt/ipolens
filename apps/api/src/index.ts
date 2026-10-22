import { Redis } from 'ioredis';
import mongoose from 'mongoose';
import { buildApp } from './app';
import { env } from './env';
import { bullJobQueue } from './services/job-queue';
import { redisSubscriptionCache } from './services/subscription-cache';

// Fail fast instead of queueing commands while Redis is down; reads fall back to MongoDB.
const redis = new Redis(env.REDIS_URL, { maxRetriesPerRequest: 1, enableOfflineQueue: false });

const app = buildApp({
  redis,
  jobQueue: bullJobQueue(env.REDIS_URL),
  subscriptionCache: redisSubscriptionCache(redis, (err) => app.log.warn({ err }, 'subscription cache read failed')),
});
redis.on('error', (err) => app.log.warn({ err: err.message }, 'redis error'));

try {
  await mongoose.connect(env.MONGODB_URI);
  await app.listen({ port: env.API_PORT, host: env.API_HOST });
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
