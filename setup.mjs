#!/usr/bin/env node

import { createInterface } from "node:readline/promises";
import { execSync } from "node:child_process";
import { rmSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { basename, resolve } from "node:path";

const rl = createInterface({ input: process.stdin, output: process.stdout });

const SERVICES = [
  { key: "1", name: "backend-express", label: "Backend (Express + Prisma + Clean Architecture)" },
  { key: "2", name: "frontend-nextjs", label: "Frontend (Next.js + Tailwind)" },
  { key: "3", name: "frontend-vite", label: "Frontend (Vite + React + Tailwind)" },
];

async function main() {
  console.log("\n╔══════════════════════════════════════╗");
  console.log("║   Workspace Monorepo Setup           ║");
  console.log("╚══════════════════════════════════════╝\n");

  const defaultName = basename(resolve("."));
  const projectName = (await rl.question(`Project name (${defaultName}): `)).trim() || defaultName;

  const dbName = (await rl.question(`Database name (${projectName.replace(/[^a-z0-9_]/gi, "_")}): `)).trim()
    || projectName.replace(/[^a-z0-9_]/gi, "_");

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

  console.log(`\n→ Project: ${projectName}`);
  console.log(`→ Database: ${dbName}`);
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
  const envContent = `DATABASE_URL="postgresql://postgres:postgres@localhost:5432/${dbName}?schema=public"\n`;
  writeFileSync(".env", envContent);
  console.log("\n  ✓ Created .env");

  // Update docker-compose database name
  if (existsSync("docker-compose.yaml")) {
    const slug = projectName.replace(/[^a-z0-9_]/gi, "_");
    let compose = readFileSync("docker-compose.yaml", "utf-8");
    compose = compose.replace("POSTGRES_DB=database_name", `POSTGRES_DB=${dbName}`);
    compose = compose.replaceAll("workspace_database_volume", `${slug}_db_volume`);
    compose = compose.replace("workspace_database:", `${slug}_db:`);
    writeFileSync("docker-compose.yaml", compose);
    console.log("  ✓ Updated docker-compose.yaml");
  }

  // Update root package.json name
  const pkgPath = resolve("package.json");
  const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
  pkg.name = projectName;
  pkg.author = "";
  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
  console.log("  ✓ Updated package.json");

  // Remove db scripts if backend not selected
  if (!selectedNames.includes("backend-express")) {
    delete pkg.scripts["db:generate"];
    delete pkg.scripts["db:push"];
    delete pkg.scripts["db:migrate"];
    delete pkg.scripts["db:seed"];
    delete pkg.scripts["db:studio"];
    delete pkg.scripts["dev:studio"];
    writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");

    // Remove database package if no backend
    const dbPkgPath = resolve("packages/database");
    if (existsSync(dbPkgPath)) {
      rmSync(dbPkgPath, { recursive: true, force: true });
      console.log("  ✗ Removed packages/database (no backend selected)");
    }
  }

  // Initialize git
  console.log("\n→ Initializing git...");
  execSync("git init", { stdio: "pipe" });
  console.log("  ✓ Git initialized");

  // Install dependencies
  console.log("\n→ Installing dependencies...\n");
  execSync("pnpm install", { stdio: "inherit" });

  // Generate Prisma client if backend is selected
  if (selectedNames.includes("backend-express") && existsSync("packages/database")) {
    console.log("\n→ Generating Prisma client...");
    try {
      execSync("pnpm db:generate", { stdio: "inherit" });
    } catch {
      console.log("  ⚠ Prisma generate skipped (run 'pnpm db:generate' after starting the database)");
    }
  }

  // Self-delete
  rmSync("setup.mjs");
  console.log("\n  ✓ Removed setup script");

  console.log("\n╔══════════════════════════════════════╗");
  console.log("║   Setup complete!                    ║");
  console.log("╚══════════════════════════════════════╝");
  console.log(`\n  docker compose up -d`);
  console.log(`  pnpm dev\n`);
}

main().catch((err) => {
  console.error("\n✗ Setup failed:", err.message);
  process.exit(1);
});
