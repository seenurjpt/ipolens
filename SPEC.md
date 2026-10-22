# IPO Tracker App — Build Spec

Oct 22, 2026 · @Claude

## Overview

The MVP is an Android-first IPO tracker for Indian retail investors that does five things: live IPO listings, live subscription, one-tap allotment check, an AI analysis report, and alerts. The working name here is **IPOLens**; rename it freely. It is modelled on IPO Trend (com.ipopulse.trend, 1L+ installs, 4.5 stars), but it wins on UX and the depth of the AI report rather than on raw data.

**MVP scope (v1)**

- Mainboard and SME IPO lists: upcoming, open, closed, and listed
- IPO detail page: dates, price band, lot size, issue size, registrar, lead managers, and the DRHP/RHP link
- Live subscription by category (QIB, NII split into bNII and sNII, Retail, Employee, Total), polled while bidding is open
- Allotment check: the registrar's page opens in an in-app WebView with the PAN pre-filled. The user solves the CAPTCHA.
- AI report: a business summary, financials table, pros and cons, key risks, valuation vs peers, and a 0–100 analysis score with a breakdown
- "My IPOs": IPOs the user marks as applied, across multiple saved PANs (family accounts)
- Push alerts: IPO opens, last day, allotment date, listing date, plus a subscription milestone such as Retail crossing 1x
- Listing-day tracker: listing price vs issue price, and gain or loss per lot

**Non-goals for v1**

- Placing bids. Users bid through their broker or UPI, and the app deep-links to it at most.
- Automating any registrar or exchange login, or solving CAPTCHAs
- Buy or avoid recommendations
- An iOS release. The Expo codebase keeps it possible later.

**Differentiators, taken from competitor reviews**

- Applied IPOs and allotment sit on the home tab, never buried in Settings
- The open IPO list is sorted by closing date, earliest first
- Allotment status is driven by the registrar's actual result date, so it never shows "pending" after allotment is done
- Multi-PAN family tracking
- A transparent AI score where every point traces back to a DRHP figure

**GMP decision:** v1 ships without GMP. Phase 3 adds it only if there is a licensed or self-collected source (see Data sources). Copying it from competitor sites is out.

## Tech stack and repo structure

Use one TypeScript monorepo (pnpm workspaces + Turborepo). It holds three deployables, the mobile app, the API and the worker, plus a shared package for types and Zod schemas.

| Layer | Choice | Why |
| --- | --- | --- |
| Mobile | Expo (React Native) SDK latest, Expo Router, TypeScript | One codebase, OTA updates via EAS Update, easy FCM |
| UI | NativeWind (Tailwind) + react-native-reanimated | Fast to style, smooth lists |
| Server state | TanStack Query | Caching, background refetch for live subscription |
| Local state | Zustand + MMKV | Saved PANs (encrypted), preferences |
| API | Node 20, Fastify, TypeScript, Zod | Fast, schema-first, typed routes |
| DB | MongoDB Atlas + Mongoose | Fits your MERN background; flexible IPO documents |
| Cache / queue | Redis (Upstash or self-hosted) + BullMQ | Live subscription cache, scheduled scrape and alert jobs |
| Scraping | undici/fetch + cheerio; Playwright only where a page needs JS | Light by default |
| PDF parsing | pdf-parse or unpdf; fallback to LLM vision on scanned pages | DRHP/RHP extraction |
| LLM | Anthropic Claude (primary), OpenAI (fallback) via a thin provider interface | Report generation with structured JSON output |
| Auth | Firebase Auth (phone OTP or Google) | Free tier, works with FCM |
| Push | Firebase Cloud Messaging via expo-notifications | Standard on Android |
| Admin | Next.js admin panel (same monorepo) | Review AI reports, fix data, trigger jobs |
| Hosting | API + worker on Railway / Render / a small VPS; Atlas M0→M10 | Cheap to start |
| Monitoring | Sentry (app + API), BullMQ dashboard, uptime pings on scrapers | Scrapers break silently without it |

