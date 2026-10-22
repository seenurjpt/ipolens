# IPOLens

Android-first IPO tracker for Indian retail investors. The full build spec is in [SPEC.md](SPEC.md).

## Layout

- `apps/mobile`: Expo (Router, NativeWind, TanStack Query)
- `apps/api`: Fastify + Zod + Mongoose REST API
- `apps/worker`: BullMQ jobs (scrapers, AI report, alerts)
- `apps/admin`: Next.js admin panel (port 3001)
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

Checks: `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build`.
