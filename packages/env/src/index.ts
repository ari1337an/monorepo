import { config } from "dotenv";
import { existsSync } from "node:fs";
import { resolve, dirname } from "node:path";

let loaded = false;
let cachedRoot: string | null = null;

function findMonorepoRoot(startDir: string): string {
  let dir = startDir;
  while (dir !== dirname(dir)) {
    if (existsSync(resolve(dir, "pnpm-workspace.yaml"))) {
      return dir;
    }
    dir = dirname(dir);
  }
  return startDir;
}

export function getMonorepoRoot(): string {
  if (!cachedRoot) {
    cachedRoot = findMonorepoRoot(process.cwd());
  }
  return cachedRoot;
}

export function loadEnv(): void {
  if (loaded) return;

  const root = getMonorepoRoot();
  config({ path: resolve(root, ".env") });
  loaded = true;
}
