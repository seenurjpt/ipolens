import type { FastifyReply } from 'fastify';

// Edge cache lifetimes for public routes (SPEC: Backend API routes).
export const CACHE_SECONDS = { public: 60, subscription: 15 } as const;

// Per-IP limits (SPEC: Backend API routes > Rules). `pans` applies to /v1/me/pans/* (Prompt 5).
export const RATE_LIMITS = { public: 120, pans: 30 } as const;

export function cacheFor(reply: FastifyReply, seconds: number) {
  reply.header('cache-control', `public, max-age=${seconds}, s-maxage=${seconds}`);
}

export class HttpError extends Error {
  constructor(
    readonly statusCode: number,
    readonly error: string,
    message: string,
  ) {
    super(message);
  }
}

export const notFound = (message: string) => new HttpError(404, 'NotFound', message);
