import { type Router as RouterType, Router } from "express";
import { prisma } from "@workspace/database";

const router: RouterType = Router();

router.get("/", async (_req, res) => {
  const users = await prisma.user.findMany();
  res.json({ users });
});

router.get("/:id", async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
  });
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json({ user });
});

router.post("/", async (req, res) => {
  const user = await prisma.user.create({
    data: {
      name: req.body.name,
      email: req.body.email,
    },
  });
  res.status(201).json({ user });
});

router.patch("/:id", async (req, res) => {
  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: {
      ...(req.body.name && { name: req.body.name }),
      ...(req.body.email && { email: req.body.email }),
    },
  });
  res.json({ user });
});

router.delete("/:id", async (req, res) => {
  await prisma.user.delete({
    where: { id: req.params.id },
  });
  res.status(204).send();
});

export default router;
