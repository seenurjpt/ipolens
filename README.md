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
pnpm dev          # api + worker + mobile
pnpm dev:admin    # admin panel
```

Checks: `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build`.
