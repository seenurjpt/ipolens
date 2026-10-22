"use server";

import { JobName, TriggerJobResponse } from "@ipolens/shared";
import { refresh } from "next/cache";

import { ApiError, adminPost } from "@/lib/api";

export interface TriggerState {
  error?: string;
  message?: string;
}

export async function triggerJob(name: string, _prev: TriggerState, form: FormData): Promise<TriggerState> {
  const job = JobName.safeParse(name);
  if (!job.success) return { error: "Unknown job" };
  const ipoId = typeof form.get("ipoId") === "string" && form.get("ipoId") !== "" ? String(form.get("ipoId")) : undefined;

  try {
    const { jobId } = await adminPost(`/jobs/${job.data}`, TriggerJobResponse, ipoId ? { ipoId } : {});
    refresh();
    return { message: `Queued as job #${jobId}` };
  } catch (err) {
    return { error: err instanceof ApiError ? err.message : "Could not queue the job" };
  }
}
