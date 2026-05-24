import { type Router as RouterType, Router, type Request, type Response } from "express";
import {
  makeCreateUserFactory,
  makeGetAllUsersFactory,
  makeGetUserByIdFactory,
  makeUpdateUserFactory,
  makeDeleteUserFactory,
} from "@/main/factories/user/index";

const router: RouterType = Router();

const getAllUsersController = makeGetAllUsersFactory();
const getUserByIdController = makeGetUserByIdFactory();
const createUserController = makeCreateUserFactory();
const updateUserController = makeUpdateUserFactory();
const deleteUserController = makeDeleteUserFactory();

router.get("/", (req: Request, res: Response) => getAllUsersController.execute(req, res));
router.get("/:id", (req: Request, res: Response) => getUserByIdController.execute(req, res));
router.post("/", (req: Request, res: Response) => createUserController.execute(req, res));
router.patch("/:id", (req: Request, res: Response) => updateUserController.execute(req, res));
router.delete("/:id", (req: Request, res: Response) => deleteUserController.execute(req, res));

export default router;
