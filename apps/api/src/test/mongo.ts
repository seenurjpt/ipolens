import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { afterAll, beforeAll } from 'vitest';

/** Runs the calling test file against a throwaway MongoDB. */
export function useTestMongo() {
  let mongo: MongoMemoryServer | undefined;

  beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    await mongoose.connect(mongo.getUri());
  }, 120_000);

  afterAll(async () => {
    await mongoose.disconnect();
    await mongo?.stop();
  });
}
