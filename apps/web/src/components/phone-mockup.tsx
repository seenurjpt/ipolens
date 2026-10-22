/**
 * A phone showing the IPOLens home screen as the app draws it: aurora backdrop, glass cards and the
 * floating tab bar. Built in HTML/CSS so it stays sharp at any size. Sample data only.
 */
export function PhoneMockup() {
  return (
    <figure className="relative mx-auto w-[280px] sm:w-[300px]" aria-label="IPOLens home screen, showing sample data">
      <div className="relative overflow-hidden rounded-[46px] border-[10px] border-[#0b0b0f] bg-[#05060f] shadow-elevated ring-1 ring-white/10">
        <div className="relative aspect-[9/19.2] overflow-hidden text-white">
          {/* Aurora backdrop */}
          <div
            className="absolute inset-0"
            style={{
              background: [
                "radial-gradient(80% 22% at 28% -3%, rgba(37,99,235,.85), transparent 70%)",
                "radial-gradient(60% 13% at 6% 12%, rgba(6,182,212,.6), transparent 70%)",
                "radial-gradient(62% 17% at 90% 7%, rgba(139,92,246,.75), transparent 70%)",
                "radial-gradient(58% 10% at 62% 25%, rgba(217,70,239,.32), transparent 70%)",
                "radial-gradient(85% 22% at 50% 106%, rgba(67,56,202,.4), transparent 70%)",
                "linear-gradient(#0a0f26, #05060f 45%, #04050d)",
              ].join(","),
            }}
          />

          <div className="relative flex h-full flex-col px-4 pt-3">
            {/* Status bar */}
            <div className="flex items-center justify-between px-2 text-[11px] font-semibold text-white/90">
              <span>9:41</span>
              <span className="h-5 w-20 rounded-full bg-black" />
              <span className="flex items-center gap-1">
                <span className="h-2 w-3 rounded-[2px] bg-white/90" />
                <span className="h-2.5 w-5 rounded-[3px] border border-white/80" />
              </span>
            </div>

            <p className="mt-5 text-[26px] font-bold tracking-[-0.6px]">IPOLens</p>

            <div className="mt-4 flex items-end justify-between">
              <div>
                <p className="text-[17px] font-bold tracking-[-0.3px]">Open now</p>
                <p className="text-[10px] text-white/60">Closing soonest first</p>
              </div>
              <p className="flex items-center gap-1 text-[9px] text-white/60">
                <span className="size-1.5 rounded-full bg-[#5ee9a8]" /> Updated 2 min ago
              </p>
            </div>

            <GlassCard className="mt-2.5 p-3">
              <div className="flex items-center gap-2.5">
                <span className="grid size-8 place-items-center rounded-[10px] bg-[rgba(165,180,252,.16)] text-[11px] font-bold text-[#a5b4fc]">
                  AI
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold">Acme Industries</p>
                  <p className="mt-0.5 flex items-center gap-1.5 text-[9px] text-white/60">
                    <span className="rounded-full bg-[rgba(94,233,168,.14)] px-1.5 py-px font-semibold text-[#5ee9a8]">
                      Open
                    </span>
                    Closes in 1d 4h
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[14px] font-semibold text-[#5ee9a8]">12.4x</p>
                  <p className="text-[8px] text-white/60">subscribed</p>
                </div>
              </div>
              <div className="mt-2.5 grid grid-cols-3 border-t border-white/10 pt-2 text-[8px] text-white/55">
                <p>
                  Price band<span className="mt-0.5 block text-[10px] font-medium text-white">₹285 – 300</span>
                </p>
                <p>
                  Min. investment<span className="mt-0.5 block text-[10px] font-medium text-white">₹15,000</span>
                </p>
                <p>
                  Lot<span className="mt-0.5 block text-[10px] font-medium text-white">50 shares</span>
                </p>
              </div>
            </GlassCard>

            <GlassCard className="mt-2 p-3">
              <p className="text-[10px] font-semibold text-white/80">Subscription by category</p>
              {[
                ["QIB", 18.6, 100],
                ["NII", 22.1, 100],
                ["Retail", 6.8, 62],
              ].map(([label, x, w]) => (
                <div key={label} className="mt-1.5 flex items-center gap-2 text-[9px]">
                  <span className="w-8 text-white/60">{label}</span>
                  <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                    <span
                      className="block h-full rounded-full bg-gradient-to-r from-[#6366f1] to-[#a855f7]"
                      style={{ width: `${w}%` }}
                    />
                  </span>
                  <span className="w-8 text-right font-semibold text-[#5ee9a8]">{(x as number).toFixed(1)}x</span>
                </div>
              ))}
            </GlassCard>

            <p className="mt-4 text-[15px] font-bold tracking-[-0.3px]">Recent listings</p>
            <GlassCard className="mt-2 flex items-center gap-2.5 p-3">
              <span className="grid size-8 place-items-center rounded-[10px] bg-[rgba(165,180,252,.16)] text-[11px] font-bold text-[#a5b4fc]">
                KT
              </span>
              <div className="flex-1">
                <p className="text-[12px] font-medium">Kavya Textiles</p>
                <p className="text-[9px] text-white/55">Listed 15 Oct</p>
              </div>
              <p className="text-[12px] font-semibold text-[#5ee9a8]">+18.75%</p>
            </GlassCard>

            {/* Floating glass tab bar */}
            <div className="absolute inset-x-3 bottom-3.5">
              <GlassCard className="flex h-12 items-center px-1" rounded="rounded-full">
                {["Home", "Explore", "My IPOs", "Settings"].map((t, i) => (
                  <span
                    key={t}
                    className={`flex flex-1 flex-col items-center gap-0.5 rounded-full py-1 text-[8px] ${
                      i === 0
                        ? "bg-[rgba(165,180,252,.18)] font-semibold text-[#a5b4fc] ring-1 ring-white/15"
                        : "text-white/55"
                    }`}>
                    <span className={`size-3 rounded-[4px] ${i === 0 ? "bg-[#a5b4fc]" : "bg-white/35"}`} />
                    {t}
                  </span>
                ))}
              </GlassCard>
            </div>
          </div>
        </div>
      </div>
      <figcaption className="sr-only">The IPOLens app home screen with sample IPO data.</figcaption>
    </figure>
  );
}

function GlassCard({
  className = "",
  rounded = "rounded-[18px]",
  children,
}: {
  className?: string;
  rounded?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`relative overflow-hidden border border-white/20 bg-white/[0.09] backdrop-blur-md ${rounded} ${className}`}
      style={{ backgroundImage: "linear-gradient(135deg, rgba(255,255,255,.18), rgba(255,255,255,0) 55%)" }}>
      {children}
    </div>
  );
}
