"use client";

import { useActionState } from "react";

import { buttonClass, inputClass } from "@/components/ui";

import { setPublished, type PublishState } from "./actions";

export function PublishForm({ id, published, reviewedBy }: { id: string; published: boolean; reviewedBy?: string }) {
  // The button flips the current state.
  const [state, action, pending] = useActionState(setPublished.bind(null, id, !published), {} as PublishState);

  return (
    <form action={action} className="space-y-3">
      <label className="flex flex-col gap-1 text-sm font-medium">
        Reviewed by
        <input name="reviewedBy" required maxLength={60} defaultValue={reviewedBy ?? ""} placeholder="Your name" className={inputClass} />
      </label>
      {!published ? (
        <p className="text-xs text-muted">
          Check every figure against its page in the offer document first. Publishing shows this report in the app.
        </p>
      ) : null}
      <button type="submit" disabled={pending} className={`w-full ${published ? buttonClass.danger : buttonClass.primary}`}>
        {pending ? "Saving…" : published ? "Unpublish" : "Publish report"}
      </button>
      {state.error ? (
        <p role="alert" className="text-sm font-semibold text-loss">
          {state.error}
        </p>
      ) : null}
      {state.message ? (
        <p role="status" className="text-sm font-semibold text-over">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
