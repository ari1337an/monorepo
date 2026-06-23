import path from "node:path";
import { defineConfig } from "prisma/config";

const localDb = `file:${path.resolve(import.meta.dirname, "schema/local.db")}`;

export default defineConfig({
  schema: "schema/",
  migrations: {
    path: "schema/migrations",
    seed: "tsx src/seed.ts",
  },
  datasource: {
    url: localDb,
  },
});
