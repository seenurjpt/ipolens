import type { IpoStatus, ReportState } from "@ipolens/shared";
import type { ReactNode } from "react";

export function PageHeader({ title, description, actions }: { title: string; description?: ReactNode; actions?: ReactNode }) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
      </div>
      {actions}
    </header>
  );
}

export function Card({ title, actions, children, className = "" }: { title?: string; actions?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-xl border border-line bg-surface p-5 ${className}`}>
      {title ? (
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold">{title}</h2>
          {actions}
        </div>
      ) : null}
      {children}
    </section>
  );
}

const STATUS_STYLES: Record<IpoStatus, string> = {
  UPCOMING: "bg-brand-soft text-brand",
  OPEN: "bg-over-soft text-over",
  CLOSED: "bg-canvas text-muted",
  ALLOTMENT: "bg-under-soft text-under",
  LISTED: "bg-canvas text-ink",
  WITHDRAWN: "bg-loss-soft text-loss",
};

export function StatusChip({ status }: { status: IpoStatus }) {
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_STYLES[status]}`}>
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}

const REPORT_STYLES: Record<ReportState, { label: string; className: string }> = {
  NONE: { label: "No report", className: "text-muted" },
  PENDING: { label: "Needs review", className: "bg-under-soft text-under" },
  PUBLISHED: { label: "Published", className: "bg-over-soft text-over" },
};

export function ReportChip({ state }: { state: ReportState }) {
  const s = REPORT_STYLES[state];
  return <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${s.className}`}>{s.label}</span>;
}

/** Shown in place of content when the API call fails. */
export function ErrorNotice({ title = "Couldn't load this", message }: { title?: string; message: string }) {
  return (
    <div role="alert" className="rounded-xl border border-loss/30 bg-loss-soft p-4 text-sm">
      <p className="font-semibold text-loss">{title}</p>
      <p className="mt-1 text-ink">{message}</p>
    </div>
  );
}

export function Skeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div aria-busy="true" aria-label="Loading" className="space-y-2">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="h-10 animate-pulse rounded-lg bg-line/60" />
      ))}
    </div>
  );
}

export const buttonClass = {
  primary:
    "inline-flex items-center justify-center rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-on-brand hover:opacity-90 disabled:opacity-50",
  secondary:
    "inline-flex items-center justify-center rounded-lg border border-line bg-surface px-4 py-2 text-sm font-semibold text-ink hover:bg-canvas disabled:opacity-50",
  danger:
    "inline-flex items-center justify-center rounded-lg border border-loss/40 bg-loss-soft px-4 py-2 text-sm font-semibold text-loss hover:opacity-90 disabled:opacity-50",
};

export const inputClass =
  "w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted/70 disabled:opacity-60";
