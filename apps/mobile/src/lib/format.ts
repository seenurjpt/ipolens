// Display formatting. All dates render in IST regardless of the device's time zone.

const IST_OFFSET_MS = 330 * 60_000;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** The IST wall-clock fields of a moment. */
function ist(date: Date) {
  const d = new Date(date.getTime() + IST_OFFSET_MS);
  return { year: d.getUTCFullYear(), month: d.getUTCMonth(), day: d.getUTCDate(), hours: d.getUTCHours(), minutes: d.getUTCMinutes() };
}

export const isSameIstDay = (a: Date, b: Date) => {
  const x = ist(a);
  const y = ist(b);
  return x.year === y.year && x.month === y.month && x.day === y.day;
};

/** "22 Oct" */
export function formatDay(date: Date | undefined): string {
  if (!date) return 'TBA';
  const { day, month } = ist(date);
  return `${day} ${MONTHS[month]}`;
}

/** "22 Oct, 2:30 PM" */
export function formatDayTime(date: Date): string {
  const { hours, minutes } = ist(date);
  const h12 = hours % 12 || 12;
  return `${formatDay(date)}, ${h12}:${String(minutes).padStart(2, '0')} ${hours < 12 ? 'AM' : 'PM'}`;
}

/** Indian digit grouping: 1234567 -> "12,34,567". */
function groupIndian(n: number): string {
  const [int, frac] = Math.abs(n).toFixed(2).split('.') as [string, string];
  const last3 = int.slice(-3);
  const rest = int.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ',');
  const grouped = rest ? `${rest},${last3}` : last3;
  return `${n < 0 ? '-' : ''}${grouped}${frac === '00' ? '' : `.${frac}`}`;
}

/** Paise -> "₹14,820" (paise shown only when non-zero). */
export const formatRupees = (paise: number) => `₹${groupIndian(paise / 100)}`;

/** Paise -> "₹820 Cr" */
export function formatCrore(paise: number): string {
  const crore = paise / 1e9;
  return `₹${groupIndian(Number(crore.toFixed(crore < 100 ? 2 : 0)))} Cr`;
}

export function formatPriceBand(band: { minPaise: number; maxPaise: number }): string {
  return band.minPaise === band.maxPaise
    ? formatRupees(band.maxPaise)
    : `${formatRupees(band.minPaise)} – ${formatRupees(band.maxPaise).slice(1)}`;
}

/** Subscription multiple: one decimal and an x suffix (SPEC: UX rules). */
export const formatMultiple = (x: number) => `${x.toFixed(1)}x`;

export const formatPct = (pct: number) => `${pct > 0 ? '+' : ''}${pct.toFixed(2)}%`;

export const formatShares = (n: number) => groupIndian(n);

/** "just now", "3 min ago", "2 h ago", "4 d ago" */
export function formatAgo(date: Date, now = Date.now()): string {
  const mins = Math.floor((now - date.getTime()) / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} h ago`;
  return `${Math.floor(hours / 24)} d ago`;
}

/** Bidding closes at 5 PM IST on the close date. */
export const biddingEndsAt = (close: Date) => new Date(close.getTime() + 17 * 3_600_000);

/** formatCountdown(close, 'Closes in', 'Closed') -> "Closes in 1d 4h", "Closes in 3h 20m", "Closed" */
export function formatCountdown(target: Date, futurePrefix: string, pastLabel: string, now = Date.now()): string {
  const mins = Math.floor((target.getTime() - now) / 60_000);
  if (mins <= 0) return pastLabel;
  const d = Math.floor(mins / 1440);
  const h = Math.floor((mins % 1440) / 60);
  const m = mins % 60;
  return `${futurePrefix} ${d > 0 ? `${d}d ${h}h` : h > 0 ? `${h}h ${m}m` : `${m}m`}`;
}

/** True between 10:00 and 17:00 IST, when exchanges publish live bid data. */
export function isBiddingHours(now = new Date()): boolean {
  const { hours } = ist(now);
  return hours >= 10 && hours < 17;
}