```text
ipolens/
  apps/
    mobile/          # Expo app (Expo Router)
      app/           # routes: (tabs)/home, (tabs)/ipos, (tabs)/my-ipos, (tabs)/settings, ipo/[slug], allotment/[slug]
      components/
      lib/           # api client, query hooks, pan-vault
    api/             # Fastify REST API
      src/routes/
      src/services/
      src/models/    # Mongoose models
    worker/          # BullMQ processors: scrapers, ai-report, alerts
      src/jobs/
      src/sources/   # nse.ts, bse.ts, registrars/*.ts, drhp.ts
    admin/           # Next.js admin panel
  packages/
    shared/          # Zod schemas, TS types, enums, constants (registrar list)
    config/          # eslint, tsconfig
```

## Data sources and ingestion jobs

The exchanges (NSE and BSE) and SEBI filings are the source of truth. Every source sits behind an adapter that returns one normalised `IpoSnapshot`, so a broken site touches a single file. There are no official free APIs. The exchange website JSON endpoints are unofficial, need session cookies, and change without notice, so treat them as fragile and test them first.

&#91;embedded content: system architecture · sources, worker, stores, API, app\]

The app never scrapes. The one exception is the allotment WebView, which loads the registrar page directly on the user's phone.

| Data | Source | Method | Frequency |
| --- | --- | --- | --- |
| Upcoming / current issues | NSE website (current and upcoming issue pages), BSE public issues page | HTTP + cookie warm-up, JSON or HTML parse | Every 30 min, 08:00–20:00 IST |
| Issue details (price band, lot, dates, registrar, lead managers) | NSE/BSE issue page + RHP cover page | Parse; LLM fallback on the RHP for missing fields | On discovery + daily until listing |
| Live subscription by category | NSE and BSE bid details pages | Poll and merge both exchanges | Every 5 min while open (10:00–17:30 IST); final at 18:00 |
| DRHP / RHP / prospectus PDF | SEBI public issues filings, exchange issue page | Download PDF to object storage (R2/S3) | On filing; re-check when RHP lands |
| Allotment result date and status | Registrar sites: KFin Technologies, MUFG Intime (formerly Link Intime), Bigshare, Skyline, Cameo, Purva, Maashitla and others | Check whether the registrar has published the IPO in its dropdown | Hourly on allotment day, from T+1 |
| Listing price and day performance | NSE/BSE quote on listing day | Poll | Every 5 min on listing day; close snapshot |
| GMP (phase 3, optional) | A licensed data feed, or your own panel of dealer contacts entered in the admin | Manual or partner API only | 2–3 times a day |

**Job design (BullMQ)**

1. `discover-ipos` (repeatable, every 30 min) upserts IPOs by `isin` or exchange symbol and queues `enrich-ipo` for new or changed ones.
2. `enrich-ipo` fills details, downloads the DRHP/RHP, and queues `ai-report` once the RHP exists.
3. `poll-subscription` runs every 5 min, only for IPOs whose status is `open`. It writes the latest snapshot to Redis (`sub:{ipoId}`) and appends to the `subscriptionSnapshots` collection every 15 min for the history chart.
4. `check-allotment-published` runs on and after the allotment date. When the IPO appears on its registrar's page, it flips `allotmentStatus` to `published` and queues `notify-allotment`.
5. `listing-tracker` runs on listing day and writes the open, high, low and close.
6. `status-transition` (every 10 min) moves IPOs through `upcoming → open → closed → allotment → listed` by date, so the status never relies on scraping alone.

**Scraper rules**

- Send a real User-Agent, warm up cookies, back off on 401/403, and cap requests to one every 2–3 s per host.
- Store the raw response (gzipped) for 7 days. A broken parser can then be fixed and re-run without re-scraping.
- Every adapter has a fixture-based unit test. A daily canary job alerts you on Telegram or email when a parser returns empty or invalid data.
- Never automate registrar CAPTCHAs or log in on a user's behalf.

## Data model (MongoDB)

The model has seven collections. `ipos` is the hub, and everything else references `ipoId`. Money is stored in paise as integers, and every timestamp is UTC, rendered in IST.

