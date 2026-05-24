import { type Router as RouterType, Router, type Request, type Response, type NextFunction } from "express";
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

function wrap(controller: { execute: (req: Request, res: Response) => Promise<void> }) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await controller.execute(req, res);
    } catch (err) {
      next(err);
    }
  };
}

router.get("/", wrap(getAllUsersController));
router.get("/:id", wrap(getUserByIdController));
router.post("/", wrap(createUserController));
router.patch("/:id", wrap(updateUserController));
router.delete("/:id", wrap(deleteUserController));

export default router;
