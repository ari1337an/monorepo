import express, { type Express, type Request, type Response } from "express";
import cors from "cors";
import userRoutes from "@/main/routes/user/index";

export function setupApp(): Express {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get("/api/health", (_req: Request, res: Response) => {
    res.json({ status: "healthy", uptime: process.uptime() });
  });

  app.use("/api/users", userRoutes);

  return app;
}
