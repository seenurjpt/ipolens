import { AdminReportListResponse } from "@ipolens/shared";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { Card, ErrorNotice, PageHeader, Skeleton } from "@/components/ui";
import { ApiError, adminGet, qs } from "@/lib/api";
import { formatDateTime } from "@/lib/format";

export const metadata: Metadata = { title: "Reports" };

const FILTERS = [
  { value: "", label: "All" },
  { value: "false", label: "Needs review" },
  { value: "true", label: "Published" },
] as const;

export default function ReportsPage(props: PageProps<"/reports">) {
  return (
    <>
      <PageHeader
        title="Analysis reports"
        description="Nothing reaches the app until someone checks it against the offer document and publishes it."
      />
      <Suspense fallback={<Skeleton rows={6} />}>
        <ReportList searchParams={props.searchParams} />
      </Suspense>
    </>
  );
}

async function ReportList({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const raw = (await searchParams).published;
  const published = raw === "true" || raw === "false" ? raw : "";

  let data;
  try {
    data = await adminGet(`/reports${qs({ published })}`, AdminReportListResponse);
  } catch (err) {
    return <ErrorNotice message={err instanceof ApiError ? err.message : "Unexpected error"} />;
  }

  return (
    <Card>
      <nav aria-label="Filter reports" className="mb-4 flex gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f.value}
            href={`/reports${qs({ published: f.value })}`}
            aria-current={published === f.value ? "page" : undefined}
            className={`rounded-full border px-3 py-1 text-xs font-semibold ${
              published === f.value ? "border-brand bg-brand-soft text-brand" : "border-line text-muted hover:text-ink"
            }`}>
            {f.label}
          </Link>
        ))}
      </nav>

      {data.items.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted">No reports here.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-line text-xs uppercase tracking-wide text-muted">
              <tr>
                <th scope="col" className="py-2 pr-3 font-semibold">IPO</th>
                <th scope="col" className="py-2 pr-3 font-semibold">Version</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">Score</th>
                <th scope="col" className="py-2 pr-3 font-semibold">State</th>
                <th scope="col" className="py-2 pr-3 font-semibold">Created</th>
                <th scope="col" className="py-2 font-semibold">Reviewed by</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {data.items.map((r) => (
                <tr key={r._id} className="hover:bg-canvas">
                  <td className="py-2.5 pr-3">
                    <Link href={`/reports/${r._id}`} className="font-semibold hover:text-brand">
                      {r.ipo?.name ?? "Unknown IPO"}
                    </Link>
                  </td>
                  <td className="py-2.5 pr-3 text-muted">
                    v{r.version} · {r.model}
                  </td>
                  <td className="py-2.5 pr-3 text-right font-semibold">{r.scoreTotal}</td>
                  <td className="py-2.5 pr-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                        r.published ? "bg-over-soft text-over" : "bg-under-soft text-under"
                      }`}>
                      {r.published ? "Published" : "Needs review"}
                    </span>
                  </td>
                  <td className="py-2.5 pr-3 text-muted">{formatDateTime(r.createdAt)}</td>
                  <td className="py-2.5 text-muted">{r.reviewedBy ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
