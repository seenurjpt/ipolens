// Site-wide settings. Links that don't exist yet stay unset rather than pointing somewhere fake:
// the download button reads "Coming soon" and the contact line says details are on the way.

const env = (value: string | undefined) => (value && value.trim() ? value.trim() : null);

export const site = {
  name: "IPOLens",
  tagline: "Every Indian IPO, in plain sight.",
  description:
    "Track mainboard and SME IPOs live, check allotment for your whole family in one tap, and read a plain-English analysis of every offer document.",
  /** Public site address, used for link previews and the download page's QR code. */
  url: env(process.env.NEXT_PUBLIC_SITE_URL) ?? "http://localhost:3002",
  /** True once a real public address is configured (the QR code is hidden until then). */
  hasPublicUrl: env(process.env.NEXT_PUBLIC_SITE_URL) !== null,
  /** Grievance and support contact (required in the privacy policy before launch). */
  contactEmail: env(process.env.NEXT_PUBLIC_CONTACT_EMAIL),
} as const;
