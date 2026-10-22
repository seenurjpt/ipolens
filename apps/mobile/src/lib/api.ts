import type { z } from 'zod';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:4000';

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

type Query = Record<string, string | number | undefined>;

function toQueryString(query: Query = {}): string {
  const params = Object.entries(query)
    .filter(([, v]) => v !== undefined && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`);
  return params.length ? `?${params.join('&')}` : '';
}

/**
 * GET a /v1 route and parse it with its shared response schema, which also turns ISO date
 * strings back into Dates.
 */
export async function apiGet<S extends z.ZodTypeAny>(path: string, schema: S, query?: Query): Promise<z.output<S>> {
  const res = await fetch(`${API_URL}${path}${toQueryString(query)}`);
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { message?: string } | null;
    throw new ApiError(res.status, body?.message ?? `Request failed (${res.status})`);
  }
  return schema.parse(await res.json());
}
