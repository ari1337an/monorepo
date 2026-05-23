import { describe, it, expect } from "@jest/globals";
import { type MockPrismaClient } from "@workspace/database/testing";

const { prismaMock } = await import("./prisma-mock");

const { app } = await import("../app");

const request = (await import("supertest")).default;

const prisma = prismaMock as MockPrismaClient;

describe("GET /api/users", () => {
  const mockUsers = [
    { id: "user-1", name: "Alice", email: "alice@test.com" },
    { id: "user-2", name: "Bob", email: "bob@test.com" },
  ];

  it("should return all users", async () => {
    prisma.user.findMany.mockResolvedValue(mockUsers);

    const res = await request(app).get("/api/users");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ users: mockUsers });
    expect(prisma.user.findMany).toHaveBeenCalledTimes(1);
  });

  it("should return an empty array when no users exist", async () => {
    prisma.user.findMany.mockResolvedValue([]);

    const res = await request(app).get("/api/users");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ users: [] });
  });
});

describe("GET /api/users/:id", () => {
  it("should return a user by id", async () => {
    const mockUser = { id: "user-1", name: "Alice", email: "alice@test.com" };
    prisma.user.findUnique.mockResolvedValue(mockUser);

    const res = await request(app).get("/api/users/user-1");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ user: mockUser });
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: "user-1" },
    });
  });

  it("should return 404 when user is not found", async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    const res = await request(app).get("/api/users/non-existent");

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: "User not found" });
  });
});

describe("POST /api/users", () => {
  it("should create a new user", async () => {
    const input = { name: "Charlie", email: "charlie@test.com" };
    const created = { id: "user-3", ...input };
    prisma.user.create.mockResolvedValue(created);

    const res = await request(app).post("/api/users").send(input);

    expect(res.status).toBe(201);
    expect(res.body).toEqual({ user: created });
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: { name: "Charlie", email: "charlie@test.com" },
    });
  });

  it("should pass through only name and email to prisma", async () => {
    const input = { name: "Dave", email: "dave@test.com", role: "admin" };
    const created = { id: "user-4", name: "Dave", email: "dave@test.com" };
    prisma.user.create.mockResolvedValue(created);

    const res = await request(app).post("/api/users").send(input);

    expect(res.status).toBe(201);
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: { name: "Dave", email: "dave@test.com" },
    });
  });
});

describe("PATCH /api/users/:id", () => {
  it("should update a user's name", async () => {
    const updated = { id: "user-1", name: "Alice Updated", email: "alice@test.com" };
    prisma.user.update.mockResolvedValue(updated);

    const res = await request(app)
      .patch("/api/users/user-1")
      .send({ name: "Alice Updated" });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ user: updated });
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: { name: "Alice Updated" },
    });
  });

  it("should update a user's email", async () => {
    const updated = { id: "user-1", name: "Alice", email: "newalice@test.com" };
    prisma.user.update.mockResolvedValue(updated);

    const res = await request(app)
      .patch("/api/users/user-1")
      .send({ email: "newalice@test.com" });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ user: updated });
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: { email: "newalice@test.com" },
    });
  });

  it("should update both name and email", async () => {
    const updated = { id: "user-1", name: "New Name", email: "new@test.com" };
    prisma.user.update.mockResolvedValue(updated);

    const res = await request(app)
      .patch("/api/users/user-1")
      .send({ name: "New Name", email: "new@test.com" });

    expect(res.status).toBe(200);
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: { name: "New Name", email: "new@test.com" },
    });
  });
});

describe("DELETE /api/users/:id", () => {
  it("should delete a user and return 204", async () => {
    prisma.user.delete.mockResolvedValue({ id: "user-1", name: "Alice", email: "alice@test.com" });

    const res = await request(app).delete("/api/users/user-1");

    expect(res.status).toBe(204);
    expect(prisma.user.delete).toHaveBeenCalledWith({
      where: { id: "user-1" },
    });
  });
});
