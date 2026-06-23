import { describe, it, expect } from "@jest/globals";
import type { MockUserRepository } from "./repository-mock";

const { mockUserRepository } = await import("./repository-mock");
const { setupApp } = await import("../main/settings/app");

const request = (await import("supertest")).default;

const repo = mockUserRepository as MockUserRepository;
const app = setupApp();

describe("GET /api/users", () => {
  it("should return all users with status OK", async () => {
    const mockUsers = [
      { id: "user-1", name: "Alice", email: "alice@test.com" },
      { id: "user-2", name: "Bob", email: "bob@test.com" },
    ];
    repo.getAll.mockResolvedValue(mockUsers);

    const res = await request(app).get("/api/users");

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("OK");
    expect(res.body.data).toEqual({ users: mockUsers });
    expect(res.body.error).toBeNull();
  });

  it("should return an empty array when no users exist", async () => {
    repo.getAll.mockResolvedValue([]);

    const res = await request(app).get("/api/users");

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("OK");
    expect(res.body.data).toEqual({ users: [] });
  });
});

describe("GET /api/users/:id", () => {
  it("should return a user by id with status OK", async () => {
    const mockUser = { id: "user-1", name: "Alice", email: "alice@test.com" };
    repo.getById.mockResolvedValue(mockUser);

    const res = await request(app).get("/api/users/user-1");

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("OK");
    expect(res.body.data).toEqual({ user: mockUser });
    expect(res.body.error).toBeNull();
  });

  it("should return FAILED with NOT_FOUND when user does not exist", async () => {
    repo.getById.mockResolvedValue(undefined);

    const res = await request(app).get("/api/users/non-existent");

    expect(res.status).toBe(404);
    expect(res.body.status).toBe("FAILED");
    expect(res.body.data).toBeNull();
    expect(res.body.error.code).toBe("NOT_FOUND");
  });
});

describe("POST /api/users", () => {
  it("should create a new user and return 201 with status OK", async () => {
    repo.getByEmail.mockResolvedValue(undefined);
    repo.create.mockResolvedValue(undefined);

    const res = await request(app)
      .post("/api/users")
      .send({ name: "Charlie", email: "charlie@test.com" });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe("OK");
    expect(res.body.data.user).toHaveProperty("name", "Charlie");
    expect(res.body.data.user).toHaveProperty("email", "charlie@test.com");
    expect(res.body.error).toBeNull();
  });

  it("should return FAILED with INVALID_PARAM when name is missing", async () => {
    const res = await request(app).post("/api/users").send({ email: "test@test.com" });

    expect(res.status).toBe(400);
    expect(res.body.status).toBe("FAILED");
    expect(res.body.data).toBeNull();
    expect(res.body.error.code).toBe("INVALID_PARAM");
  });

  it("should return FAILED with INVALID_PARAM when email is invalid", async () => {
    const res = await request(app).post("/api/users").send({ name: "Test", email: "not-email" });

    expect(res.status).toBe(400);
    expect(res.body.status).toBe("FAILED");
    expect(res.body.error.code).toBe("INVALID_PARAM");
  });

  it("should return FAILED with INVALID_PARAM when name is too short", async () => {
    const res = await request(app).post("/api/users").send({ name: "A", email: "a@b.com" });

    expect(res.status).toBe(400);
    expect(res.body.status).toBe("FAILED");
    expect(res.body.error.code).toBe("INVALID_PARAM");
  });

  it("should return FAILED with ALREADY_EXISTS when email is taken", async () => {
    repo.getByEmail.mockResolvedValue({ id: "existing", name: "Existing", email: "taken@test.com" });

    const res = await request(app)
      .post("/api/users")
      .send({ name: "New User", email: "taken@test.com" });

    expect(res.status).toBe(409);
    expect(res.body.status).toBe("FAILED");
    expect(res.body.data).toBeNull();
    expect(res.body.error.code).toBe("ALREADY_EXISTS");
  });
});

describe("PATCH /api/users/:id", () => {
  it("should update a user's name and return OK", async () => {
    repo.update.mockResolvedValue({ id: "user-1", name: "Alice Updated", email: "alice@test.com" });

    const res = await request(app)
      .patch("/api/users/user-1")
      .send({ name: "Alice Updated" });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("OK");
    expect(res.body.data.user.name).toBe("Alice Updated");
  });

  it("should return FAILED with INVALID_PARAM when body is empty", async () => {
    const res = await request(app).patch("/api/users/user-1").send({});

    expect(res.status).toBe(400);
    expect(res.body.status).toBe("FAILED");
    expect(res.body.error.code).toBe("INVALID_PARAM");
  });

  it("should return FAILED with INVALID_PARAM when email format is invalid", async () => {
    const res = await request(app)
      .patch("/api/users/user-1")
      .send({ email: "bad-format" });

    expect(res.status).toBe(400);
    expect(res.body.status).toBe("FAILED");
    expect(res.body.error.code).toBe("INVALID_PARAM");
  });

  it("should return FAILED with NOT_FOUND when user does not exist", async () => {
    repo.update.mockResolvedValue(undefined);

    const res = await request(app)
      .patch("/api/users/ghost-id")
      .send({ name: "Ghost" });

    expect(res.status).toBe(404);
    expect(res.body.status).toBe("FAILED");
    expect(res.body.error.code).toBe("NOT_FOUND");
  });

  it("should return FAILED with ALREADY_EXISTS when email conflicts", async () => {
    repo.getByEmail.mockResolvedValue({ id: "other-user", name: "Other", email: "taken@test.com" });

    const res = await request(app)
      .patch("/api/users/user-1")
      .send({ email: "taken@test.com" });

    expect(res.status).toBe(409);
    expect(res.body.status).toBe("FAILED");
    expect(res.body.error.code).toBe("ALREADY_EXISTS");
  });
});

describe("DELETE /api/users/:id", () => {
  it("should delete a user and return 204", async () => {
    repo.delete.mockResolvedValue(true);

    const res = await request(app).delete("/api/users/user-1");

    expect(res.status).toBe(204);
  });

  it("should return FAILED with NOT_FOUND when user does not exist", async () => {
    repo.delete.mockResolvedValue(false);

    const res = await request(app).delete("/api/users/ghost-id");

    expect(res.status).toBe(404);
    expect(res.body.status).toBe("FAILED");
    expect(res.body.error.code).toBe("NOT_FOUND");
  });
});

describe("Health endpoint", () => {
  it("GET /api/health should return OK with healthy status", async () => {
    const res = await request(app).get("/api/health");

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("OK");
    expect(res.body.data).toHaveProperty("status", "healthy");
    expect(res.body.data).toHaveProperty("uptime");
    expect(res.body.error).toBeNull();
  });
});