```ts
// ipos
{
  _id, slug: 'acme-industries-ipo', name, symbol, isin?,
  board: 'MAINBOARD' | 'SME', exchanges: ('NSE'|'BSE')[], issueType: 'BOOK_BUILT' | 'FIXED',
  status: 'UPCOMING'|'OPEN'|'CLOSED'|'ALLOTMENT'|'LISTED'|'WITHDRAWN',
  priceBand: { minPaise, maxPaise }, lotSize, minInvestmentPaise,
  issueSizePaise, freshIssuePaise, ofsPaise,
  dates: { open, close, allotment, refundInitiation, dematCredit, listing },
  registrar: { code: 'KFIN'|'MUFG_INTIME'|'BIGSHARE'|..., name, allotmentUrl },
  leadManagers: string[], industry, logoUrl,
  reservation: { qibPct, niiPct, retailPct, employeeQuota?, shareholderQuota? },
  documents: { drhpUrl?, rhpUrl?, storedPdfKey? },
  latestSubscription?: SubscriptionSnapshot,   // denormalised for list views
  listing?: { pricePaise, openPaise, closePaise, gainPct },
  aiReportId?, sourceRefs: { nse?: string, bse?: string },
  createdAt, updatedAt
}
// indexes: { slug: 1 } unique, { status: 1, 'dates.close': 1 }, { board: 1, status: 1 }

// subscriptionSnapshots   (time series; TTL not needed, small)
{ ipoId, at, qib, nii, bnii, snii, retail, employee?, total, source: 'NSE'|'BSE'|'MERGED' }
// index: { ipoId: 1, at: -1 }

// aiReports
{
  ipoId, version, model, sourceDocKey, createdAt, reviewedBy?, published: boolean,
  summary, business: { model, segments[], customers? },
  financials: [{ fy: 'FY24', revenueCr, ebitdaCr, patCr, netWorthCr, debtCr, roePct, rocePct }],
  valuation: { postIssuePe?, peerPe: [{ name, pe }], marketCapCr },
  pros: [{ text, evidence: { page, quote } }], cons: [...], risks: [...],
  score: { total: 0-100, breakdown: { growth, profitability, balanceSheet, valuation, governance, subscriptionSignal } },
  disclaimerVersion
}

// users
{ _id, firebaseUid, phone?, email?, fcmTokens: [{ token, platform, updatedAt }], createdAt }

// pans   (encrypted; see Compliance)
{ userId, label: 'Self'|'Mom'|..., panEnc, panLast4, panHash, createdAt }

// applications   ("My IPOs")
{ userId, ipoId, panId, category: 'RETAIL'|'SHNI'|'BHNI'|'EMPLOYEE'|'SHAREHOLDER', lots,
  allotment: 'UNKNOWN'|'ALLOTTED'|'NOT_ALLOTTED', sharesAllotted?, markedAt }
// index: { userId: 1, ipoId: 1, panId: 1 } unique

// alertSubscriptions
{ userId, ipoId?, type: 'OPEN'|'LAST_DAY'|'ALLOTMENT_OUT'|'LISTING'|'SUB_MILESTONE'|'NEW_IPO', enabled }
```

Allotment results are never stored automatically, because the user checks them on the registrar's page. The user taps "Allotted" or "Not allotted" afterwards, and that feeds the listing-day profit and loss.

## Backend API routes

All routes live under `/v1` and return Zod-validated JSON. Public routes are cached at the edge for 60 s, or 15 s for subscription. User routes need a Firebase ID token in `Authorization: Bearer`.

| Method | Route | Auth | Returns |
| --- | --- | --- | --- |
| GET | `/v1/ipos?status=OPEN&board=SME&sort=closeAsc&page=1` | Public | Paginated list cards (name, logo, band, dates, latest subscription) |
| GET | `/v1/ipos/:slug` | Public | Full IPO detail + registrar + documents |
| GET | `/v1/ipos/:slug/subscription` | Public | Latest snapshot (from Redis) + history series for the chart |
| GET | `/v1/ipos/:slug/report` | Public | Published AI report, or 404 while pending |
| GET | `/v1/calendar?from=&to=` | Public | Open, close, allotment and listing events for a calendar view |
| GET | `/v1/listings/recent` | Public | Recent listings with listing gain % |
| GET | `/v1/registrars/:code` | Public | Allotment URL + which form field takes the PAN (used by the WebView) |
| POST | `/v1/me/devices` | User | Register or refresh FCM token |
| GET / POST / DELETE | `/v1/me/pans` | User | List (label + last4 only), add, remove saved PANs |
| GET | `/v1/me/pans/:id/reveal` | User + re-auth | Full PAN, only to pre-fill the registrar WebView |
| GET / POST / PATCH | `/v1/me/applications` | User | My IPOs: mark applied, set allotment result, lots |
| GET | `/v1/me/portfolio` | User | Listing-day P&L across applications |
| GET / PUT | `/v1/me/alerts` | User | Alert preferences, global and per IPO |
| POST | `/v1/admin/jobs/:name` | Admin | Trigger a job manually |
| PATCH | `/v1/admin/ipos/:id`, `/v1/admin/reports/:id/publish` | Admin | Fix data; approve AI report |

