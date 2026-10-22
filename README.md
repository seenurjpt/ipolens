# IPOLens

Android-first IPO tracker for Indian retail investors. The full build spec is in [SPEC.md](SPEC.md).

## Layout

- `apps/mobile`: Expo (Router, NativeWind, TanStack Query)
- `apps/api`: Fastify + Zod + Mongoose REST API
- `apps/worker`: BullMQ jobs (scrapers, AI report, alerts)
- `apps/admin`: Next.js admin panel (port 3001)
- `apps/web`: public website, static Next.js export (port 3002)
- `packages/shared`: Zod schemas, types, enums, constants
- `packages/config`: shared tsconfig and ESLint config

## Getting started

```sh
pnpm install
cp .env.example .env
pnpm db:up        # MongoDB + Redis via docker compose
pnpm db:seed      # 6 fake IPOs (every status, both boards) + subscription history
pnpm dev          # api + worker + mobile
pnpm dev:admin    # admin panel
```

### Try it without Docker

```sh
pnpm dev:demo                                   # API on :4000, seeded in-memory MongoDB
cd apps/mobile
EXPO_PUBLIC_API_URL=http://localhost:4000 npx expo start --web   # app in the browser
```

On a phone with Expo Go, set `EXPO_PUBLIC_API_URL` to this computer's LAN address instead (e.g. `http://192.168.1.20:4000`).

The mobile app is on **Expo SDK 57** to match the Expo Go available on our test phone. A few Expo/React Native packages are requested with `*` ranges, so the root `package.json` pins them with `pnpm.overrides` (and `apps/mobile` lists `@expo/dom-webview` and `@react-native/metro-config` directly). When moving to a newer SDK, run `npx expo install expo@<sdk> && npx expo install --fix` in `apps/mobile`, update those pins to the new SDK's versions, and check `npx expo-doctor`.

### Admin panel

The panel (http://localhost:3001) edits IPO data, reviews and publishes AI reports, and triggers jobs.
It reads the root `.env`:

```sh
ADMIN_API_TOKEN=some-long-random-string   # shared by the API and the panel; admin API is off while unset
API_URL=http://localhost:4000             # where the panel finds the API
ADMIN_USER=ops                            # HTTP Basic login; optional in development,
ADMIN_PASSWORD=change-me                  # required in production (the panel answers 503 without it)
```

Restart the API after setting `ADMIN_API_TOKEN`, then run `pnpm dev:admin`. Job triggers need Redis (`pnpm db:up`) and the worker; without Redis the Jobs page says the queue is unavailable.

### Website

`apps/web` is the public site that showcases the app and links to the download, styled after
[DESIGN-notion.md](DESIGN-notion.md). It is a static Next.js export.

```sh
pnpm dev:web                              # http://localhost:3002
pnpm --filter @ipolens/web build          # writes static files to apps/web/out/
```

Upload `apps/web/out/` to any static host (Vercel, Netlify, Cloudflare Pages, GitHub Pages).

The website is the only place to get the app: every "get the app" button leads to `/download`, which offers
the Android APK with install steps, size and a SHA-256 checksum, and shows "Coming soon" until an APK exists.

- Self-hosted APK: copy it to `apps/web/public/downloads/ipolens-<version>.apk` before building (APKs are
  git-ignored, so add the file in your deploy step). The newest one is offered.
- Hosted elsewhere (e.g. GitHub Releases): set `NEXT_PUBLIC_APK_URL`, plus optional `NEXT_PUBLIC_APK_VERSION` and
  `NEXT_PUBLIC_APK_SHA256`.

Other settings in `.env`: `NEXT_PUBLIC_SITE_URL` (link previews and the QR code on `/download`) and
`NEXT_PUBLIC_CONTACT_EMAIL` (privacy/grievance contact, required before launch).

There is no iPhone download: Apple only allows iPhone apps through the App Store.

Checks: `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build`.
