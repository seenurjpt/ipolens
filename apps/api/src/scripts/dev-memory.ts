// Runs the API against a throwaway in-memory MongoDB loaded with seed data, for trying the
// app without Docker. Data is lost on exit. Redis is optional: without it, subscription
// reads fall back to MongoDB, rate limits are kept in memory and admin job triggers answer 503.
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { buildApp } from '../app';
import { env } from '../env';
import { seedDatabase } from '../seed';
import { bullJobQueue } from '../services/job-queue';

const mongo = await MongoMemoryServer.create();
await mongoose.connect(mongo.getUri('ipolens'));
const counts = await seedDatabase();

const jobQueue = bullJobQueue(env.REDIS_URL);
const app = buildApp({ jobQueue });
await app.listen({ port: env.API_PORT, host: env.API_HOST });
app.log.info(counts, 'in-memory database seeded');

const shutdown = async () => {
  await app.close();
  await jobQueue.close();
  await mongoose.disconnect();
  await mongo.stop();
  process.exit(0);
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
