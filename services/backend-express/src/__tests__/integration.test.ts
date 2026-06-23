import { describe, it, expect } from "@jest/globals";
import type { MockUserRepository } from "./repository-mock";

const { mockUserRepository } = await import("./repository-mock");
const { setupApp } = await import("../main/settings/app");

const request = (await import("supertest")).default;

const repo = mockUserRepository as MockUserRepository;
const app = setupApp();

describe("Full CRUD lifecycle", () => {
  it("should create, read, update, and delete a user in sequence", async () => {
    repo.getByEmail.mockResolvedValue(undefined);
    repo.create.mockResolvedValue(undefined);

    const createRes = await request(app)
      .post("/api/users")
      .send({ name: "Lifecycle User", email: "lifecycle@test.com" });
    expect(createRes.status).toBe(201);
    expect(createRes.body.status).toBe("OK");

    const createdUser = createRes.body.data.user;

    repo.getById.mockResolvedValue(createdUser);
    const getRes = await request(app).get(`/api/users/${createdUser.id}`);
    expect(getRes.status).toBe(200);
    expect(getRes.body.data.user.name).toBe("Lifecycle User");

    repo.getByEmail.mockResolvedValue(undefined);
    repo.update.mockResolvedValue({ ...createdUser, name: "Updated User" });
    const patchRes = await request(app)
      .patch(`/api/users/${createdUser.id}`)
      .send({ name: "Updated User" });
    expect(patchRes.status).toBe(200);
    expect(patchRes.body.data.user.name).toBe("Updated User");

    repo.delete.mockResolvedValue(true);
    const deleteRes = await request(app).delete(`/api/users/${createdUser.id}`);
    expect(deleteRes.status).toBe(204);

    repo.getById.mockResolvedValue(undefined);
    const afterDeleteRes = await request(app).get(`/api/users/${createdUser.id}`);
    expect(afterDeleteRes.status).toBe(404);
    expect(afterDeleteRes.body.status).toBe("FAILED");
  });
});

describe("Error handling", () => {
  it("should return FAILED with INTERNAL_SERVER_ERROR and never expose details", async () => {
    repo.getAll.mockRejectedValue(new Error("password=secret in conn string"));

    const res = await request(app).get("/api/users");

    expect(res.status).toBe(500);
    expect(res.body.status).toBe("FAILED");
    expect(res.body.data).toBeNull();
    expect(res.body.error.code).toBe("INTERNAL_SERVER_ERROR");
    expect(res.body.error.message).toBe("Internal server error");
    expect(JSON.stringify(res.body)).not.toContain("password");
  });

  it("should handle concurrent requests", async () => {
    const users = [
      { id: "u1", name: "User 1", email: "u1@test.com" },
      { id: "u2", name: "User 2", email: "u2@test.com" },
    ];
    repo.getAll.mockResolvedValue(users);
    repo.getById.mockResolvedValue(users[0]);

    const [listRes, detailRes] = await Promise.all([
      request(app).get("/api/users"),
      request(app).get("/api/users/u1"),
    ]);

    expect(listRes.status).toBe(200);
    expect(listRes.body.data.users).toHaveLength(2);
    expect(detailRes.status).toBe(200);
    expect(detailRes.body.data.user.id).toBe("u1");
  });

  it("should correctly set CORS headers", async () => {
    repo.getAll.mockResolvedValue([]);

    const res = await request(app).get("/api/users");

    expect(res.headers["access-control-allow-origin"]).toBe("*");
  });
});
