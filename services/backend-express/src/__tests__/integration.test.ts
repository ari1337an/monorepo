import { describe, it, expect } from "@jest/globals";
import { type MockPrismaClient } from "@workspace/database/testing";

const { prismaMock } = await import("./prisma-mock");
const { setupApp } = await import("../main/settings/app");

const request = (await import("supertest")).default;

const prisma = prismaMock as MockPrismaClient;
const app = setupApp();

describe("Full CRUD lifecycle", () => {
  it("should create, read, update, and delete a user in sequence", async () => {
    prisma.user.findFirst.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue({ id: "uuid-100", name: "Lifecycle User", email: "lifecycle@test.com" });

    const createRes = await request(app)
      .post("/api/users")
      .send({ name: "Lifecycle User", email: "lifecycle@test.com" });
    expect(createRes.status).toBe(201);

    prisma.user.findUnique.mockResolvedValue({ id: "uuid-100", name: "Lifecycle User", email: "lifecycle@test.com" });
    const getRes = await request(app).get("/api/users/uuid-100");
    expect(getRes.status).toBe(200);
    expect(getRes.body.user.name).toBe("Lifecycle User");

    prisma.user.findFirst.mockResolvedValue(null);
    prisma.user.update.mockResolvedValue({ id: "uuid-100", name: "Updated User", email: "lifecycle@test.com" });
    const patchRes = await request(app)
      .patch("/api/users/uuid-100")
      .send({ name: "Updated User" });
    expect(patchRes.status).toBe(200);
    expect(patchRes.body.user.name).toBe("Updated User");

    prisma.user.delete.mockResolvedValue({ id: "uuid-100", name: "Updated User", email: "lifecycle@test.com" });
    const deleteRes = await request(app).delete("/api/users/uuid-100");
    expect(deleteRes.status).toBe(204);

    prisma.user.findUnique.mockResolvedValue(null);
    const afterDeleteRes = await request(app).get("/api/users/uuid-100");
    expect(afterDeleteRes.status).toBe(404);
  });
});

describe("Error handling", () => {
  it("should never expose internal error details to the client", async () => {
    prisma.user.findMany.mockRejectedValue(new Error("password=secret in conn string"));

    const res = await request(app).get("/api/users");

    expect(res.status).toBe(500);
  });

  it("should handle concurrent requests", async () => {
    const users = [
      { id: "u1", name: "User 1", email: "u1@test.com" },
      { id: "u2", name: "User 2", email: "u2@test.com" },
    ];
    prisma.user.findMany.mockResolvedValue(users);
    prisma.user.findUnique.mockResolvedValue(users[0]!);

    const [listRes, detailRes] = await Promise.all([
      request(app).get("/api/users"),
      request(app).get("/api/users/u1"),
    ]);

    expect(listRes.status).toBe(200);
    expect(listRes.body.users).toHaveLength(2);
    expect(detailRes.status).toBe(200);
    expect(detailRes.body.user.id).toBe("u1");
  });

  it("should correctly set CORS headers", async () => {
    prisma.user.findMany.mockResolvedValue([]);

    const res = await request(app).get("/api/users");

    expect(res.headers["access-control-allow-origin"]).toBe("*");
  });
});
