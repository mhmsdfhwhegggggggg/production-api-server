# Production API Server

A production-hardened Express 5 API server built for high-throughput workloads.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080, proxied via /api)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec → React Query hooks)
- Build: esbuild (ESM bundle)
- Security: Helmet, CORS, express-rate-limit

## Where things live

- `artifacts/api-server/src/app.ts` — Express app setup (middlewares, routes)
- `artifacts/api-server/src/index.ts` — Server entrypoint + graceful shutdown
- `artifacts/api-server/src/routes/` — Route handlers
- `artifacts/api-server/src/middlewares/` — Security, rate-limit, error-handler
- `lib/api-spec/openapi.yaml` — Source of truth for all API contracts
- `lib/db/src/schema/` — Source of truth for DB schema (Drizzle)
- `lib/api-zod/` — Generated Zod schemas (do not edit manually)
- `lib/api-client-react/` — Generated React Query hooks (do not edit manually)

## Architecture decisions

- Contract-first API: OpenAPI spec → Zod schemas + React Query hooks via Orval codegen
- esbuild bundles everything into a single ESM file for fast cold starts
- Lazy DB import in routes: DB is only imported when DATABASE_URL is set, server runs without it
- `trust proxy = 1` is set so rate-limiter uses real client IPs behind Replit's reverse proxy
- Graceful shutdown: SIGTERM drains HTTP connections, then closes the DB pool

## Product

Production-ready API scaffold. Add routes in `artifacts/api-server/src/routes/`, define contracts in `lib/api-spec/openapi.yaml`, run codegen, then implement.

## Required env vars

- `DATABASE_URL` — Postgres connection string (auto-provisioned by Replit DB)
- `SESSION_SECRET` — Secret for signing cookies
- `ALLOWED_ORIGINS` — Comma-separated list of allowed CORS origins (production only)
- `PORT` — Injected by Replit automatically
- `NODE_ENV` — `development` or `production`

## Gotchas

- Always run `pnpm --filter @workspace/api-spec run codegen` after editing `openapi.yaml`
- Never run `pnpm dev` at workspace root — use workflow restart instead
- `drizzle-kit push` is dev-only; for production DB migrations use `drizzle-kit generate` + `drizzle-kit migrate`
- pino-pretty is only loaded in development (`NODE_ENV !== "production"`)

## User preferences

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
