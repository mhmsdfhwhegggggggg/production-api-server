import app from "./app";
import { logger } from "./lib/logger";
import type { Server } from "http";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error("PORT environment variable is required but was not provided.");
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

let server: Server;

async function start() {
  if (process.env.DATABASE_URL) {
    const { pool } = await import("@workspace/db");
    await pool.query("SELECT 1");
    logger.info("Database connection established");
  } else {
    logger.warn("DATABASE_URL not set — running without database");
  }

  server = app.listen(port, () => {
    logger.info({ port }, "Server listening");
  });

  server.keepAliveTimeout = 65000;
  server.headersTimeout = 66000;
  server.maxConnections = 10000;
}

async function shutdown(signal: string) {
  logger.info({ signal }, "Shutdown signal received — draining connections");

  if (server) {
    await new Promise<void>((resolve, reject) => {
      server.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  if (process.env.DATABASE_URL) {
    try {
      const { pool } = await import("@workspace/db");
      await pool.end();
    } catch {
      // ignore
    }
  }

  logger.info("Graceful shutdown complete");
  process.exit(0);
}

process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));

process.on("uncaughtException", (err) => {
  logger.fatal({ err }, "Uncaught exception — shutting down");
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  logger.fatal({ reason }, "Unhandled rejection — shutting down");
  process.exit(1);
});

start().catch((err) => {
  logger.fatal({ err }, "Failed to start server");
  process.exit(1);
});
