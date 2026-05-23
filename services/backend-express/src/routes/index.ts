import { type Router as RouterType, Router } from "express";
import health from "./health/health.route";
import users from "./users/users.route";

const router: RouterType = Router();

router.use("/health", health);
router.use("/users", users);

export default router;
