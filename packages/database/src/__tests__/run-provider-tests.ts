import { describe, it, expect, beforeAll, afterAll, beforeEach } from "@jest/globals";
import { randomUUID } from "node:crypto";
import type { SupportedClient } from "../index";

const TEST_TABLE = "test_item";

interface ProviderTestOptions {
  createDb: () => ReturnType<typeof import("../index").createDatabase>;
  client: SupportedClient;
}

export function runProviderTests({ createDb, client }: ProviderTestOptions): void {
  let db: Database;

  beforeAll(async () => {
    db = createDb();

    await db.knex.schema.createTable(TEST_TABLE, (table) => {
      table.string("id").primary();
      table.string("name").notNullable();
      table.integer("value").notNullable().defaultTo(0);
    });
  });

  afterAll(async () => {
    await db.knex.schema.dropTableIfExists(TEST_TABLE);
    await db.disconnect();
  });

  beforeEach(async () => {
    await db.table(TEST_TABLE).delete();
  });

  describe("createDatabase", () => {
    it("produces a valid Database instance", () => {
      expect(db).toBeDefined();
      expect(db.knex).toBeDefined();
    });

    it(`works with explicit { client: "${client}" } config`, () => {
      const instance = createDb();
      expect(instance).toBeDefined();
      instance.disconnect();
    });
  });

  describe("table CRUD", () => {
    it("inserts and selects rows", async () => {
      const id = randomUUID();
      await db.table(TEST_TABLE).insert({ id, name: "item-a", value: 10 });

      const rows = await db.table(TEST_TABLE).select("*");
      expect(rows).toHaveLength(1);
      expect(rows[0]).toMatchObject({ id, name: "item-a", value: 10 });
    });

    it("selects by column filter", async () => {
      await db.table(TEST_TABLE).insert([
        { id: randomUUID(), name: "alpha", value: 1 },
        { id: randomUUID(), name: "beta", value: 2 },
      ]);

      const result = await db.table(TEST_TABLE).where({ name: "beta" }).first();
      expect(result).toBeDefined();
      expect(result!.name).toBe("beta");
      expect(result!.value).toBe(2);
    });

    it("updates rows", async () => {
      const id = randomUUID();
      await db.table(TEST_TABLE).insert({ id, name: "original", value: 0 });

      await db.table(TEST_TABLE).where({ id }).update({ name: "updated", value: 99 });

      const row = await db.table(TEST_TABLE).where({ id }).first();
      expect(row).toMatchObject({ name: "updated", value: 99 });
    });

    it("deletes rows", async () => {
      const id = randomUUID();
      await db.table(TEST_TABLE).insert({ id, name: "to-delete", value: 0 });

      const deleted = await db.table(TEST_TABLE).where({ id }).delete();
      expect(deleted).toBe(1);

      const remaining = await db.table(TEST_TABLE).select("*");
      expect(remaining).toHaveLength(0);
    });
  });

  describe("raw SQL", () => {
    it("executes parameterized queries", async () => {
      const id = randomUUID();
      await db.table(TEST_TABLE).insert({ id, name: "raw-test", value: 42 });

      const result = await db.raw(
        `SELECT * FROM ${TEST_TABLE} WHERE name = ?`,
        ["raw-test"],
      );

      // Normalize across drivers:
      //   PostgreSQL returns { rows: [...] }
      //   MySQL returns [[...rows], fields]
      //   SQLite/LibSQL returns [...rows]
      let rows: Record<string, unknown>[];
      if (Array.isArray(result)) {
        rows = Array.isArray(result[0]) ? result[0] : result;
      } else if (result.rows) {
        rows = result.rows as Record<string, unknown>[];
      } else {
        rows = [result] as Record<string, unknown>[];
      }

      const match = rows.find((r) => r.name === "raw-test");
      expect(match).toBeDefined();
      expect(match!.value).toBe(42);
    });
  });

  describe("transactions", () => {
    it("commits on success", async () => {
      const ids = [randomUUID(), randomUUID()];

      await db.transaction(async (trx) => {
        await trx(TEST_TABLE).insert({ id: ids[0], name: "trx-a", value: 1 });
        await trx(TEST_TABLE).insert({ id: ids[1], name: "trx-b", value: 2 });
      });

      const rows = await db.table(TEST_TABLE).select("*").orderBy("name");
      expect(rows).toHaveLength(2);
      expect(rows[0]!.name).toBe("trx-a");
      expect(rows[1]!.name).toBe("trx-b");
    });

    it("rolls back on error", async () => {
      const id = randomUUID();

      await expect(
        db.transaction(async (trx) => {
          await trx(TEST_TABLE).insert({ id, name: "should-rollback", value: 0 });
          throw new Error("intentional failure");
        }),
      ).rejects.toThrow("intentional failure");

      const rows = await db.table(TEST_TABLE).select("*");
      expect(rows).toHaveLength(0);
    });
  });

  describe("concurrent queries", () => {
    it("handles multiple parallel selects", async () => {
      await db.table(TEST_TABLE).insert([
        { id: randomUUID(), name: "concurrent-1", value: 1 },
        { id: randomUUID(), name: "concurrent-2", value: 2 },
        { id: randomUUID(), name: "concurrent-3", value: 3 },
      ]);

      const results = await Promise.all([
        db.table(TEST_TABLE).where({ name: "concurrent-1" }).first(),
        db.table(TEST_TABLE).where({ name: "concurrent-2" }).first(),
        db.table(TEST_TABLE).where({ name: "concurrent-3" }).first(),
      ]);

      expect(results[0]!.value).toBe(1);
      expect(results[1]!.value).toBe(2);
      expect(results[2]!.value).toBe(3);
    });
  });

  describe("disconnect", () => {
    it("closes the connection pool", async () => {
      const ephemeral = createDb();

      await ephemeral.knex.schema.createTable("disconnect_test", (t) => {
        t.string("id").primary();
      });
      await ephemeral.table("disconnect_test").insert({ id: "check" });

      const rows = await ephemeral.table("disconnect_test").select("*");
      expect(rows).toHaveLength(1);

      await ephemeral.disconnect();

      await expect(ephemeral.table("disconnect_test").select("*")).rejects.toThrow();
    });
  });
}
