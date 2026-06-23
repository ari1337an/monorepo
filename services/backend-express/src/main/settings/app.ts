import express, { type Express, type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import userRoutes from "@/main/routes/user/index";
import { sendOk, sendFailed } from "@/shared/api-response/index";

export function setupApp(): Express {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get("/api/health", (_req: Request, res: Response) => {
    sendOk(res, { status: "healthy", uptime: process.uptime() });
  });

  app.use("/api/users", userRoutes);

  app.use((_req: Request, res: Response) => {
    sendFailed(res, "ROUTE_NOT_FOUND", `Cannot ${_req.method} ${_req.originalUrl}`, 404);
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    if (process.env.NODE_ENV !== "production") {
      console.error(err);
    }
    sendFailed(res, "INTERNAL_SERVER_ERROR", "Internal server error", 500);
  });

  return app;
}
