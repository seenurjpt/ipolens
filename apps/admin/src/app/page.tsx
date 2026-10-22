import { AdminIpoListResponse, AdminSummaryResponse, IpoStatus } from "@ipolens/shared";
import Link from "next/link";
import { Suspense } from "react";

import { Card, ErrorNotice, PageHeader, Skeleton, StatusChip } from "@/components/ui";
import { ApiError, adminGet } from "@/lib/api";
import { formatDate, formatMultiple } from "@/lib/format";

export default function DashboardPage() {
  return (
    <>
      <PageHeader title="Dashboard" description="What needs attention today." />
      <Suspense fallback={<Skeleton rows={4} />}>
        <Summary />
      </Suspense>
      <div className="mt-6">
        <Suspense fallback={<Skeleton />}>
          <Live />
        </Suspense>
      </div>
    </>
  );
}

async function Summary() {
  let summary;
  try {
    summary = await adminGet("/summary", AdminSummaryResponse);
  } catch (err) {
    return <ErrorNotice message={err instanceof ApiError ? err.message : "Unexpected error"} />;
  }
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
      <Card title="IPOs by status">
        <dl className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {IpoStatus.options.map((s) => (
            <Link key={s} href={`/ipos?status=${s}`} className="rounded-lg border border-line p-3 hover:bg-canvas">
              <dt>
                <StatusChip status={s} />
              </dt>
              <dd className="mt-2 text-2xl font-bold">{summary.ipoCounts[s] ?? 0}</dd>
            </Link>
          ))}
        </dl>
      </Card>
      <Card title="Reports to review">
        <p className="text-4xl font-bold">{summary.pendingReports}</p>
        <p className="mt-1 text-sm text-muted">Unpublished analysis reports.</p>
        <Link href="/reports?published=false" className="mt-4 inline-block text-sm font-semibold text-brand hover:underline">
          Open the review queue →
        </Link>
      </Card>
    </div>
  );
}

/** Open and upcoming IPOs, the ones most likely to need a data fix. */
async function Live() {
  let data;
  try {
    data = await adminGet("/ipos?status=OPEN,UPCOMING&pageSize=10", AdminIpoListResponse);
  } catch (err) {
    return <ErrorNotice message={err instanceof ApiError ? err.message : "Unexpected error"} />;
  }
  return (
    <Card title="Open and upcoming" actions={<Link href="/ipos" className="text-sm font-semibold text-brand hover:underline">All IPOs →</Link>}>
      {data.items.length === 0 ? (
        <p className="text-sm text-muted">No open or upcoming IPOs.</p>
      ) : (
        <ul className="divide-y divide-line">
          {data.items.map((ipo) => (
            <li key={ipo._id} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-2.5 text-sm">
              <Link href={`/ipos/${ipo._id}`} className="min-w-48 flex-1 font-semibold hover:text-brand">
                {ipo.name}
              </Link>
              <StatusChip status={ipo.status} />
              <span className="text-muted">
                {formatDate(ipo.dates.open)} – {formatDate(ipo.dates.close)}
              </span>
              <span className="w-16 text-right font-semibold">
                {ipo.latestSubscription ? formatMultiple(ipo.latestSubscription.total) : "—"}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
