import { Redis } from 'ioredis';
import { env } from './env';

export { JobName, QUEUE_NAME } from '@ipolens/shared';

// BullMQ needs maxRetriesPerRequest: null on worker connections.
export const connection = new Redis(env.REDIS_URL, { maxRetriesPerRequest: null });
