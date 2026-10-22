import Link from "next/link";
import type { ReactNode } from "react";

import { Badge, DownloadButton, Sticker, type StickerColor } from "@/components/brand";
import {
  IconAndroid,
  IconArrowRight,
  IconBell,
  IconCheckCircle,
  IconDocSearch,
  IconPlus,
  IconPulse,
  IconShield,
  IconTrend,
  IconUsers,
} from "@/components/icons";
import { Hero } from "@/components/hero";
import { getApk } from "@/lib/downloads";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Facts />
      <Features />
      <Analysis />
      <Privacy />
      <HowItWorks />
      <Download />
      <Faq />
    </>
  );
}

/* ───────────────────────────── Facts strip ───────────────────────────── */

function Facts() {
  const facts: { dot: string; title: string; note: string }[] = [
    { dot: "bg-sticker-sky", title: "Mainboard + SME", note: "Every public issue on NSE and BSE" },
    { dot: "bg-sticker-green", title: "Live while bidding", note: "Subscription refreshed through the day" },
    { dot: "bg-sticker-purple", title: "7 registrars", note: "KFin, MUFG Intime, Bigshare and more" },
    { dot: "bg-sticker-orange", title: "PAN stays on your phone", note: "Encrypted, never on our servers" },
  ];
  return (
    <section aria-label="At a glance" className="border-b border-hairline bg-canvas">
      <div className="container-page grid grid-cols-2 gap-x-6 gap-y-6 py-10 lg:grid-cols-4">
        {facts.map((f) => (
          <div key={f.title} className="flex gap-3">
            <span className={`mt-2 size-2.5 shrink-0 rounded-full ${f.dot}`} aria-hidden="true" />
            <div>
              <p className="t-title text-[17px]">{f.title}</p>
              <p className="t-caption text-ink-muted">{f.note}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ───────────────────────────── Features ───────────────────────────── */

function SectionHeading({ eyebrow, title, intro }: { eyebrow: string; title: string; intro?: string }) {
  return (
    <div className="max-w-2xl">
      <Badge>{eyebrow}</Badge>
      <h2 className="t-heading-1 mt-4">{title}</h2>
      {intro ? <p className="mt-4 text-[18px] leading-[1.55] text-ink-muted">{intro}</p> : null}
    </div>
  );
}

function FeatureCard({
  sticker,
  icon,
  title,
  children,
  preview,
}: {
  sticker: StickerColor;
  icon: ReactNode;
  title: string;
  children: ReactNode;
  preview: ReactNode;
}) {
  return (
    <article className="flex flex-col overflow-hidden rounded-lg border border-hairline bg-surface">
      <div className="border-b border-hairline bg-canvas-soft/60 p-5">{preview}</div>
      <div className="flex flex-1 flex-col gap-2 p-6">
        <Sticker color={sticker}>{icon}</Sticker>
        <h3 className="t-heading-3 mt-3">{title}</h3>
        <p className="text-ink-muted">{children}</p>
      </div>
    </article>
  );
}

/** A tiny white panel used inside feature previews. */
function Mini({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-md border border-hairline bg-surface p-3 shadow-soft ${className}`}>{children}</div>;
}

function Features() {
  return (
    <section id="features" className="scroll-mt-20 py-20 md:py-28">
      <div className="container-page">
        <SectionHeading
          eyebrow="Features"
          title="Everything about an IPO, in one calm place."
          intro="No more juggling exchange pages, registrar sites and spreadsheets. IPOLens brings the facts together and keeps them current."
        />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            sticker="sky"
            icon={<IconPulse size={20} />}
            title="Live subscription"
            preview={
              <Mini>
                {[
                  ["QIB", "18.6x"],
                  ["NII", "22.1x"],
                  ["Retail", "6.8x"],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between py-0.5 text-[13px]">
                    <span className="text-ink-muted">{k}</span>
                    <span className="font-semibold text-sticker-green">{v}</span>
                  </div>
                ))}
              </Mini>
            }>
            Category-wise demand for QIB, NII and retail, refreshed through bidding hours, with a chart of how it built
            up.
          </FeatureCard>

          <FeatureCard
            sticker="green"
            icon={<IconCheckCircle size={20} />}
            title="Allotment in one tap"
            preview={
              <Mini className="flex items-center justify-between">
                <span className="text-[13px] text-ink-muted">Self · 1 lot</span>
                <span className="rounded-full bg-sticker-green/12 px-2 py-0.5 text-[12px] font-semibold text-sticker-green">
                  Allotted
                </span>
              </Mini>
            }>
            Opens the registrar&apos;s own page with your PAN ready to fill. You solve the captcha; we never read your
            result.
          </FeatureCard>

          <FeatureCard
            sticker="purple"
            icon={<IconUsers size={20} />}
            title="The whole family"
            preview={
              <Mini className="flex flex-wrap gap-1.5">
                {["Self", "Mom", "Dad", "Spouse"].map((n) => (
                  <span key={n} className="rounded-full border border-hairline px-2.5 py-0.5 text-[12px]">
                    {n}
                  </span>
                ))}
              </Mini>
            }>
            Save every PAN at home and track who applied to what, with each person&apos;s allotment and listing result.
          </FeatureCard>

          <FeatureCard
            sticker="orange"
            icon={<IconDocSearch size={20} />}
            title="Analysis you can check"
            preview={
              <Mini className="flex items-center gap-3">
                <span className="text-[26px] font-bold tracking-[-0.5px]">61</span>
                <span className="text-[12px] leading-tight text-ink-muted">
                  Analysis score
                  <br />
                  from the RHP
                </span>
                <span className="ml-auto rounded-sm bg-canvas-soft px-1.5 py-0.5 text-[11px] font-semibold text-primary">
                  p. 212
                </span>
              </Mini>
            }>
            Financials, strengths, concerns and risks from the offer document, each linked to the page it came from.
          </FeatureCard>

          <FeatureCard
            sticker="pink"
            icon={<IconBell size={20} />}
            title="Alerts that matter"
            preview={
              <Mini>
                <p className="text-[12px] font-semibold">Last day to bid</p>
                <p className="text-[12px] text-ink-muted">Acme Industries closes at 5 PM today</p>
              </Mini>
            }>
            Opening day, last day, allotment out and listing day. Choose what you hear about, and nothing between 9 PM
            and 8 AM.
          </FeatureCard>

          <FeatureCard
            sticker="teal"
            icon={<IconTrend size={20} />}
            title="Listing-day results"
            preview={
              <Mini className="flex items-center justify-between">
                <span className="text-[13px] text-ink-muted">Gain per lot at listing</span>
                <span className="text-[14px] font-semibold text-sticker-green">+₹2,250</span>
              </Mini>
            }>
            See the listing price against the issue price and what it meant for each lot you were allotted.
          </FeatureCard>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────────── Analysis deep dive ───────────────────────────── */

const DIMENSIONS: [string, number, number][] = [
  ["Growth", 14, 20],
  ["Profitability", 13, 20],
  ["Balance sheet", 11, 15],
  ["Valuation", 12, 20],
  ["Governance", 11, 15],
];

function Analysis() {
  return (
    <section id="analysis" className="scroll-mt-20 border-y border-hairline bg-canvas py-20 md:py-28">
      <div className="container-page grid items-center gap-14 lg:grid-cols-2">
        <div>
          <SectionHeading
            eyebrow="Analysis report"
            title="A score you can trace back to the page."
            intro="We read the red herring prospectus so you don't have to start from page one. Every figure in the report points to where it appears in the document."
          />
          <ul className="mt-8 space-y-3">
            {[
              "Revenue, profit and debt for three years, checked against the restated financials",
              "Strengths, concerns and key risks, each with the page and the exact line quoted",
              "Valuation against listed peers named in the document",
              "A 0–100 analysis score with its full breakdown, so you see how it adds up",
            ].map((t) => (
              <li key={t} className="flex gap-3">
                <IconCheckCircle size={20} className="mt-0.5 shrink-0 text-sticker-green" />
                <span className="text-ink-secondary">{t}</span>
              </li>
            ))}
          </ul>
          <p className="t-caption mt-8 max-w-xl text-ink-muted">
            The score summarises disclosed figures. It is not a rating or a recommendation, and every report is reviewed
            by a person before it appears in the app.
          </p>
        </div>

        <div className="rounded-xl border border-hairline bg-surface p-6 shadow-elevated md:p-8">
          <div className="flex items-center gap-5">
            <ScoreRing value={61} />
            <div>
              <p className="t-title">Analysis score</p>
              <p className="t-caption text-ink-muted">Sample report · Acme Industries</p>
            </div>
          </div>
          <div className="mt-7 space-y-3.5">
            {DIMENSIONS.map(([label, value, max]) => (
              <div key={label}>
                <div className="flex justify-between text-[14px]">
                  <span className="font-medium">{label}</span>
                  <span className="text-ink-muted">
                    {value} / {max}
                  </span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-canvas-soft">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${(value / max) * 100}%` }} />
                </div>
              </div>
            ))}
            <div className="flex justify-between text-[14px] text-ink-faint">
              <span>Subscription signal</span>
              <span>after bidding closes</span>
            </div>
          </div>
          <div className="mt-7 rounded-lg bg-canvas-soft p-4">
            <p className="text-[15px] font-medium">Revenue grew at a 19% CAGR from FY24 to FY26</p>
            <p className="mt-2 flex items-start gap-2 text-[14px] text-ink-muted">
              <span className="shrink-0 rounded-sm bg-surface px-1.5 py-0.5 text-[12px] font-semibold text-primary">
                p. 212
              </span>
              <span className="italic">“Revenue from operations increased to ₹868.2 crore”</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function ScoreRing({ value }: { value: number }) {
  const r = 34;
  const c = 2 * Math.PI * r;
  return (
    <svg width="84" height="84" viewBox="0 0 84 84" role="img" aria-label={`Score ${value} out of 100`}>
      <circle cx="42" cy="42" r={r} fill="none" stroke="var(--color-canvas-soft)" strokeWidth="9" />
      <circle
        cx="42"
        cy="42"
        r={r}
        fill="none"
        stroke="var(--color-primary)"
        strokeWidth="9"
        strokeLinecap="round"
        strokeDasharray={`${(c * value) / 100} ${c}`}
        transform="rotate(-90 42 42)"
      />
      <text x="42" y="48" textAnchor="middle" fontSize="22" fontWeight="700" fill="currentColor">
        {value}
      </text>
    </svg>
  );
}

/* ───────────────────────────── Privacy ───────────────────────────── */

function Privacy() {
  return (
    <section id="privacy" className="scroll-mt-20 py-20 md:py-28">
      <div className="container-page">
        <div className="grid gap-10 rounded-xl border border-hairline bg-surface p-8 md:grid-cols-[auto_1fr] md:p-12">
          <span
            className="grid size-14 place-items-center rounded-xl bg-sticker-purple text-sticker-purple-deep"
            aria-hidden="true">
            <IconShield size={28} />
          </span>
          <div>
            <h2 className="t-heading-2">Your PAN never leaves your phone.</h2>
            <p className="mt-3 max-w-2xl text-[17px] text-ink-muted">
              IPOLens needs your PAN only to fill the box on the registrar&apos;s allotment page. So it lives in your
              phone&apos;s secure storage and nowhere else.
            </p>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                "Stored encrypted in the phone's keystore",
                "Never sent to IPOLens servers",
                "Optional fingerprint or screen lock before use",
                "Delete one PAN, or everything, any time",
              ].map((t) => (
                <li key={t} className="flex gap-2.5 text-ink-secondary">
                  <IconCheckCircle size={20} className="mt-0.5 shrink-0 text-sticker-green" />
                  {t}
                </li>
              ))}
            </ul>
            <Link
              href="/privacy/"
              className="mt-6 inline-flex items-center gap-1.5 font-medium text-primary hover:underline">
              Read the privacy policy <IconArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────────── How it works ───────────────────────────── */

function HowItWorks() {
  const steps = [
    { title: "Install IPOLens", body: "Browse every open, upcoming and listed IPO straight away. No sign-up needed." },
    {
      title: "Add your family's PANs",
      body: "Optional, and stored only on your phone. Mark which IPOs each person applied to.",
    },
    {
      title: "Follow it through",
      body: "Watch subscription live, check allotment in a tap, and see the listing-day result.",
    },
  ];
  return (
    <section aria-labelledby="how-title" className="border-t border-hairline bg-canvas py-20 md:py-28">
      <div className="container-page">
        <div className="max-w-2xl">
          <Badge>How it works</Badge>
          <h2 id="how-title" className="t-heading-1 mt-4">
            From announcement to listing day.
          </h2>
        </div>
        <ol className="mt-12 grid gap-5 md:grid-cols-3">
          {steps.map((s, i) => (
            <li key={s.title} className="rounded-lg border border-hairline bg-canvas-soft p-6">
              <span className="grid size-9 place-items-center rounded-full bg-ink text-[15px] font-semibold text-white">
                {i + 1}
              </span>
              <h3 className="t-title mt-5">{s.title}</h3>
              <p className="mt-1.5 text-ink-muted">{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ───────────────────────────── Download ───────────────────────────── */

function Download() {
  const android = getApk() ? "Available now" : "Coming soon";
  return (
    <section id="download" className="scroll-mt-20 py-20 md:py-28">
      <div className="container-page">
        <div className="mx-auto max-w-3xl rounded-xl border border-hairline bg-surface px-6 py-14 text-center shadow-soft md:px-14">
          <div className="mx-auto flex w-fit gap-2" aria-hidden="true">
            {["bg-sticker-sky", "bg-sticker-pink", "bg-sticker-orange", "bg-sticker-teal"].map((c) => (
              <span key={c} className={`size-3 rounded-full ${c}`} />
            ))}
          </div>
          <h2 className="t-heading-1 mt-6">Get IPOLens for Android.</h2>
          <p className="mx-auto mt-4 max-w-xl text-[18px] text-ink-muted">
            Free, and downloaded straight from this site.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <PlatformStatus icon={<IconAndroid size={18} />} name="Android" status={android} />
          </div>
          <div className="mt-8 flex justify-center">
            <DownloadButton />
          </div>
        </div>
      </div>
    </section>
  );
}

function PlatformStatus({ icon, name, status }: { icon: ReactNode; name: string; status: string }) {
  const live = status !== "Coming soon";
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-hairline bg-canvas-soft px-4 py-2 text-[15px]">
      {icon}
      <span className="font-medium">{name}</span>
      <span className={`size-1.5 rounded-full ${live ? "bg-sticker-green" : "bg-sticker-orange"}`} aria-hidden="true" />
      <span className="text-ink-muted">{status}</span>
    </span>
  );
}

/* ───────────────────────────── FAQ ───────────────────────────── */

const FAQS: { q: string; a: ReactNode }[] = [
  {
    q: "Is IPOLens investment advice?",
    a: "No. IPOLens is an information tool. We are not registered with SEBI as a research analyst or investment adviser, and nothing in the app tells you what to do with an IPO. Read the offer document and speak to a registered adviser before you invest.",
  },
  {
    q: "Can I place a bid through IPOLens?",
    a: "No. Bids are placed through your broker or your UPI app. IPOLens helps you follow an IPO and record what you did.",
  },
  {
    q: "Where does the data come from?",
    a: "IPO details and live subscription come from NSE and BSE, and offer documents from SEBI filings. Every live number shows when it was last updated.",
  },
  {
    q: "How does the allotment check work?",
    a: "IPOLens opens the registrar's own allotment page inside the app and helps you enter your PAN. You solve the captcha and see the result on the registrar's page. We never read it; you tell the app the outcome if you want it tracked.",
  },
  {
    q: "What is the analysis score?",
    a: "A 0–100 summary built from figures disclosed in the offer document: growth, profitability, balance sheet, valuation and governance, plus a subscription signal once bidding closes. It is not a rating, and the full breakdown is always shown.",
  },
  {
    q: "How do I install IPOLens?",
    a: "Download the APK from the download page and follow the three install steps there. This site is the only official source of the app.",
  },
  {
    q: "Is there an iPhone app?",
    a: "Not at the moment. IPOLens is distributed only from this site, and Apple only allows iPhone apps through the App Store.",
  },
  {
    q: "Is it free?",
    a: "Yes, IPOLens is free to download.",
  },
];

function Faq() {
  return (
    <section id="faq" className="scroll-mt-20 border-t border-hairline bg-canvas py-20 md:py-28">
      <div className="container-page grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <Badge>FAQ</Badge>
          <h2 className="t-heading-1 mt-4">Questions, answered.</h2>
        </div>
        <div className="divide-y divide-hairline border-y border-hairline">
          {FAQS.map((f) => (
            <details key={f.q} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-[18px] font-semibold tracking-[-0.2px] [&::-webkit-details-marker]:hidden">
                {f.q}
                <IconPlus size={20} className="shrink-0 text-ink-muted transition-transform group-open:rotate-45" />
              </summary>
              <p className="mt-3 max-w-2xl text-ink-muted">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
