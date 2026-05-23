import { type Router as RouterType, Router, type Request, type Response } from "express";

const router: RouterType = Router();

router.get("/", (_req: Request, res: Response) => {
  res.json({ status: "healthy", uptime: process.uptime() });
});

export default router;
