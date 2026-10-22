import { Worker } from 'bullmq';
import mongoose from 'mongoose';
import { env } from './env';
import { connection, QUEUE_NAME } from './queues';

await mongoose.connect(env.MONGODB_URI);

// Processors in src/jobs are wired up in Prompt 4.
const worker = new Worker(
  QUEUE_NAME,
  async (job) => {
    console.warn(`[worker] no processor for job "${job.name}" yet`);
  },
  { connection },
);

worker.on('ready', () => console.log(`[worker] listening on queue "${QUEUE_NAME}"`));

const shutdown = async () => {
  await worker.close();
  await mongoose.disconnect();
  process.exit(0);
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
