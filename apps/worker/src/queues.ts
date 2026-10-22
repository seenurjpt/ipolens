import { Redis } from 'ioredis';
import { env } from './env';

// BullMQ needs maxRetriesPerRequest: null on worker connections.
export const connection = new Redis(env.REDIS_URL, { maxRetriesPerRequest: null });

export const QUEUE_NAME = 'ipolens';

// Job names from SPEC "Data sources and ingestion jobs" > Job design.
export const JOB_NAMES = [
  'discover-ipos',
  'enrich-ipo',
  'poll-subscription',
  'check-allotment-published',
  'listing-tracker',
  'status-transition',
  'ai-report',
] as const;
export type JobName = (typeof JOB_NAMES)[number];
