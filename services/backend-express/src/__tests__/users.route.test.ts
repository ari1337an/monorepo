import { describe, it, expect } from "@jest/globals";
import { type MockPrismaClient } from "@workspace/database/testing";

const { prismaMock } = await import("./prisma-mock");
const { setupApp } = await import("../main/settings/app");

const request = (await import("supertest")).default;

const prisma = prismaMock as MockPrismaClient;
const app = setupApp();

describe("GET /api/users", () => {
  it("should return all users with status 200", async () => {
    const mockUsers = [
      { id: "user-1", name: "Alice", email: "alice@test.com" },
      { id: "user-2", name: "Bob", email: "bob@test.com" },
    ];
    prisma.user.findMany.mockResolvedValue(mockUsers);

    const res = await request(app).get("/api/users");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ users: mockUsers });
  });

  it("should return an empty array when no users exist", async () => {
    prisma.user.findMany.mockResolvedValue([]);

    const res = await request(app).get("/api/users");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ users: [] });
  });
});

describe("GET /api/users/:id", () => {
  it("should return a user by id with status 200", async () => {
    const mockUser = { id: "user-1", name: "Alice", email: "alice@test.com" };
    prisma.user.findUnique.mockResolvedValue(mockUser);

    const res = await request(app).get("/api/users/user-1");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ user: mockUser });
  });

  it("should return 404 when user does not exist", async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    const res = await request(app).get("/api/users/non-existent");

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("error");
  });
});

describe("POST /api/users", () => {
  it("should create a new user and return 201", async () => {
    prisma.user.findFirst.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue({ id: "new-id", name: "Charlie", email: "charlie@test.com" });

    const res = await request(app)
      .post("/api/users")
      .send({ name: "Charlie", email: "charlie@test.com" });

    expect(res.status).toBe(201);
    expect(res.body.user).toHaveProperty("name", "Charlie");
    expect(res.body.user).toHaveProperty("email", "charlie@test.com");
  });

  it("should return 400 when name is missing", async () => {
    const res = await request(app).post("/api/users").send({ email: "test@test.com" });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("should return 400 when email is invalid", async () => {
    const res = await request(app).post("/api/users").send({ name: "Test", email: "not-email" });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("should return 400 when name is too short", async () => {
    const res = await request(app).post("/api/users").send({ name: "A", email: "a@b.com" });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("should return 409 when email already exists", async () => {
    prisma.user.findFirst.mockResolvedValue({ id: "existing", name: "Existing", email: "taken@test.com" });

    const res = await request(app)
      .post("/api/users")
      .send({ name: "New User", email: "taken@test.com" });

    expect(res.status).toBe(409);
    expect(res.body).toHaveProperty("error");
  });
});

describe("PATCH /api/users/:id", () => {
  it("should update a user's name and return 200", async () => {
    prisma.user.update.mockResolvedValue({ id: "user-1", name: "Alice Updated", email: "alice@test.com" });

    const res = await request(app)
      .patch("/api/users/user-1")
      .send({ name: "Alice Updated" });

    expect(res.status).toBe(200);
    expect(res.body.user.name).toBe("Alice Updated");
  });

  it("should return 400 when body is empty", async () => {
    const res = await request(app).patch("/api/users/user-1").send({});

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("should return 400 when email format is invalid", async () => {
    const res = await request(app)
      .patch("/api/users/user-1")
      .send({ email: "bad-format" });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("should return 404 when user does not exist", async () => {
    prisma.user.update.mockRejectedValue({ code: "P2025" });

    const res = await request(app)
      .patch("/api/users/ghost-id")
      .send({ name: "Ghost" });

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("error");
  });

  it("should return 409 when email conflicts with another user", async () => {
    prisma.user.findFirst.mockResolvedValue({ id: "other-user", name: "Other", email: "taken@test.com" });

    const res = await request(app)
      .patch("/api/users/user-1")
      .send({ email: "taken@test.com" });

    expect(res.status).toBe(409);
    expect(res.body).toHaveProperty("error");
  });
});

describe("DELETE /api/users/:id", () => {
  it("should delete a user and return 204", async () => {
    prisma.user.delete.mockResolvedValue({ id: "user-1", name: "Alice", email: "alice@test.com" });

    const res = await request(app).delete("/api/users/user-1");

    expect(res.status).toBe(204);
  });

  it("should return 404 when user does not exist", async () => {
    prisma.user.delete.mockRejectedValue({ code: "P2025" });

    const res = await request(app).delete("/api/users/ghost-id");

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("error");
  });
});

describe("Health endpoint", () => {
  it("GET /api/health should return healthy status", async () => {
    const res = await request(app).get("/api/health");

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("status", "healthy");
    expect(res.body).toHaveProperty("uptime");
  });
});
