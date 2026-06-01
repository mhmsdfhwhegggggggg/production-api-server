import rateLimit from "express-rate-limit";

export const defaultLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 1000,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    error: { message: "Too many requests, please slow down." },
  },
  skip: (req) => req.path === "/api/healthz",
});

export const heavyLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    error: { message: "Too many requests on this endpoint, please slow down." },
  },
});
