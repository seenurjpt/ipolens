import { z } from 'zod';

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  MONGODB_URI: z.string().default('mongodb://localhost:27017/ipolens'),
  REDIS_URL: z.string().default('redis://localhost:6379'),
});

export const env = EnvSchema.parse(process.env);
