"use client";

import { useActionState } from "react";

import { buttonClass, inputClass } from "@/components/ui";

import { triggerJob, type TriggerState } from "./actions";

export function TriggerForm({
  name,
  description,
  ipos,
}: {
  name: string;
  description: string;
  /** Set for jobs that run on one IPO. */
  ipos?: { id: string; name: string }[];
}) {
  const [state, action, pending] = useActionState(triggerJob.bind(null, name), {} as TriggerState);

  return (
    <form action={action} className="flex flex-wrap items-center gap-3 py-3">
      <div className="min-w-56 flex-1">
        <p className="font-mono text-sm font-semibold">{name}</p>
        <p className="text-xs text-muted">{description}</p>
      </div>
      {ipos ? (
        <label className="flex items-center gap-2 text-sm">
          <span className="sr-only">IPO for {name}</span>
          <select name="ipoId" required defaultValue="" className={`${inputClass} w-56`}>
            <option value="" disabled>
              Choose an IPO
            </option>
            {ipos.map((i) => (
              <option key={i.id} value={i.id}>
                {i.name}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      <button type="submit" disabled={pending} className={buttonClass.secondary}>
        {pending ? "Queuing…" : "Run now"}
      </button>
      {state.error || state.message ? (
        <p role={state.error ? "alert" : "status"} className={`w-full text-xs font-semibold ${state.error ? "text-loss" : "text-over"}`}>
          {state.error ?? state.message}
        </p>
      ) : null}
    </form>
  );
}
