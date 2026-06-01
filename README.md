# Production API Server

  A production-hardened Express 5 API server ready for high-throughput workloads.

  ## Features

  - Security: Helmet (CSP, HSTS, XSS protection), CORS with origin whitelist
  - Rate Limiting: 1000 req/min per IP, configurable per route
  - Error Handling: Global error handler, 404 handler, structured JSON errors
  - Graceful Shutdown: SIGTERM/SIGINT drain connections then close DB pool
  - Compression: gzip on all responses over 1KB
  - Health Check: GET /api/healthz checks API + DB connectivity
  - Logging: Pino structured JSON in prod, pretty in dev
  - Request Size Limit: 1MB max body
  - Uncaught Exception Guard: process exits safely with fatal log

  ## Stack

  - Node.js 24 + TypeScript 5.9
  - Express 5
  - PostgreSQL + Drizzle ORM
  - Zod v4 validation
  - pnpm workspaces monorepo
  - esbuild single ESM bundle

  ## Environment Variables

  | Variable | Required | Description |
  |---|---|---|
  | PORT | Yes | HTTP port |
  | DATABASE_URL | Yes | PostgreSQL connection string |
  | SESSION_SECRET | Yes | Cookie signing secret |
  | ALLOWED_ORIGINS | Prod | Comma-separated CORS origins |
  | NODE_ENV | Yes | development or production |

  ## API Endpoints

  | Method | Path | Description |
  |---|---|---|
  | GET | /api/healthz | Health check (API + DB status) |

  ## Project Structure

      artifacts/api-server/src/
      app.ts                    Express app (middlewares, routes)
      index.ts                  Entrypoint + graceful shutdown
      lib/logger.ts             Pino logger
      middlewares/
        security.ts             Helmet + CORS
        rate-limiter.ts         express-rate-limit
        error-handler.ts        Global error + 404 handler
      routes/
        index.ts                Route registry
        health.ts               /healthz endpoint
      
      lib/
      api-spec/openapi.yaml     OpenAPI contract (source of truth)
      api-zod/                  Generated Zod schemas
      api-client-react/         Generated React Query hooks
      db/                       Drizzle ORM + schema

  ## Adding a New Endpoint

  1. Add the path to lib/api-spec/openapi.yaml
  2. Run: pnpm --filter @workspace/api-spec run codegen
  3. Create the route handler in artifacts/api-server/src/routes/
  4. Register it in artifacts/api-server/src/routes/index.ts
  