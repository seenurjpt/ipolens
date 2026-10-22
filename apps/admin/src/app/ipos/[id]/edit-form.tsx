"use client";

import { Board, Exchange, IpoStatus, IssueType, REGISTRARS, RegistrarCode, type Ipo } from "@ipolens/shared";
import { useActionState, useState, type ReactNode } from "react";

import { buttonClass, inputClass } from "@/components/ui";
import { formatRupees, paiseToCroreInput, paiseToRupeesInput, toDateInput } from "@/lib/format";

import { saveIpo, type SaveState } from "./actions";

const initial: SaveState = { ok: false, errors: [] };
const title = (s: string) => s.charAt(0) + s.slice(1).toLowerCase().replace(/_/g, " ");

const DATE_FIELDS: { key: keyof Ipo["dates"]; label: string }[] = [
  { key: "open", label: "Bidding opens" },
  { key: "close", label: "Bidding closes" },
  { key: "allotment", label: "Allotment" },
  { key: "refundInitiation", label: "Refunds" },
  { key: "dematCredit", label: "Demat credit" },
  { key: "listing", label: "Listing" },
];

export function IpoEditForm({ ipo }: { ipo: Ipo }) {
  const [state, action, pending] = useActionState(saveIpo.bind(null, ipo._id), initial);
  const [lotSize, setLotSize] = useState(String(ipo.lotSize));
  const [priceMax, setPriceMax] = useState(paiseToRupeesInput(ipo.priceBand.maxPaise));
  const [registrarCode, setRegistrarCode] = useState<RegistrarCode>(ipo.registrar.code);

  const minInvestment = Math.round(Number(priceMax) * 100) * Number(lotSize);

  return (
    <form action={action} className="space-y-5">
      {state.errors.length > 0 ? (
        <div role="alert" className="rounded-xl border border-loss/30 bg-loss-soft p-4 text-sm">
          <p className="font-semibold text-loss">Not saved</p>
          <ul className="mt-1 list-disc pl-5">
            {state.errors.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </div>
      ) : null}
      {state.ok ? (
        <p role="status" className="rounded-xl bg-over-soft p-3 text-sm font-semibold text-over">
          Saved. The app shows the change within a minute (edge cache).
        </p>
      ) : null}

      <Section title="Basics">
        <Field label="Name" wide>
          <input name="name" required defaultValue={ipo.name} className={inputClass} />
        </Field>
        <Field label="Slug" hint="Used in app links. Changing it breaks shared links.">
          <input name="slug" required defaultValue={ipo.slug} pattern="[a-z0-9]+(-[a-z0-9]+)*" className={inputClass} />
        </Field>
        <Field label="Symbol">
          <input name="symbol" required defaultValue={ipo.symbol} className={inputClass} />
        </Field>
        <Field label="ISIN" hint="Leave as is if unknown.">
          <input name="isin" defaultValue={ipo.isin ?? ""} className={inputClass} />
        </Field>
        <Field label="Status">
          <Select name="status" value={ipo.status} options={IpoStatus.options} />
        </Field>
        <Field label="Board">
          <Select name="board" value={ipo.board} options={Board.options} />
        </Field>
        <Field label="Issue type">
          <Select name="issueType" value={ipo.issueType} options={IssueType.options} />
        </Field>
        <fieldset className="flex flex-col gap-1 text-sm">
          <legend className="mb-1 font-medium">Exchanges</legend>
          <div className="flex gap-4 py-2">
            {Exchange.options.map((x) => (
              <label key={x} className="flex items-center gap-2">
                <input type="checkbox" name="exchanges" value={x} defaultChecked={ipo.exchanges.includes(x)} />
                {x}
              </label>
            ))}
          </div>
        </fieldset>
        <Field label="Industry">
          <input name="industry" required defaultValue={ipo.industry} className={inputClass} />
        </Field>
        <Field label="Logo URL" wide>
          <input name="logoUrl" type="url" defaultValue={ipo.logoUrl ?? ""} className={inputClass} />
        </Field>
      </Section>

      <Section title="Price and lot">
        <Field label="Price band, low (₹)">
          <input name="priceMin" inputMode="decimal" required defaultValue={paiseToRupeesInput(ipo.priceBand.minPaise)} className={inputClass} />
        </Field>
        <Field label="Price band, high (₹)">
          <input name="priceMax" inputMode="decimal" required value={priceMax} onChange={(e) => setPriceMax(e.target.value)} className={inputClass} />
        </Field>
        <Field label="Lot size (shares)">
          <input name="lotSize" inputMode="numeric" required value={lotSize} onChange={(e) => setLotSize(e.target.value)} className={inputClass} />
        </Field>
        <Field label="Minimum investment" hint="Lot size × high end of the band, worked out on save.">
          <output className="block py-2 text-sm font-semibold">
            {Number.isFinite(minInvestment) && minInvestment > 0 ? formatRupees(minInvestment) : "—"}
          </output>
        </Field>
      </Section>

      <Section title="Issue size (₹ crore)">
        <Field label="Total issue">
          <input name="issueSizeCr" inputMode="decimal" required defaultValue={paiseToCroreInput(ipo.issueSizePaise)} className={inputClass} />
        </Field>
        <Field label="Fresh issue">
          <input name="freshIssueCr" inputMode="decimal" required defaultValue={paiseToCroreInput(ipo.freshIssuePaise)} className={inputClass} />
        </Field>
        <Field label="Offer for sale">
          <input name="ofsCr" inputMode="decimal" required defaultValue={paiseToCroreInput(ipo.ofsPaise)} className={inputClass} />
        </Field>
      </Section>

      <Section title="Dates (IST)">
        {DATE_FIELDS.map((d) => (
          <Field key={d.key} label={d.label}>
            <input type="date" name={`dates.${d.key}`} defaultValue={toDateInput(ipo.dates[d.key])} className={inputClass} />
          </Field>
        ))}
      </Section>

      <Section title="Registrar and lead managers">
        <Field label="Registrar">
          <select
            name="registrar.code"
            value={registrarCode}
            onChange={(e) => setRegistrarCode(e.target.value as RegistrarCode)}
            className={inputClass}>
            {RegistrarCode.options.map((c) => (
              <option key={c} value={c}>
                {REGISTRARS[c].name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Allotment page URL" wide hint="Defaults to the registrar's usual page.">
          <input
            key={registrarCode}
            name="registrar.allotmentUrl"
            type="url"
            defaultValue={registrarCode === ipo.registrar.code ? ipo.registrar.allotmentUrl : REGISTRARS[registrarCode].allotmentUrl}
            className={inputClass}
          />
        </Field>
        <Field label="Lead managers" wide hint="One per line.">
          <textarea name="leadManagers" rows={3} defaultValue={ipo.leadManagers.join("\n")} className={inputClass} />
        </Field>
      </Section>

      <Section title="Reservation">
        <Field label="QIB %">
          <input name="reservation.qibPct" inputMode="decimal" required defaultValue={ipo.reservation.qibPct} className={inputClass} />
        </Field>
        <Field label="NII %">
          <input name="reservation.niiPct" inputMode="decimal" required defaultValue={ipo.reservation.niiPct} className={inputClass} />
        </Field>
        <Field label="Retail %">
          <input name="reservation.retailPct" inputMode="decimal" required defaultValue={ipo.reservation.retailPct} className={inputClass} />
        </Field>
        <Field label="Employee quota (shares)">
          <input name="reservation.employeeQuota" inputMode="numeric" defaultValue={ipo.reservation.employeeQuota ?? ""} className={inputClass} />
        </Field>
        <Field label="Shareholder quota (shares)">
          <input name="reservation.shareholderQuota" inputMode="numeric" defaultValue={ipo.reservation.shareholderQuota ?? ""} className={inputClass} />
        </Field>
      </Section>

      <Section title="Documents">
        <Field label="RHP URL" wide>
          <input name="documents.rhpUrl" type="url" defaultValue={ipo.documents.rhpUrl ?? ""} className={inputClass} />
        </Field>
        <Field label="DRHP URL" wide>
          <input name="documents.drhpUrl" type="url" defaultValue={ipo.documents.drhpUrl ?? ""} className={inputClass} />
        </Field>
        <input type="hidden" name="documents.storedPdfKey" value={ipo.documents.storedPdfKey ?? ""} />
      </Section>

      <div className="sticky bottom-0 -mx-1 flex items-center gap-3 border-t border-line bg-canvas/95 px-1 py-3 backdrop-blur">
        <button type="submit" disabled={pending} className={buttonClass.primary}>
          {pending ? "Saving…" : "Save changes"}
        </button>
        <span className="text-xs text-muted">Subscription and listing figures come from the jobs and are not edited here.</span>
      </div>
    </form>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="rounded-xl border border-line bg-surface p-5">
      <legend className="px-1 text-base font-semibold">{title}</legend>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
    </fieldset>
  );
}

function Field({ label, hint, wide, children }: { label: string; hint?: string; wide?: boolean; children: ReactNode }) {
  return (
    <label className={`flex flex-col gap-1 text-sm font-medium ${wide ? "sm:col-span-2" : ""}`}>
      {label}
      {children}
      {hint ? <span className="text-xs font-normal text-muted">{hint}</span> : null}
    </label>
  );
}

function Select({ name, value, options }: { name: string; value: string; options: readonly string[] }) {
  return (
    <select name={name} defaultValue={value} className={inputClass}>
      {options.map((o) => (
        <option key={o} value={o}>
          {title(o)}
        </option>
      ))}
    </select>
  );
}