**Rules**

- Rate-limit per IP (`@fastify/rate-limit`): 120 requests/min public, 30/min on `/me/pans/*`.
- Never return a full PAN except from `/reveal`, and never log it. Add a Pino redaction path for `pan*`.
- Every response carries `asOf`, so the app can show "Updated 3 min ago".

## AI analysis pipeline

The score is computed in code from figures the LLM extracts. The LLM never invents the number. It extracts and summarises, a deterministic function scores, and a human approves the report before it goes live.

1. **Fetch and split.** Download the RHP (fall back to the DRHP) and extract text page by page with page numbers kept. Locate the key sections by heading match: "Our Business", "Risk Factors", "Restated Financial Information", "Objects of the Issue", "Basis for Issue Price", "Outstanding Litigation". A 400-page RHP shrinks to about 40–60 relevant pages.
2. **Extract (structured).** Run one Claude call per section with a strict JSON schema enforced through tool use, and validate with Zod. Fields: 3 fiscal years of revenue, EBITDA, PAT, net worth and debt; RoE and RoCE; the objects of the issue split by fresh issue vs OFS; promoter holding pre and post; listed peers with P/E from "Basis for Issue Price"; and litigation counts. Each value carries `{ value, page }`.
3. **Cross-check.** Recompute margins and growth in code. If the restated financials and the extracted totals differ by more than 2%, flag the report for review.
4. **Score (deterministic).** Weighted 0–100: growth 20 (revenue/PAT CAGR), profitability 20 (EBITDA margin, RoE), balance sheet 15 (D/E, cash flow), valuation 20 (post-issue P/E vs peer median), governance 15 (OFS share, promoter dilution, litigation, related-party share), subscription signal 10 (QIB multiple, filled after close). Thresholds live in a config file you can tune.
5. **Write.** One more LLM call turns the extracted JSON into a plain-English summary: 5 pros and 5 cons, each tied to an evidence page, and the top risks. The prompt forbids the words "buy", "subscribe", "avoid" and "apply".
6. **Review gate.** The report saves as `published: false`. You check it in the admin panel with the evidence page numbers linked to the PDF, and only then publish.
7. **Refresh.** Re-run the score after subscription closes to add the subscription signal. Bump `version` and keep the old one.

**Cost and model notes**

- Use a smaller, faster Claude model for section extraction and a stronger one for the final write-up. Prompt caching on the shared system prompt and schema cuts repeat cost.
- Budget roughly 150k–250k input tokens per IPO after section filtering. Check current pricing on docs.claude.com before setting a per-IPO budget.
- Keep a `provider` interface (`extract()`, `write()`) so OpenAI can be swapped in.

**Evaluation:** build a fixture set of 10 past IPOs with hand-checked financials. CI fails if extraction accuracy on those fields drops below 95%.

## Mobile app screens

The app has four bottom tabs, and My IPOs is one tap from anywhere. Expo Router handles routing, and every list uses `FlashList` with pull-to-refresh.

| Route | Screen | Contents |
| --- | --- | --- |
| `(tabs)/home` | Home | "Closing today" strip, open IPOs sorted by close date (earliest first), "Allotment out" banner for your applied IPOs, recent listings with gain % |
| `(tabs)/ipos` | Explore | Segmented: Upcoming / Open / Closed / Listed; filter Mainboard / SME; search |
| `ipo/[slug]` | IPO detail | Header (logo, band, lot, min investment, status chip, countdown); tabs: Overview, Subscription (live table + line chart by category), AI Report, Documents; sticky "Mark as applied" + "Check allotment" |
| `ipo/[slug]/report` | AI report | Score ring with breakdown bars, financials table, pros/cons with "page 142" evidence links, risks, peer valuation, disclaimer |
| `(tabs)/my-ipos` | My IPOs | Grouped by status; each card shows PAN label, lots, allotment result, listing P\&L; total P&L header |
| `allotment/[slug]` | Allotment check | PAN picker → WebView of the registrar's page with the IPO and PAN pre-filled by injected JS; user solves CAPTCHA; afterwards prompt "Were you allotted?" |
| `(tabs)/settings` | Settings | Saved PANs (add / remove, biometric lock), alert toggles, theme, language (EN / HI / GU later), about + disclaimer |
| `onboarding` | Onboarding | 3 slides, login (phone OTP / Google), notification permission, optional first PAN |

