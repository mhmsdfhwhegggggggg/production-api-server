import express, { type Express } from "express";
import compression from "compression";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import { logger } from "./lib/logger";
import { helmetMiddleware, corsMiddleware } from "./middlewares/security";
import { defaultLimiter } from "./middlewares/rate-limiter";
import { errorHandler, notFoundHandler } from "./middlewares/error-handler";
import router from "./routes";

const app: Express = express();

app.set("trust proxy", 1);

app.use(helmetMiddleware);
app.use(corsMiddleware);

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return { statusCode: res.statusCode };
      },
    },
  }),
);

app.use(
  compression({
    level: 6,
    threshold: 1024,
  }),
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(cookieParser(process.env.SESSION_SECRET));

app.use(defaultLimiter);

app.use("/api", router);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
