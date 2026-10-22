import type { CSSProperties, ReactNode } from "react";

import { Badge, DownloadButton, Sticker, type StickerColor } from "./brand";
import { IconArrowRight, IconCheckCircle, IconDocSearch, IconPulse, IconTrend } from "./icons";
import { PhoneMockup } from "./phone-mockup";

/*
 * Daylight hero: white page, near-black headline, one blue action. Personality comes from the
 * decorative sticker palette only (DESIGN-notion.md): pastel glows behind the phone, small sticker
 * shapes, and floating sticker cards around it.
 */

type ShapeName = "dot" | "square" | "ring" | "star";

// Small decorative sticker shapes scattered around the visual (positions relative to it).
const CONFETTI: { top: string; left: string; className: string; shape: ShapeName; delay: string }[] = [
  { top: "4%", left: "18%", className: "text-sticker-orange size-3", shape: "dot", delay: "0s" },
  { top: "18%", left: "92%", className: "text-sticker-purple size-4", shape: "square", delay: "1.4s" },
  { top: "58%", left: "2%", className: "text-sticker-sky size-4", shape: "ring", delay: "0.7s" },
  { top: "88%", left: "30%", className: "text-sticker-pink size-3", shape: "dot", delay: "2.2s" },
  { top: "72%", left: "96%", className: "text-sticker-teal size-5", shape: "star", delay: "1s" },
  { top: "-2%", left: "70%", className: "text-sticker-green size-3.5", shape: "star", delay: "1.8s" },
];

function Shape({ shape }: { shape: ShapeName }) {
  if (shape === "dot") return <span className="block size-full rounded-full bg-current" />;
  if (shape === "square") return <span className="block size-full rotate-12 rounded-[3px] bg-current" />;
  if (shape === "ring") return <span className="block size-full rounded-full border-[3px] border-current" />;
  return (
    <svg viewBox="0 0 24 24" className="size-full" fill="currentColor">
      <path d="M12 1.5 14.6 9.4 23 12l-8.4 2.6L12 22.5l-2.6-7.9L1 12l8.4-2.6z" />
    </svg>
  );
}

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden border-b border-hairline bg-canvas">
      {/* Faint dot grid that fades out toward the edges */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10"
        style={{
          backgroundImage: "radial-gradient(#e2e0dd 1px, transparent 1px)",
          backgroundSize: "22px 22px",
          maskImage: "radial-gradient(ellipse 70% 60% at 50% 40%, #000 30%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse 70% 60% at 50% 40%, #000 30%, transparent 75%)",
        }}
      />

      <div className="container-page grid items-center gap-16 pb-20 pt-14 md:pb-28 md:pt-20 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <Badge>
            <span className="size-1.5 rounded-full bg-sticker-green shadow-[0_0_0_3px_rgba(26,174,57,.18)]" />
            Live IPO tracking · Free on Android
          </Badge>
          <h1 className="t-display-1 mt-6">
            Every Indian IPO, <br className="hidden md:block" />
            in{" "}
            <span className="relative whitespace-nowrap">
              plain sight.
              <svg
                aria-hidden="true"
                viewBox="0 0 300 18"
                preserveAspectRatio="none"
                className="absolute -bottom-2 left-0 -z-10 h-3.5 w-full md:-bottom-3 md:h-[18px]">
                <path
                  d="M3 12c40-7 85-10 130-8s96 6 164-3"
                  fill="none"
                  stroke="#ff64c8"
                  strokeWidth="7"
                  strokeLinecap="round"
                  opacity=".85"
                />
              </svg>
            </span>
          </h1>
          <p className="mt-8 max-w-[34rem] text-[18px] leading-[1.6] text-ink-muted md:text-[19px]">
            Follow mainboard and SME IPOs live, check allotment for your whole family in one tap, and read a
            plain-English analysis of every offer document. All in one calm app.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <DownloadButton />
            <a href="#features" className="btn-secondary ring-1 ring-hairline">
              See what&apos;s inside <IconArrowRight size={18} />
            </a>
          </div>
          <div className="t-caption mt-10 flex flex-wrap items-center gap-x-3 gap-y-2 text-ink-faint">
            <span>Data from</span>
            {["NSE", "BSE", "SEBI filings"].map((s) => (
              <span
                key={s}
                className="rounded-full border border-hairline bg-surface px-3 py-1 font-medium text-ink-secondary">
                {s}
              </span>
            ))}
          </div>
          <p className="t-caption mt-6 text-ink-faint">
            For information only. IPOLens does not give investment advice.
          </p>
        </div>

        <HeroVisual />
      </div>
    </section>
  );
}

