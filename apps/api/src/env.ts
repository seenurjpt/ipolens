import { z } from 'zod';

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  API_PORT: z.coerce.number().default(4000),
  API_HOST: z.string().default('0.0.0.0'),
  MONGODB_URI: z.string().default('mongodb://localhost:27017/ipolens'),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  // Bearer token for /v1/admin. Admin routes are disabled (503) while it is unset.
  ADMIN_API_TOKEN: z
    .string()
    .optional()
    .transform((v) => v || undefined), // an empty value in .env counts as unset
});

// Hosts like Render and Railway pass the port as PORT.
export const env = EnvSchema.parse({ ...process.env, API_PORT: process.env.API_PORT ?? process.env.PORT });
