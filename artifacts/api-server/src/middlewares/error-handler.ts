import type { Request, Response, NextFunction } from "express";
import { logger } from "../lib/logger";

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export function errorHandler(
  err: AppError,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const statusCode = err.statusCode ?? 500;
  const isOperational = err.isOperational ?? false;

  if (!isOperational) {
    req.log.error({ err, statusCode }, "Unhandled error");
  } else {
    req.log.warn({ err, statusCode }, "Operational error");
  }

  if (res.headersSent) return;

  res.status(statusCode).json({
    error: {
      message:
        statusCode < 500
          ? err.message
          : "An unexpected error occurred. Please try again later.",
      ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
    },
  });
}

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    error: {
      message: `Cannot ${req.method} ${req.path}`,
    },
  });
}

export function createError(
  message: string,
  statusCode: number,
  isOperational = true,
): AppError {
  const err: AppError = new Error(message);
  err.statusCode = statusCode;
  err.isOperational = isOperational;
  return err;
}
