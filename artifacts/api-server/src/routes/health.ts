import { Router, type IRouter } from "express";
import { HealthCheckResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/healthz", async (_req, res, next) => {
  try {
    const checks: Record<string, string> = { api: "ok" };

    if (process.env.DATABASE_URL) {
      try {
        const { pool } = await import("@workspace/db");
        await pool.query("SELECT 1");
        checks["db"] = "ok";
      } catch {
        checks["db"] = "unreachable";
      }
    }

    const allOk = Object.values(checks).every((v) => v === "ok");
    const status = allOk ? "ok" : "degraded";

    const data = HealthCheckResponse.parse({ status });
    res.status(allOk ? 200 : 503).json({ ...data, checks });
  } catch (err) {
    next(err);
  }
});

export default router;