**UX rules**

- Show "Updated X min ago" on every live number. Grey it out when the data is more than 30 min stale during bidding.
- Subscription numbers use one decimal and an "x" suffix (12.4x). Colour shows only whether a category is under or over 1x.
- Logged-out users can browse everything. Login is needed only for My IPOs, PANs and alerts.
- Show one disclaimer line on the report and detail screens. The full text lives in Settings.
- Ads, if used, are native ads in lists only. Never interstitials on the allotment flow.

## Notifications

Alerts are scheduled from IPO dates as delayed BullMQ jobs, then sent through FCM in batches of 500 tokens. The job reschedules itself if the dates change.

| Alert | Trigger | Default | Audience |
| --- | --- | --- | --- |
| New IPO announced | `discover-ipos` creates a mainboard IPO | On | All users with the global toggle on |
| IPO opens today | `dates.open` 09:30 IST | On | All |
| Last day to apply | `dates.close` 10:00 IST | On | All, minus users who marked it applied |
| Retail crosses 1x / QIB crosses 10x | `poll-subscription` detects the crossing | Off | Users following that IPO |
| Allotment out | `check-allotment-published` flips status | On | Users with an application for that IPO |
| Listing today + listing price | `listing-tracker` first quote | On | Applicants + followers |
| AI report ready | Report published | On | Followers |

**Rules**

- Cap each user at 3 pushes a day, and use collapse keys per IPO so updates replace each other.
- Respect quiet hours: no sends between 21:00 and 08:00 IST.
- Each notification deep-links to `ipo/[slug]` or `allotment/[slug]`.
- Remove dead FCM tokens on `UNREGISTERED` responses.

## Compliance, privacy and Play Store

The app is an information tool, not investment advice, and every screen, prompt and store listing must read that way. You are not a SEBI-registered research analyst or adviser. Get a short review from a lawyer before launch; this section is a checklist, not legal advice.

**SEBI positioning**

- No "buy", "subscribe", "avoid" or target prices anywhere: not in the AI output, the push copy, or the store listing.
- Call the score an "Analysis score" built from disclosed financials, and show its breakdown so it reads as a summary, not a rating.
- If GMP is ever added, label it as an unofficial, unregulated market indicator. Keep it out of the score.
- The disclaimer text is versioned (`disclaimerVersion`) and shown on the report, the detail screen and in onboarding.

