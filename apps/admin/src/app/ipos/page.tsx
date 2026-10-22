import { AdminIpoListResponse, IpoStatus } from "@ipolens/shared";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { Card, ErrorNotice, PageHeader, ReportChip, Skeleton, StatusChip, buttonClass, inputClass } from "@/components/ui";
import { ApiError, adminGet, qs } from "@/lib/api";
import { formatDate, formatMultiple } from "@/lib/format";

export const metadata: Metadata = { title: "IPOs" };

const PAGE_SIZE = 25;

type Search = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

export default function IposPage(props: PageProps<"/ipos">) {
  return (
    <>
      <PageHeader title="IPOs" description="Every issue the scrapers know about. Open one to fix its data." />
      <Suspense fallback={<Skeleton rows={8} />}>
        <IpoTable searchParams={props.searchParams} />
      </Suspense>
    </>
  );
}

async function IpoTable({ searchParams }: { searchParams: Promise<Search> }) {
  const params = await searchParams;
  const status = one(params.status);
  const q = one(params.q).trim();
  const page = Math.max(1, Number(one(params.page)) || 1);

  let data;
  try {
    data = await adminGet(`/ipos${qs({ status, q, page, pageSize: PAGE_SIZE })}`, AdminIpoListResponse);
  } catch (err) {
    return <ErrorNotice message={err instanceof ApiError ? err.message : "Unexpected error"} />;
  }

  const pages = Math.max(1, Math.ceil(data.total / PAGE_SIZE));
  const pageHref = (p: number) => `/ipos${qs({ status, q, page: p > 1 ? p : undefined })}`;

  return (
    <Card>
      <form method="get" className="mb-4 flex flex-wrap items-end gap-3" role="search">
        <label className="flex min-w-56 flex-1 flex-col gap-1 text-sm font-medium">
          Search
          <input name="q" defaultValue={q} placeholder="Name, symbol or slug" className={inputClass} />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Status
          <select name="status" defaultValue={status} className={inputClass}>
            <option value="">All statuses</option>
            {IpoStatus.options.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0) + s.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className={buttonClass.secondary}>
          Apply
        </button>
      </form>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-line text-xs uppercase tracking-wide text-muted">
            <tr>
              <th scope="col" className="py-2 pr-3 font-semibold">IPO</th>
              <th scope="col" className="py-2 pr-3 font-semibold">Status</th>
              <th scope="col" className="py-2 pr-3 font-semibold">Opens</th>
              <th scope="col" className="py-2 pr-3 font-semibold">Closes</th>
              <th scope="col" className="py-2 pr-3 text-right font-semibold">Subscribed</th>
              <th scope="col" className="py-2 font-semibold">Report</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {data.items.map((ipo) => (
              <tr key={ipo._id} className="hover:bg-canvas">
                <td className="py-2.5 pr-3">
                  <Link href={`/ipos/${ipo._id}`} className="font-semibold hover:text-brand">
                    {ipo.name}
                  </Link>
                  <span className="ml-2 text-xs text-muted">
                    {ipo.symbol}
                    {ipo.board === "SME" ? " · SME" : ""}
                  </span>
                </td>
                <td className="py-2.5 pr-3">
                  <StatusChip status={ipo.status} />
                </td>
                <td className="py-2.5 pr-3 text-muted">{formatDate(ipo.dates.open)}</td>
                <td className="py-2.5 pr-3 text-muted">{formatDate(ipo.dates.close)}</td>
                <td className="py-2.5 pr-3 text-right font-semibold">
                  {ipo.latestSubscription ? formatMultiple(ipo.latestSubscription.total) : "—"}
                </td>
                <td className="py-2.5">
                  <ReportChip state={ipo.reportState} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {data.items.length === 0 ? <p className="py-8 text-center text-sm text-muted">No IPOs match.</p> : null}
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-muted">
        <span>
          {data.total} IPO{data.total === 1 ? "" : "s"} · page {page} of {pages}
        </span>
        <div className="flex gap-2">
          {page > 1 ? (
            <Link href={pageHref(page - 1)} className={buttonClass.secondary}>
              Previous
            </Link>
          ) : null}
          {page < pages ? (
            <Link href={pageHref(page + 1)} className={buttonClass.secondary}>
              Next
            </Link>
          ) : null}
        </div>
      </div>
    </Card>
  );
}
