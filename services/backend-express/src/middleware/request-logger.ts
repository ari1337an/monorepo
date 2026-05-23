import type { Request, Response, NextFunction } from "express";
import { Logger } from "@workspace/logger";

const log = new Logger({ name: "http" });

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  log.debug(`${req.method} ${req.url}`, { ip: req.ip });

  res.on("finish", () => {
    const duration = Date.now() - start;
    log.info(`${req.method} ${req.url} ${res.statusCode}`, {
      duration: `${duration}ms`,
    });
  });

  next();
}
