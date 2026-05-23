import {
  type Router as RouterType,
  Router,
  type Request,
  type Response,
} from "express";
import { v7 as uuid } from "uuid";

const router: RouterType = Router();

interface User {
  id: string;
  name: string;
  email: string;
}

class UsersList {
  private static instance: UsersList;
  public users: User[];
  private constructor() {
    this.users = [];
  }
  static getInstance(): UsersList {
    if (!UsersList.instance) {
      UsersList.instance = new UsersList();
    }
    return UsersList.instance;
  }
}

router.get("/", (_req: Request, res: Response) => {
  const usersList = UsersList.getInstance();
  res.json({ users: usersList.users });
});

router.get("/:id", (req: Request, res: Response) => {
  const usersList = UsersList.getInstance();
  const user = usersList.users.find((u) => u.id === req.params.id);
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json({ ...user });
});

router.post("/", (req: Request, res: Response) => {
  const usersList = UsersList.getInstance();
  const newUser: User = {
    id: uuid(),
    name: req.body.name,
    email: req.body.email,
  };
  usersList.users.push(newUser);
  res.status(201).json({ user: newUser });
});

export default router;
