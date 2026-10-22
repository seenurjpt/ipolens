import { AdminIpoResponse } from "@ipolens/shared";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { ErrorNotice, PageHeader, Skeleton, StatusChip } from "@/components/ui";
import { ApiError, adminGet } from "@/lib/api";
import { formatDateTime } from "@/lib/format";

import { IpoEditForm } from "./edit-form";

export const metadata: Metadata = { title: "Edit IPO" };

export default function EditIpoPage(props: PageProps<"/ipos/[id]">) {
  return (
    <Suspense fallback={<Skeleton rows={10} />}>
      <EditIpo params={props.params} />
    </Suspense>
  );
}

async function EditIpo({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[a-f\d]{24}$/i.test(id)) notFound();

  let ipo;
  try {
    ({ ipo } = await adminGet(`/ipos/${id}`, AdminIpoResponse));
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    return <ErrorNotice message={err instanceof ApiError ? err.message : "Unexpected error"} />;
  }

  return (
    <>
      <Link href="/ipos" className="text-sm font-semibold text-brand hover:underline">
        ← All IPOs
      </Link>
      <div className="mt-3">
        <PageHeader
          title={ipo.name}
          description={
            <span className="flex flex-wrap items-center gap-2">
              <StatusChip status={ipo.status} />
              <span>
                {ipo.symbol} · /{ipo.slug} · updated {formatDateTime(ipo.updatedAt)}
              </span>
            </span>
          }
        />
      </div>
      <IpoEditForm ipo={ipo} />
    </>
  );
}
