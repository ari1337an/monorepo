import { describe, it, expect } from "@jest/globals";
import { type MockPrismaClient } from "@workspace/database/testing";

const { prismaMock } = await import("./prisma-mock");

const { app } = await import("../app");

const request = (await import("supertest")).default;

const prisma = prismaMock as MockPrismaClient;

describe("Health endpoint", () => {
  it("GET /api/health should return healthy status", async () => {
    const res = await request(app).get("/api/health");

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("status", "healthy");
    expect(res.body).toHaveProperty("uptime");
    expect(typeof res.body.uptime).toBe("number");
  });
});

describe("User CRUD integration flow", () => {
  it("should handle a full create-read-update-delete lifecycle", async () => {
    const newUser = { id: "uuid-100", name: "Integration User", email: "integration@test.com" };

    prisma.user.create.mockResolvedValue(newUser);
    const createRes = await request(app)
      .post("/api/users")
      .send({ name: "Integration User", email: "integration@test.com" });
    expect(createRes.status).toBe(201);
    expect(createRes.body.user).toEqual(newUser);

    prisma.user.findUnique.mockResolvedValue(newUser);
    const getRes = await request(app).get("/api/users/uuid-100");
    expect(getRes.status).toBe(200);
    expect(getRes.body.user).toEqual(newUser);

    const updatedUser = { ...newUser, name: "Updated Integration User" };
    prisma.user.update.mockResolvedValue(updatedUser);
    const patchRes = await request(app)
      .patch("/api/users/uuid-100")
      .send({ name: "Updated Integration User" });
    expect(patchRes.status).toBe(200);
    expect(patchRes.body.user.name).toBe("Updated Integration User");

    prisma.user.delete.mockResolvedValue(updatedUser);
    const deleteRes = await request(app).delete("/api/users/uuid-100");
    expect(deleteRes.status).toBe(204);
  });

  it("should return 404 when fetching a deleted/non-existent user", async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    const res = await request(app).get("/api/users/deleted-id");

    expect(res.status).toBe(404);
    expect(res.body.error).toBe("User not found");
  });

  it("should handle database errors gracefully", async () => {
    prisma.user.findMany.mockRejectedValue(new Error("Connection refused"));

    const res = await request(app).get("/api/users");

    expect(res.status).toBe(500);
  });

  it("should handle concurrent requests correctly", async () => {
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

  it("should handle empty body on POST gracefully", async () => {
    prisma.user.create.mockResolvedValue({ id: "u-new", name: "", email: "" });

    const res = await request(app)
      .post("/api/users")
      .send({});

    expect(res.status).toBe(201);
    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: { name: undefined, email: undefined } }),
    );
  });

  it("should correctly set CORS headers", async () => {
    prisma.user.findMany.mockResolvedValue([]);

    const res = await request(app).get("/api/users");

    expect(res.headers["access-control-allow-origin"]).toBe("*");
  });

  it("should parse JSON body correctly", async () => {
    const input = { name: "JSON Test", email: "json@test.com" };
    const created = { id: "json-id", ...input };
    prisma.user.create.mockResolvedValue(created);

    const res = await request(app)
      .post("/api/users")
      .set("Content-Type", "application/json")
      .send(JSON.stringify(input));

    expect(res.status).toBe(201);
    expect(res.body.user.name).toBe("JSON Test");
  });
});
