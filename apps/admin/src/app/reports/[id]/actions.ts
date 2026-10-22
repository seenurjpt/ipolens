"use server";

import { AdminReportResponse, PublishReportBody } from "@ipolens/shared";
import { refresh } from "next/cache";

import { ApiError, adminPatch } from "@/lib/api";

export interface PublishState {
  error?: string;
  message?: string;
}

export async function setPublished(id: string, published: boolean, _prev: PublishState, form: FormData): Promise<PublishState> {
  const body = PublishReportBody.safeParse({ published, reviewedBy: form.get("reviewedBy") });
  if (!body.success) return { error: "Enter your name as the reviewer." };

  try {
    await adminPatch(`/reports/${id}/publish`, AdminReportResponse, body.data);
  } catch (err) {
    return { error: err instanceof ApiError ? err.message : "Could not update the report" };
  }
  refresh();
  return { message: published ? "Published. The app shows it within a minute." : "Unpublished." };
}
