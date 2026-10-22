import type { Metadata } from "next";
import type { ReactNode } from "react";

import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "What IPOLens collects, why, and how your PAN stays on your phone.",
};

// Written to match how the app works today (SPEC: Compliance, privacy and Play Store).
// Have a lawyer review it before launch, and update it when sign-in and alerts go live.
const UPDATED = "22 October 2026";

function Section({ id, title, children }: { id?: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 border-t border-hairline pt-8">
      <h2 className="t-heading-3">{title}</h2>
      <div className="mt-3 space-y-3 text-ink-secondary">{children}</div>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <div className="container-page py-16 md:py-24">
      <article className="mx-auto max-w-3xl rounded-xl border border-hairline bg-surface px-6 py-10 md:px-12 md:py-14">
        <p className="t-eyebrow text-primary">Legal</p>
        <h1 className="t-heading-1 mt-3">Privacy policy</h1>
        <p className="t-caption mt-3 text-ink-muted">Last updated {UPDATED}</p>
        <p className="mt-8 text-[17px] text-ink-secondary">
          IPOLens is an app for following Indian IPOs. This page explains what information the app uses, why, and the
          choices you have. We collect as little as we can.
        </p>

        <div className="mt-10 space-y-8">
          <Section title="Your PAN">
            <p>
              You can save the PANs of the people you manage IPOs for. A PAN is used for one thing only: filling the PAN
              box on the registrar&apos;s allotment page when you check allotment.
            </p>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>Each PAN is stored encrypted in your phone&apos;s secure storage (the Android Keystore).</li>
              <li>PANs are never sent to IPOLens servers.</li>
              <li>You can require a fingerprint or screen lock before a PAN is used.</li>
              <li>You give consent when you add a PAN, and you can delete it at any time in Settings.</li>
            </ul>
          </Section>

          <Section title="Information kept on your phone">
            <p>
              The IPOs you mark as applied, your allotment results, your alert choices and your theme setting are stored
              on your phone so the app can show them to you. Deleting the app, or using &quot;Delete all my data&quot;
              in Settings, removes them.
            </p>
          </Section>

          <Section title="Allotment checks">
            <p>
              Allotment is checked on the registrar&apos;s own website, which opens inside the app. Only approved
              registrar sites can load there. IPOLens does not read your allotment result or the captcha; you choose
              whether to record the outcome in the app.
            </p>
          </Section>

          <Section title="Information we receive">
            <p>
              To show IPO data, the app requests it from IPOLens servers. Those requests carry standard technical
              details (such as your IP address and device type) that our servers use to deliver the data and protect the
              service from abuse. We do not sell data or use it for advertising profiles.
            </p>
            <p>
              Sign-in and push alerts are planned. When they arrive, signing in will be optional, and this policy will
              be updated before they launch to list exactly what they use.
            </p>
          </Section>

          <Section title="Service providers">
            <p>IPOLens relies on these providers:</p>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>MongoDB Atlas, to store IPO data.</li>
              <li>Google Firebase, for push alerts and optional sign-in once those launch.</li>
              <li>
                Anthropic, to help prepare analysis reports from offer documents. These are public filings; no personal
                information is sent.
              </li>
            </ul>
          </Section>

          <Section title="Your choices and rights">
            <p>
              Under India&apos;s Digital Personal Data Protection Act, you can ask what personal data we hold about you,
              ask for it to be corrected or erased, and withdraw consent. Most of your data never leaves your phone, and
              you can delete it yourself in Settings.
            </p>
          </Section>

          <Section title="Contact and grievances">
            {site.contactEmail ? (
              <p>
                For privacy questions or grievances, write to{" "}
                <a href={`mailto:${site.contactEmail}`} className="font-medium text-primary hover:underline">
                  {site.contactEmail}
                </a>
                .
              </p>
            ) : (
              <p>Contact details for privacy questions and grievances will be published here before launch.</p>
            )}
          </Section>

          <Section id="disclaimer" title="Disclaimer">
            <p>
              IPOLens is an information tool and does not provide investment advice. IPOLens is not registered with SEBI
              as a research analyst or investment adviser.
            </p>
            <p>
              The analysis score summarises figures disclosed in each company&apos;s offer document. It is not a rating
              or a recommendation. Exchange data is shown as published by NSE and BSE, with the time it was last
              updated, and may be delayed. Read the offer document and consult a registered adviser before you invest.
            </p>
          </Section>
        </div>
      </article>
    </div>
  );
}
