import "server-only";

import { connection } from "next/server";
import type { z } from "zod";

// Server-side client for /v1/admin. The admin token lives only on the server: this module
// cannot be imported into a Client Component.

const API_URL = process.env.API_URL ?? "http://localhost:4000";

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly error: string,
    message: string,
  ) {
    super(message);
  }
}

async function request<S extends z.ZodTypeAny>(
  method: "GET" | "PATCH" | "POST",
  path: string,
  schema: S,
  body?: unknown,
): Promise<z.output<S>> {
  // Admin data is always read per request. Without this, a missing token at build time would
  // be rendered into the static shell instead of being checked when the page is requested.
  await connection();
  const token = process.env.ADMIN_API_TOKEN;
  if (!token) throw new ApiError(503, "AdminDisabled", "ADMIN_API_TOKEN is not set for the admin panel.");

  let res: Response;
  try {
    res = await fetch(`${API_URL}/v1/admin${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(body === undefined ? {} : { "Content-Type": "application/json" }),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: "no-store",
    });
  } catch {
    throw new ApiError(503, "ApiUnreachable", `Cannot reach the API at ${API_URL}.`);
  }

  const json = (await res.json().catch(() => null)) as { error?: string; message?: string } | null;
  if (!res.ok) {
    throw new ApiError(res.status, json?.error ?? "Error", json?.message ?? `Request failed (${res.status})`);
  }
  return schema.parse(json);
}

export const adminGet = <S extends z.ZodTypeAny>(path: string, schema: S) => request("GET", path, schema);
export const adminPatch = <S extends z.ZodTypeAny>(path: string, schema: S, body: unknown) =>
  request("PATCH", path, schema, body);
export const adminPost = <S extends z.ZodTypeAny>(path: string, schema: S, body: unknown) =>
  request("POST", path, schema, body);

/** Query string from defined values only. */
export function qs(params: Record<string, string | number | undefined>): string {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== "");
  return entries.length ? `?${new URLSearchParams(entries.map(([k, v]) => [k, String(v)]))}` : "";
}