/** The phone on a soft pastel glow, with sticker shapes and floating sticker cards around it. */
function HeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-[460px] py-6">
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <span className="absolute left-[8%] top-[10%] size-64 rounded-full bg-sticker-sky/55 blur-3xl" />
        <span className="absolute right-[4%] top-[34%] size-64 rounded-full bg-sticker-purple/80 blur-3xl" />
        <span className="absolute bottom-[4%] left-[22%] size-56 rounded-full bg-sticker-pink/35 blur-3xl" />
      </div>
      {CONFETTI.map((c, i) => (
        <span
          key={i}
          aria-hidden="true"
          className={`absolute animate-float ${c.className}`}
          style={{ top: c.top, left: c.left, animationDelay: c.delay }}>
          <Shape shape={c.shape} />
        </span>
      ))}

      <div className="rotate-[-3deg] transition-transform duration-500 hover:rotate-0">
        <PhoneMockup />
      </div>

      <FloatingCard
        className="-left-2 top-[12%] sm:-left-6"
        tilt="-6deg"
        delay="0s"
        sticker="green"
        icon={<IconCheckCircle size={18} />}>
        <p className="text-[13px] font-semibold text-ink">Allotment is out</p>
        <p className="text-[12px] text-ink-muted">Self · 1 lot allotted</p>
      </FloatingCard>

      <FloatingCard
        className="-right-2 top-[30%] sm:-right-8"
        tilt="5deg"
        delay="1.2s"
        sticker="sky"
        icon={<IconPulse size={18} />}>
        <p className="text-[12px] text-ink-muted">Retail subscribed</p>
        <p className="text-[16px] font-bold text-sticker-green">6.8x</p>
      </FloatingCard>

      <FloatingCard
        className="-left-4 bottom-[22%] hidden sm:-left-10 sm:flex"
        tilt="4deg"
        delay="2.1s"
        sticker="orange"
        icon={<IconDocSearch size={18} />}>
        <p className="text-[12px] text-ink-muted">Analysis score</p>
        <p className="text-[16px] font-bold text-ink">
          61<span className="text-[12px] font-medium text-ink-faint"> / 100</span>
        </p>
      </FloatingCard>

      <FloatingCard
        className="-right-3 bottom-[8%] hidden sm:-right-6 sm:flex"
        tilt="-4deg"
        delay="0.7s"
        sticker="pink"
        icon={<IconTrend size={18} />}>
        <p className="text-[13px] font-semibold text-ink">Listed +18.75%</p>
        <p className="text-[12px] text-ink-muted">+₹2,250 per lot</p>
      </FloatingCard>
    </div>
  );
}

function FloatingCard({
  className,
  tilt,
  delay,
  sticker,
  icon,
  children,
}: {
  className: string;
  tilt: string;
  delay: string;
  sticker: StickerColor;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <div
      aria-hidden="true"
      className={`absolute z-10 flex animate-float items-center gap-3 rounded-lg border border-hairline bg-surface py-2.5 pl-2.5 pr-4 shadow-elevated ${className}`}
      style={{ "--tilt": tilt, animationDelay: delay } as CSSProperties}>
      <Sticker color={sticker}>{icon}</Sticker>
      <div className="leading-tight">{children}</div>
    </div>
  );
}
