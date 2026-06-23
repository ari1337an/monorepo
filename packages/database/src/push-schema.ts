import { execSync } from "node:child_process";
import { loadEnv } from "@workspace/env";
import { createDatabase } from "./index";
import { parseClientFromUrl } from "./types";

loadEnv();

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const client = parseClientFromUrl(url);
const isLocal = client === "sqlite" && !url.startsWith("libsql:");

if (isLocal) {
  console.log("⟡ Local SQLite detected — running prisma db push\n");
  execSync("npx prisma db push", { stdio: "inherit", cwd: import.meta.dirname + "/.." });
  process.exit(0);
}

console.log(`⟡ Remote ${client} detected — pushing schema via Knex\n`);

const db = createDatabase(url);

async function pushSchema(): Promise<void> {
  const hasUser = await db.knex.schema.hasTable("User");

  if (!hasUser) {
    await db.knex.schema.createTable("User", (t) => {
      t.string("id").primary();
      t.string("name").notNullable();
      t.string("email").notNullable();
    });
    console.log("✓ Created table: User");
  } else {
    console.log("· Table already exists: User");
  }

  console.log("✓ Schema push complete");
}

pushSchema()
  .catch((err) => {
    console.error("Schema push failed:", err);
    process.exit(1);
  })
  .finally(() => db.disconnect());
