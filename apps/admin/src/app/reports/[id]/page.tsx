import { AdminReportResponse, SCORE_WEIGHTS, type AiReport } from "@ipolens/shared";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { Card, ErrorNotice, PageHeader, Skeleton, StatusChip } from "@/components/ui";
import { ApiError, adminGet } from "@/lib/api";
import { formatDateTime } from "@/lib/format";

import { PublishForm } from "./publish-form";

export const metadata: Metadata = { title: "Review report" };

const DIMENSIONS: Record<keyof typeof SCORE_WEIGHTS, string> = {
  growth: "Growth",
  profitability: "Profitability",
  balanceSheet: "Balance sheet",
  valuation: "Valuation",
  governance: "Governance",
  subscriptionSignal: "Subscription signal",
};

const FIN_ROWS: { key: keyof AiReport["financials"][number]; label: string; pct?: boolean }[] = [
  { key: "revenueCr", label: "Revenue" },
  { key: "ebitdaCr", label: "EBITDA" },
  { key: "patCr", label: "Profit (PAT)" },
  { key: "netWorthCr", label: "Net worth" },
  { key: "debtCr", label: "Debt" },
  { key: "roePct", label: "RoE", pct: true },
  { key: "rocePct", label: "RoCE", pct: true },
];

const crore = new Intl.NumberFormat("en-IN", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

export default function ReportReviewPage(props: PageProps<"/reports/[id]">) {
  return (
    <Suspense fallback={<Skeleton rows={10} />}>
      <Review params={props.params} />
    </Suspense>
  );
}

async function Review({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[a-f\d]{24}$/i.test(id)) notFound();

  let data;
  try {
    data = await adminGet(`/reports/${id}`, AdminReportResponse);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    return <ErrorNotice message={err instanceof ApiError ? err.message : "Unexpected error"} />;
  }
  const { report, ipo } = data;
  // Evidence links open the offer document at the cited page (browsers honour #page=N).
  const pdfUrl = ipo?.documents.rhpUrl ?? ipo?.documents.drhpUrl;

  return (
    <>
      <Link href="/reports" className="text-sm font-semibold text-brand hover:underline">
        ← All reports
      </Link>
      <div className="mt-3">
        <PageHeader
          title={ipo ? ipo.name : "Report"}
          description={
            <span className="flex flex-wrap items-center gap-2">
              {ipo ? <StatusChip status={ipo.status} /> : null}
              <span>
                Version {report.version} · {report.model} · created {formatDateTime(report.createdAt)} · disclaimer{" "}
                {report.disclaimerVersion}
              </span>
            </span>
          }
        />
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-[1fr_300px]">
        <div className="space-y-5">
          {!pdfUrl ? (
            <ErrorNotice title="No offer document linked" message="Add the RHP or DRHP URL on the IPO page so the evidence links work." />
          ) : null}

          <Card title="Summary">
            <p className="text-sm leading-6">{report.summary}</p>
          </Card>

          <Card title="Business">
            <p className="text-sm leading-6">{report.business.model}</p>
            {report.business.segments.length ? (
              <p className="mt-2 text-sm text-muted">Segments: {report.business.segments.join(", ")}</p>
            ) : null}
            {report.business.customers ? <p className="mt-1 text-sm text-muted">Customers: {report.business.customers}</p> : null}
          </Card>

          <Card title="Financials (₹ crore)">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-line text-xs text-muted">
                  <tr>
                    <th scope="col" className="py-2 text-left font-semibold">
                      <span className="sr-only">Metric</span>
                    </th>
                    {report.financials.map((f) => (
                      <th key={f.fy} scope="col" className="py-2 text-right font-semibold">
                        {f.fy}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {FIN_ROWS.map((row) => (
                    <tr key={row.key}>
                      <th scope="row" className="py-2 text-left font-normal text-muted">
                        {row.label}
                      </th>
                      {report.financials.map((f) => {
                        const v = f[row.key] as number;
                        return (
                          <td key={f.fy} className={`py-2 text-right font-semibold ${v < 0 ? "text-loss" : ""}`}>
                            {row.pct ? `${v.toFixed(1)}%` : crore.format(v)}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Points title="Strengths" points={report.pros} pdfUrl={pdfUrl} />
          <Points title="Concerns" points={report.cons} pdfUrl={pdfUrl} />
          <Points title="Key risks" points={report.risks} pdfUrl={pdfUrl} />

          <Card title="Valuation">
            <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-muted">Post-issue P/E</dt>
                <dd className="font-semibold">{report.valuation.postIssuePe?.toFixed(1) ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-muted">Market cap</dt>
                <dd className="font-semibold">₹{report.valuation.marketCapCr.toLocaleString("en-IN")} Cr</dd>
              </div>
            </dl>
            {report.valuation.peerPe.length ? (
              <ul className="mt-4 divide-y divide-line border-t border-line text-sm">
                {report.valuation.peerPe.map((p) => (
                  <li key={p.name} className="flex justify-between py-2">
                    <span>{p.name}</span>
                    <span className="font-semibold">{p.pe.toFixed(1)}x</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </Card>
        </div>

        <div className="space-y-5 lg:sticky lg:top-8">
          <Card title="Analysis score">
            <p className="text-4xl font-bold">
              {report.score.total}
              <span className="text-base font-medium text-muted"> / 100</span>
            </p>
            <ul className="mt-4 space-y-3">
              {(Object.keys(SCORE_WEIGHTS) as (keyof typeof SCORE_WEIGHTS)[]).map((k) => {
                const v = report.score.breakdown[k];
                const max = SCORE_WEIGHTS[k];
                return (
                  <li key={k}>
                    <div className="flex justify-between text-xs">
                      <span className="font-medium">{DIMENSIONS[k]}</span>
                      <span className="text-muted">{v === undefined ? "after close" : `${v} / ${max}`}</span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-line" role="presentation">
                      <div className="h-full rounded-full bg-brand" style={{ width: `${((v ?? 0) / max) * 100}%` }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          </Card>

          <Card title={report.published ? "Published" : "Awaiting review"}>
            <PublishForm id={report._id} published={report.published} reviewedBy={report.reviewedBy} />
          </Card>
        </div>
      </div>
    </>
  );
}

function Points({ title, points, pdfUrl }: { title: string; points: AiReport["pros"]; pdfUrl?: string }) {
  if (points.length === 0) return null;
  return (
    <Card title={title}>
      <ul className="space-y-4">
        {points.map((p) => (
          <li key={p.text} className="text-sm">
            <p className="font-medium">{p.text}</p>
            <p className="mt-1 flex flex-wrap items-baseline gap-2 text-muted">
              {pdfUrl ? (
                <a
                  href={`${pdfUrl}#page=${p.evidence.page}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 rounded bg-brand-soft px-1.5 py-0.5 text-xs font-semibold text-brand hover:underline">
                  p. {p.evidence.page} ↗
                </a>
              ) : (
                <span className="shrink-0 text-xs font-semibold">p. {p.evidence.page}</span>
              )}
              <q className="italic">{p.evidence.quote}</q>
            </p>
          </li>
        ))}
      </ul>
    </Card>
  );
}
