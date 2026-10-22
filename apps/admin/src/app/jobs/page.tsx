import { AdminIpoListResponse, JOB_DESCRIPTIONS, JobName, JobRunsResponse, PER_IPO_JOBS } from "@ipolens/shared";
import type { Metadata } from "next";
import { Suspense } from "react";

import { Card, ErrorNotice, PageHeader, Skeleton } from "@/components/ui";
import { ApiError, adminGet } from "@/lib/api";
import { formatDateTime } from "@/lib/format";

import { TriggerForm } from "./trigger-form";

export const metadata: Metadata = { title: "Jobs" };

const STATE_STYLES: Record<string, string> = {
  completed: "bg-over-soft text-over",
  failed: "bg-loss-soft text-loss",
  active: "bg-brand-soft text-brand",
};

export default function JobsPage() {
  return (
    <>
      <PageHeader title="Jobs" description="Run a job now instead of waiting for its schedule. Jobs run in the worker." />
      <div className="space-y-5">
        <Suspense fallback={<Skeleton rows={7} />}>
          <Triggers />
        </Suspense>
        <Suspense fallback={<Skeleton rows={5} />}>
          <RecentRuns />
        </Suspense>
      </div>
    </>
  );
}

async function Triggers() {
  // Per-IPO jobs need an IPO to pick; the trigger list still renders if this fails.
  let ipos: { id: string; name: string }[] = [];
  let loadError: string | undefined;
  try {
    const data = await adminGet("/ipos?pageSize=100", AdminIpoListResponse);
    ipos = data.items.map((i) => ({ id: i._id, name: i.name }));
  } catch (err) {
    loadError = err instanceof ApiError ? err.message : "Could not load IPOs";
  }

  return (
    <Card title="Run a job">
      {loadError ? <ErrorNotice title="IPO list unavailable" message={loadError} /> : null}
      <div className="divide-y divide-line">
        {JobName.options.map((name) => (
          <TriggerForm
            key={name}
            name={name}
            description={JOB_DESCRIPTIONS[name]}
            ipos={PER_IPO_JOBS.includes(name) ? ipos : undefined}
          />
        ))}
      </div>
    </Card>
  );
}

async function RecentRuns() {
  let data;
  try {
    data = await adminGet("/jobs", JobRunsResponse);
  } catch (err) {
    const message =
      err instanceof ApiError && err.error === "QueueUnavailable"
        ? "The job queue is unavailable: the API cannot reach Redis. Start Redis (pnpm db:up) and the worker to run jobs."
        : err instanceof ApiError
          ? err.message
          : "Unexpected error";
    return <ErrorNotice title="Recent runs unavailable" message={message} />;
  }

  return (
    <Card title="Recent runs">
      <dl className="mb-4 flex flex-wrap gap-4 text-sm">
        {Object.entries(data.counts).map(([state, n]) => (
          <div key={state}>
            <dt className="text-xs capitalize text-muted">{state}</dt>
            <dd className="text-lg font-bold">{n}</dd>
          </div>
        ))}
      </dl>
      {data.runs.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted">No jobs have run yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-line text-xs uppercase tracking-wide text-muted">
              <tr>
                <th scope="col" className="py-2 pr-3 font-semibold">Job</th>
                <th scope="col" className="py-2 pr-3 font-semibold">State</th>
                <th scope="col" className="py-2 pr-3 font-semibold">Queued</th>
                <th scope="col" className="py-2 pr-3 font-semibold">Finished</th>
                <th scope="col" className="py-2 font-semibold">Error</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {data.runs.map((r) => (
                <tr key={r.id}>
                  <td className="py-2 pr-3 font-mono text-xs">
                    {r.name} <span className="text-muted">#{r.id}</span>
                  </td>
                  <td className="py-2 pr-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${STATE_STYLES[r.state] ?? "bg-canvas text-muted"}`}>
                      {r.state}
                    </span>
                  </td>
                  <td className="py-2 pr-3 text-muted">{formatDateTime(r.createdAt)}</td>
                  <td className="py-2 pr-3 text-muted">{formatDateTime(r.finishedAt)}</td>
                  <td className="max-w-xs truncate py-2 text-loss" title={r.failedReason}>
                    {r.failedReason ?? ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
