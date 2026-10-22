import { QUEUE_NAME, type JobName, type JobRun } from '@ipolens/shared';
import { Queue } from 'bullmq';
import { Redis } from 'ioredis';

/** Thrown when jobs cannot be queued or listed because Redis is unreachable. */
export class QueueUnavailableError extends Error {
  constructor() {
    super('The job queue is unavailable (Redis is not reachable)');
  }
}

/** What the admin routes need from BullMQ; tests pass a fake. */
export interface JobQueue {
  add(name: JobName, data: { ipoId?: string }): Promise<string>;
  recent(limit: number): Promise<{ counts: Record<string, number>; runs: JobRun[] }>;
  close(): Promise<void>;
}

const STATES = ['active', 'waiting', 'delayed', 'completed', 'failed'] as const;

/**
 * BullMQ-backed queue. The Redis client fails fast instead of queueing commands while
 * disconnected, so an outage surfaces as a quick 503 rather than a hung request.
 */
export function bullJobQueue(redisUrl: string): JobQueue {
  const connection = new Redis(redisUrl, {
    enableOfflineQueue: false,
    maxRetriesPerRequest: 1,
    connectTimeout: 2_000,
  });
  connection.on('error', () => {
    // Reported per request as QueueUnavailableError; ioredis keeps reconnecting.
  });
  const queue = new Queue(QUEUE_NAME, { connection });
  queue.on('error', () => {
    // Same as above: without a listener an emitted error would crash the process.
  });

  const ensureReady = () => {
    if (connection.status !== 'ready') throw new QueueUnavailableError();
  };

  return {
    async add(name, data) {
      ensureReady();
      const job = await queue.add(name, data, { removeOnComplete: 500, removeOnFail: 1000 });
      return job.id ?? '';
    },
    async recent(limit) {
      ensureReady();
      const [counts, jobs] = await Promise.all([queue.getJobCounts(...STATES), queue.getJobs([...STATES], 0, limit - 1)]);
      const runs = await Promise.all(
        jobs
          .filter((j) => j?.id)
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, limit)
          .map(async (j) => ({
            id: j.id!,
            name: j.name,
            state: await j.getState(),
            ipoId: typeof j.data?.ipoId === 'string' ? j.data.ipoId : undefined,
            createdAt: new Date(j.timestamp),
            finishedAt: j.finishedOn ? new Date(j.finishedOn) : undefined,
            failedReason: j.failedReason || undefined,
          })),
      );
      return { counts, runs };
    },
    async close() {
      await queue.close();
      connection.disconnect();
    },
  };
}
