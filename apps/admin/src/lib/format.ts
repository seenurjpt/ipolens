// Display and form conversions. Dates show in IST; money is stored in paise.

const IST_OFFSET_MS = 330 * 60_000;
const PAISE_PER_CRORE = 1e9; // 1 crore rupees = 10^7 rupees = 10^9 paise

const inr = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

/** 1500050 paise -> "₹15,000.5" */
export const formatRupees = (paise: number) => `₹${inr.format(paise / 100)}`;

/** Paise -> "₹820 Cr" */
export const formatCrore = (paise: number) => `₹${inr.format(paise / PAISE_PER_CRORE)} Cr`;

export const formatMultiple = (x: number) => `${x.toFixed(1)}x`;

/** "22 Oct 2026" in IST */
export function formatDate(date: Date | undefined): string {
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" }).format(date);
}

/** "22 Oct, 2:30 pm" in IST */
export function formatDateTime(date: Date | undefined): string {
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  }).format(date);
}

// ---------- form <-> stored values ----------

/** Stored date (IST midnight) -> "2026-10-22" for <input type="date">. */
export function toDateInput(date: Date | undefined): string {
  if (!date) return "";
  return new Date(date.getTime() + IST_OFFSET_MS).toISOString().slice(0, 10);
}

/** "2026-10-22" -> IST midnight as a UTC Date; empty -> undefined. */
export function fromDateInput(value: string): Date | undefined {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!m) return undefined;
  return new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])) - IST_OFFSET_MS);
}

export const paiseToRupeesInput = (paise: number | undefined) => (paise === undefined ? "" : String(paise / 100));
export const paiseToCroreInput = (paise: number | undefined) => (paise === undefined ? "" : String(paise / PAISE_PER_CRORE));

/** Parses a number field; empty -> undefined, junk -> NaN (rejected by the schema). */
export function numberInput(value: FormDataEntryValue | null): number | undefined {
  const s = typeof value === "string" ? value.replace(/,/g, "").trim() : "";
  return s === "" ? undefined : Number(s);
}

export const rupeesToPaise = (rupees: number | undefined) => (rupees === undefined ? undefined : Math.round(rupees * 100));
export const croreToPaise = (crore: number | undefined) => (crore === undefined ? undefined : Math.round(crore * PAISE_PER_CRORE));