**PAN and personal data (India's DPDP Act)**

- Collect only what you need: phone or email, FCM token, and optional PANs with a user label.
- Encrypt PANs at the field level with AES-256-GCM, using a key from a KMS (AWS KMS or GCP KMS), never from the repo. Store `panHash` (HMAC) for de-duplication and `panLast4` for display.
- Offer an on-device-only option: PANs kept just in encrypted MMKV and never sent to the server. Consider making this the default.
- Ask for explicit consent at PAN entry, give a clear purpose line, and let users delete their account and data in Settings.
- Publish a privacy policy that names the data, the purposes, the processors (Firebase, MongoDB Atlas, Anthropic) and a grievance contact.

**Google Play**

- Category: Finance. Complete the financial features declaration, and declare the app as not offering personal loans or trading.
- Fill the Data safety form to match the above: PAN as "Financial info / other", encrypted in transit, deletable.
- The WebView only loads registrar domains on an allowlist. JS injection only fills the PAN field and never reads results or CAPTCHA images.
- Third-party content: show exchange data with "Source: NSE/BSE" and the as-of time. Don't present it as official.

## Build phases and Cursor prompts

The build runs in four phases over about 8 weeks solo, and each phase ends with something you can demo. Paste the prompts below into Cursor in order, keeping this whole doc in the project as `SPEC.md` and @-mentioning it.

**Prompt 0 — scaffold (week 1)**

```text
Read @SPEC.md. Scaffold the monorepo exactly as in "Tech stack and repo structure": pnpm workspaces + Turborepo, apps/mobile (Expo Router, TypeScript, NativeWind), apps/api (Fastify + Zod + Mongoose), apps/worker (BullMQ), apps/admin (Next.js App Router), packages/shared (Zod schemas + types), packages/config. Add docker-compose for MongoDB and Redis, a root .env.example, and `pnpm dev` that runs api, worker and mobile together. Do not implement features yet. Output the file tree, then the files.
```

**Prompt 1 — data model and shared schemas (week 1)**

```text
Using @SPEC.md "Data model", create Zod schemas in packages/shared for every collection, then Mongoose models in apps/api/src/models that infer from them. Money in paise as integers. Add the listed indexes. Add a seed script with 6 fake IPOs covering every status, both boards, and subscription history.
```

**Prompt 2 — read API (week 2)**

```text
Implement the Public routes from @SPEC.md "Backend API routes" in apps/api. Response schemas come from packages/shared. Add asOf to every response, @fastify/rate-limit, Pino with redaction for any field matching /pan/i, and Vitest + supertest tests against the seed data.
```

**Prompt 3 — mobile read-only app (weeks 2–3)**

```text
Build apps/mobile per @SPEC.md "Mobile app screens" for logged-out users: tabs, Home, Explore, IPO detail with Overview + Subscription tabs (line chart with victory-native), using TanStack Query against the API. Open IPOs sorted by close date ascending. Show "Updated X min ago" and stale greying. No auth yet.
```

**Prompt 4 — NSE/BSE adapters and jobs (weeks 3–4)**

```text
In apps/worker, implement source adapters (src/sources/nse.ts, bse.ts) returning a normalised IpoSnapshot, plus the BullMQ jobs discover-ipos, enrich-ipo, poll-subscription, status-transition per @SPEC.md "Data sources and ingestion jobs". Cookie warm-up, 1 req per 2–3 s per host, exponential backoff, raw response archived gzipped for 7 days, fixture-based tests per adapter, and a daily canary that alerts on empty output. I will paste real responses into __fixtures__ — write parsers against those, never guess field names.
```

**Prompt 5 — auth, PANs, My IPOs, allotment WebView (weeks 4–5)**

```text
Add Firebase Auth (phone OTP + Google) to mobile and verify ID tokens in the API. Implement /v1/me/* routes and the PAN vault per @SPEC.md "Compliance": AES-256-GCM with a KMS key, panHash, panLast4, reveal requires recent re-auth. Mobile: Settings > Saved PANs with biometric lock, My IPOs tab, and allotment/[slug] — a WebView limited to an allowlist of registrar domains that only fills the PAN field via injected JS; after close, ask "Were you allotted?" and save it.
```

**Prompt 6 — AI report pipeline (weeks 5–6)**

```text
Implement the ai-report job per @SPEC.md "AI analysis pipeline": PDF fetch + page-wise text, section location, per-section extraction via Anthropic tool use with a strict JSON schema validated by Zod (every value carries its page), cross-check in code, deterministic score from a config file, write-up call that bans the words buy/subscribe/avoid/apply, save as unpublished. Add a provider interface so OpenAI can be swapped in. Add an eval script over __fixtures__/ipos/*.json that fails below 95% field accuracy.
```

**Prompt 7 — admin, notifications, launch (weeks 7–8)**

```text
Build apps/admin: IPO list with editable fields, AI report review with evidence page links opening the PDF at that page, publish button, and manual job triggers. Implement notifications per @SPEC.md "Notifications" with delayed BullMQ jobs, FCM batching, collapse keys, quiet hours and a daily cap. Then add Sentry to all apps, EAS build profiles, and a Play Store checklist file covering Data safety and the financial features declaration.
```

**Open questions**

- [ ] App name and package id: check Play Store and trademark availability
- [ ] Store PANs on the server, or on the device only by default?
- [ ] Monetisation for v1: none, ads, or a premium AI report tier?
- [ ] GMP in phase 3: is there a licensed source worth paying for, or drop it?
