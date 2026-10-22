import type { Metadata } from "next";
import QRCode from "qrcode";

import { ApkButton, Badge, ComingSoon } from "@/components/brand";
import { IconAndroid, IconShield } from "@/components/icons";
import { getApk, MIN_ANDROID } from "@/lib/downloads";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Download",
  description: "Download the IPOLens app for Android directly from this site.",
};

/** IPOLens is distributed only from this page, as an Android APK. */
export default async function DownloadPage() {
  const apk = getApk();
  const pageUrl = `${site.url}/download/`;
  // Rendered at build time; shown only once the site has a real public address.
  const qrSvg = site.hasPublicUrl
    ? await QRCode.toString(pageUrl, { type: "svg", margin: 0, color: { dark: "#000000f2", light: "#ffffff" } })
    : null;

  return (
    <div className="relative isolate overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 -z-10 h-[420px]"
        style={{
          backgroundImage: "radial-gradient(#e2e0dd 1px, transparent 1px)",
          backgroundSize: "22px 22px",
          maskImage: "linear-gradient(#000, transparent)",
          WebkitMaskImage: "linear-gradient(#000, transparent)",
        }}
      />
      <div className="container-page py-16 md:py-24">
        <header className="mx-auto max-w-3xl text-center">
          <Badge>Download</Badge>
          <h1 className="t-heading-1 mt-4 md:text-[54px] md:leading-[1.04] md:tracking-[-1.875px]">
            Get IPOLens for Android.
          </h1>
          <p className="mt-5 text-[18px] leading-[1.55] text-ink-muted">
            Free. Download the app straight from this page and install it in three taps.
          </p>
        </header>

        <section className="mx-auto mt-14 max-w-3xl rounded-xl border border-hairline bg-surface p-6 shadow-soft md:p-10">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <span
                className="grid size-12 place-items-center rounded-xl bg-sticker-green text-white"
                aria-hidden="true">
                <IconAndroid size={26} />
              </span>
              <div>
                <h2 className="t-heading-3">IPOLens for Android</h2>
                <p className="t-caption text-ink-muted">{MIN_ANDROID} or newer</p>
              </div>
            </div>
            {apk ? <ApkButton className="btn-primary px-6 text-[17px]" /> : <ComingSoon label="Coming soon" />}
          </div>

          {apk ? (
            <div className="mt-8 grid gap-8 border-t border-hairline pt-8 md:grid-cols-2">
              <div>
                <h3 className="t-title text-[17px]">How to install</h3>
                <ol className="mt-3 space-y-2.5 text-[15px] text-ink-secondary">
                  {[
                    "Tap Download APK and open the file when it finishes.",
                    "If Android asks, allow your browser to install apps (Settings › Install unknown apps).",
                    "Tap Install. Updates install the same way, over the existing app.",
                  ].map((step, i) => (
                    <li key={step} className="flex gap-3">
                      <span className="grid size-6 shrink-0 place-items-center rounded-full bg-canvas-soft text-[13px] font-semibold">
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
              <div>
                <h3 className="t-title text-[17px]">About this file</h3>
                <dl className="mt-3 space-y-2 text-[15px]">
                  {apk.version ? <Detail label="Version" value={apk.version} /> : null}
                  {apk.sizeMb ? <Detail label="Size" value={`${apk.sizeMb} MB`} /> : null}
                  <Detail label="Works on" value={`${MIN_ANDROID} or newer`} />
                </dl>
                {apk.sha256 ? (
                  <div className="mt-4">
                    <p className="t-caption text-ink-muted">SHA-256 checksum, to check the file wasn&apos;t altered:</p>
                    <code className="mt-1 block break-all rounded-xs bg-canvas-soft px-2 py-1.5 font-mono text-[12px] text-ink-secondary">
                      {apk.sha256}
                    </code>
                  </div>
                ) : null}
              </div>
            </div>
          ) : (
            <p className="mt-6 text-[15px] text-ink-muted">
              The first release is on its way. The download will appear right here.
            </p>
          )}
        </section>

        <div className={`mx-auto mt-6 grid max-w-3xl gap-6 ${qrSvg ? "md:grid-cols-[1fr_auto]" : ""}`}>
          <div className="flex gap-4 rounded-lg border border-hairline bg-surface p-6">
            <span
              className="grid size-10 shrink-0 place-items-center rounded-lg bg-sticker-teal text-white"
              aria-hidden="true">
              <IconShield size={20} />
            </span>
            <div>
              <p className="t-title text-[17px]">Download safely</p>
              <p className="mt-1 text-[15px] text-ink-muted">
                This page is the only official source of IPOLens. We never send the app by WhatsApp, SMS or email, and
                we never ask for your passwords, OTPs or bank details.
              </p>
            </div>
          </div>
          {qrSvg ? (
            <div className="flex items-center gap-5 rounded-lg border border-hairline bg-surface p-6">
              <div
                className="size-28 shrink-0 [&>svg]:size-full"
                role="img"
                aria-label={`QR code linking to ${pageUrl}`}
                dangerouslySetInnerHTML={{ __html: qrSvg }}
              />
              <div className="max-w-[12rem]">
                <p className="t-title text-[17px]">On a computer?</p>
                <p className="mt-1 text-[15px] text-ink-muted">
                  Scan with your phone&apos;s camera to open this page there.
                </p>
              </div>
            </div>
          ) : null}
        </div>

        <p className="t-caption mx-auto mt-8 max-w-3xl text-center text-ink-faint">
          IPOLens is available for Android only. Apple only allows iPhone apps through the App Store, so there&apos;s no
          iPhone version to download here.
        </p>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-hairline pb-2">
      <dt className="text-ink-muted">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
