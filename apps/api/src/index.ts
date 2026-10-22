import mongoose from 'mongoose';
import { buildApp } from './app';
import { env } from './env';

const app = buildApp();

try {
  await mongoose.connect(env.MONGODB_URI);
  await app.listen({ port: env.API_PORT, host: env.API_HOST });
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
