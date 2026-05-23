import type { Request, Response, NextFunction } from "express";
import { Logger } from "@workspace/logger";

const log = new Logger({ name: "error" });

export function errorHandler(
  err: Error & { statusCode?: number },
  _req: Request,
  res: Response,
  _next: NextFunction, // eslint-disable-line @typescript-eslint/no-unused-vars
) {
  const statusCode = err.statusCode ?? 500;
  log.error(err.message, { statusCode });
  res.status(statusCode).json({ error: err.message });
}
