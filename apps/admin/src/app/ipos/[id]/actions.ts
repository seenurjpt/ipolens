"use server";

import { AdminIpoResponse, IpoPatch, REGISTRARS, RegistrarCode } from "@ipolens/shared";
import { refresh } from "next/cache";

import { ApiError, adminPatch } from "@/lib/api";
import { croreToPaise, fromDateInput, numberInput, rupeesToPaise } from "@/lib/format";

export interface SaveState {
  ok: boolean;
  errors: string[];
  savedAt?: number;
}

const FIELD_LABELS: Record<string, string> = {
  name: "Name",
  slug: "Slug",
  symbol: "Symbol",
  isin: "ISIN",
  exchanges: "Exchanges",
  industry: "Industry",
  logoUrl: "Logo URL",
  "priceBand.minPaise": "Price band (low)",
  "priceBand.maxPaise": "Price band (high)",
  priceBand: "Price band",
  lotSize: "Lot size",
  issueSizePaise: "Issue size",
  freshIssuePaise: "Fresh issue",
  ofsPaise: "Offer for sale",
  "registrar.allotmentUrl": "Allotment URL",
  "reservation.qibPct": "QIB %",
  "reservation.niiPct": "NII %",
  "reservation.retailPct": "Retail %",
  "reservation.employeeQuota": "Employee quota",
  "reservation.shareholderQuota": "Shareholder quota",
  "documents.drhpUrl": "DRHP URL",
  "documents.rhpUrl": "RHP URL",
};

const text = (form: FormData, key: string) => {
  const v = form.get(key);
  return typeof v === "string" && v.trim() !== "" ? v.trim() : undefined;
};
const num = (form: FormData, key: string) => numberInput(form.get(key));

/** Turns the edit form into an IpoPatch. Every section is sent, so the form is the source of truth. */
function patchFromForm(form: FormData): unknown {
  const code = RegistrarCode.safeParse(form.get("registrar.code"));
  const registrar = code.success
    ? {
        code: code.data,
        name: REGISTRARS[code.data].name,
        allotmentUrl: text(form, "registrar.allotmentUrl") ?? REGISTRARS[code.data].allotmentUrl,
      }
    : undefined;

  return {
    name: text(form, "name"),
    slug: text(form, "slug"),
    symbol: text(form, "symbol"),
    isin: text(form, "isin"),
    board: text(form, "board"),
    exchanges: form.getAll("exchanges").map(String),
    issueType: text(form, "issueType"),
    status: text(form, "status"),
    industry: text(form, "industry"),
    logoUrl: text(form, "logoUrl"),
    priceBand: { minPaise: rupeesToPaise(num(form, "priceMin")), maxPaise: rupeesToPaise(num(form, "priceMax")) },
    lotSize: num(form, "lotSize"),
    issueSizePaise: croreToPaise(num(form, "issueSizeCr")),
    freshIssuePaise: croreToPaise(num(form, "freshIssueCr")),
    ofsPaise: croreToPaise(num(form, "ofsCr")),
    dates: {
      open: fromDateInput(String(form.get("dates.open") ?? "")),
      close: fromDateInput(String(form.get("dates.close") ?? "")),
      allotment: fromDateInput(String(form.get("dates.allotment") ?? "")),
      refundInitiation: fromDateInput(String(form.get("dates.refundInitiation") ?? "")),
      dematCredit: fromDateInput(String(form.get("dates.dematCredit") ?? "")),
      listing: fromDateInput(String(form.get("dates.listing") ?? "")),
    },
    registrar,
    leadManagers: String(form.get("leadManagers") ?? "")
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean),
    reservation: {
      qibPct: num(form, "reservation.qibPct"),
      niiPct: num(form, "reservation.niiPct"),
      retailPct: num(form, "reservation.retailPct"),
      employeeQuota: num(form, "reservation.employeeQuota"),
      shareholderQuota: num(form, "reservation.shareholderQuota"),
    },
    documents: {
      drhpUrl: text(form, "documents.drhpUrl"),
      rhpUrl: text(form, "documents.rhpUrl"),
      storedPdfKey: text(form, "documents.storedPdfKey"),
    },
  };
}

export async function saveIpo(id: string, _prev: SaveState, form: FormData): Promise<SaveState> {
  const parsed = IpoPatch.safeParse(patchFromForm(form));
  if (!parsed.success) {
    const errors = parsed.error.issues.map((i) => {
      const path = i.path.join(".");
      return `${FIELD_LABELS[path] ?? (path || "Form")}: ${i.message}`;
    });
    return { ok: false, errors };
  }

  try {
    await adminPatch(`/ipos/${id}`, AdminIpoResponse, parsed.data);
  } catch (err) {
    return { ok: false, errors: [err instanceof ApiError ? err.message : "Saving failed"] };
  }
  refresh();
  return { ok: true, errors: [], savedAt: Date.now() };
}
