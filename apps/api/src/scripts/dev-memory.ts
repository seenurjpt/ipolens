// Runs the API against a throwaway in-memory MongoDB loaded with seed data, for trying the
// app without Docker. Data is lost on exit. Redis is optional: without it, subscription
// reads fall back to MongoDB and rate limits are kept in memory.
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { buildApp } from '../app';
import { env } from '../env';
import { seedDatabase } from '../seed';

const mongo = await MongoMemoryServer.create();
await mongoose.connect(mongo.getUri('ipolens'));
const counts = await seedDatabase();

const app = buildApp();
await app.listen({ port: env.API_PORT, host: env.API_HOST });
app.log.info(counts, 'in-memory database seeded');

const shutdown = async () => {
  await app.close();
  await mongoose.disconnect();
  await mongo.stop();
  process.exit(0);
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
