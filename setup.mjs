#!/usr/bin/env node

import { createInterface } from "node:readline/promises";
import { execSync } from "node:child_process";
import { rmSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { basename, resolve } from "node:path";

const rl = createInterface({ input: process.stdin, output: process.stdout });

const SERVICES = [
  { key: "1", name: "backend-express", label: "Backend (Express + Knex + Clean Architecture)" },
  { key: "2", name: "frontend-nextjs", label: "Frontend (Next.js + Tailwind)" },
  { key: "3", name: "frontend-vite", label: "Frontend (Vite + React + Tailwind)" },
];

const DATABASES = [
  { key: "1", client: "postgres", label: "PostgreSQL", provider: "postgresql" },
  { key: "2", client: "mysql", label: "MySQL", provider: "mysql" },
  { key: "3", client: "sqlite", label: "SQLite", provider: "sqlite" },
];

function generateEnv(client, dbName) {
  switch (client) {
    case "postgres":
      return [
        `DATABASE_CLIENT="postgres"`,
        `DATABASE_URL="postgresql://postgres:postgres@localhost:5432/${dbName}?schema=public"`,
      ].join("\n") + "\n";
    case "mysql":
      return [
        `DATABASE_CLIENT="mysql"`,
        `DATABASE_URL="mysql://root:root@localhost:3306/${dbName}"`,
      ].join("\n") + "\n";
    case "sqlite":
      return [
        `DATABASE_CLIENT="sqlite"`,
        `DATABASE_URL="./data/${dbName}.db"`,
      ].join("\n") + "\n";
  }
}

function generateDockerCompose(slug, dbName, client) {
  if (client === "postgres") {
    return [
      "volumes:",
      `  ${slug}_db_volume:`,
      "",
      "services:",
      `  ${slug}_db:`,
      "    image: postgres:18-alpine",
      "    restart: always",
      "    environment:",
      "      - POSTGRES_USER=postgres",
      "      - POSTGRES_PASSWORD=postgres",
      `      - POSTGRES_DB=${dbName}`,
      "    ports:",
      '      - "5432:5432"',
      "    volumes:",
      `      - ${slug}_db_volume:/var/lib/postgresql/data`,
    ].join("\n") + "\n";
  }

  if (client === "mysql") {
    return [
      "volumes:",
      `  ${slug}_db_volume:`,
      "",
      "services:",
      `  ${slug}_db:`,
      "    image: mysql:9-oracle",
      "    restart: always",
      "    environment:",
      "      - MYSQL_ROOT_PASSWORD=root",
      `      - MYSQL_DATABASE=${dbName}`,
      "    ports:",
      '      - "3306:3306"',
      "    volumes:",
      `      - ${slug}_db_volume:/var/lib/mysql`,
    ].join("\n") + "\n";
  }

  return null;
}

async function main() {
  console.log("\n╔══════════════════════════════════════╗");
  console.log("║   Workspace Monorepo Setup           ║");
  console.log("╚══════════════════════════════════════╝\n");

  const defaultName = basename(resolve("."));
  const projectName = (await rl.question(`Project name (${defaultName}): `)).trim() || defaultName;
  const slug = projectName.replace(/[^a-z0-9_]/gi, "_");

  const dbName = (await rl.question(`Database name (${slug}): `)).trim() || slug;

  console.log("\nDatabase engine:\n");
  for (const db of DATABASES) {
    console.log(`  ${db.key}. ${db.label}`);
  }

  const dbChoice = (await rl.question("\nSelect database (1): ")).trim() || "1";
  const selectedDb = DATABASES.find((d) => d.key === dbChoice) ?? DATABASES[0];

  console.log("\nAvailable services:\n");
  for (const svc of SERVICES) {
    console.log(`  ${svc.key}. ${svc.label}`);
  }

  const selected = (await rl.question("\nSelect services (comma-separated, e.g. 1,2,3): ")).trim();
  rl.close();

  if (!selected) {
    console.log("\nNo services selected. Keeping all services.\n");
  }

  const selectedKeys = selected ? selected.split(",").map((s) => s.trim()) : SERVICES.map((s) => s.key);
  const selectedNames = selectedKeys
    .map((key) => SERVICES.find((s) => s.key === key)?.name)
    .filter(Boolean);

  const hasBackend = selectedNames.includes("backend-express");

  console.log(`\n→ Project:  ${projectName}`);
  console.log(`→ Database: ${selectedDb.label} (${dbName})`);
  console.log(`→ Services: ${selectedNames.join(", ")}\n`);

  // Remove unselected services
  for (const svc of SERVICES) {
    if (!selectedNames.includes(svc.name)) {
      const svcPath = resolve("services", svc.name);
      if (existsSync(svcPath)) {
        rmSync(svcPath, { recursive: true, force: true });
        console.log(`  ✗ Removed services/${svc.name}`);
      }
    } else {
      console.log(`  ✓ Keeping services/${svc.name}`);
    }
  }

  // Generate .env
  writeFileSync(".env", generateEnv(selectedDb.client, dbName));
  writeFileSync(".env.example", generateEnv(selectedDb.client, dbName));
  console.log("\n  ✓ Created .env");

  // Generate docker-compose.yaml
  const compose = generateDockerCompose(slug, dbName, selectedDb.client);
  if (compose) {
    writeFileSync("docker-compose.yaml", compose);
    console.log("  ✓ Updated docker-compose.yaml");
  } else {
    if (existsSync("docker-compose.yaml")) {
      rmSync("docker-compose.yaml");
      console.log("  ✗ Removed docker-compose.yaml (not needed for SQLite)");
    }
  }

  // Update Prisma schema provider
  if (hasBackend && existsSync("packages/database/prisma/schema.prisma")) {
    let schema = readFileSync("packages/database/prisma/schema.prisma", "utf-8");
    schema = schema.replace(/provider\s*=\s*"postgresql"/, `provider = "${selectedDb.provider}"`);
    writeFileSync("packages/database/prisma/schema.prisma", schema);
    console.log(`  ✓ Updated schema.prisma (provider = "${selectedDb.provider}")`);
  }

  // Update root package.json
  const pkgPath = resolve("package.json");
  const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
  pkg.name = projectName;
  pkg.author = "";

  if (!hasBackend) {
    delete pkg.scripts["db:push"];
    delete pkg.scripts["db:migrate"];
    delete pkg.scripts["db:seed"];
    delete pkg.scripts["db:studio"];
    delete pkg.scripts["dev:studio"];

    const dbPkgPath = resolve("packages/database");
    if (existsSync(dbPkgPath)) {
      rmSync(dbPkgPath, { recursive: true, force: true });
      console.log("  ✗ Removed packages/database (no backend selected)");
    }
  }

  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
  console.log("  ✓ Updated package.json");

  // Initialize git
  console.log("\n→ Initializing git...");
  execSync("git init", { stdio: "pipe" });
  console.log("  ✓ Git initialized");

  // Install dependencies
  console.log("\n→ Installing dependencies...\n");
  execSync("pnpm install", { stdio: "inherit" });

  // Self-delete
  rmSync("setup.mjs");
  console.log("\n  ✓ Removed setup script");

  console.log("\n╔══════════════════════════════════════╗");
  console.log("║   Setup complete!                    ║");
  console.log("╚══════════════════════════════════════╝\n");

  if (compose) {
    console.log("  docker compose up -d");
  }
  console.log("  pnpm dev\n");
}

main().catch((err) => {
  console.error("\n✗ Setup failed:", err.message);
  process.exit(1);
});
