import { execSync } from "node:child_process";
import { readFileSync, unlinkSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const TEMP_FILE = join(tmpdir(), "db-integration-test.json");

interface ContainerInfo {
  url: string;
  containerName: string;
}

export default async function teardown(): Promise<void> {
  if (!existsSync(TEMP_FILE)) return;

  try {
    const state = JSON.parse(readFileSync(TEMP_FILE, "utf-8")) as Record<string, ContainerInfo>;

    const names = Object.values(state)
      .map((c) => c.containerName)
      .join(" ");

    if (names) {
      execSync(`docker rm -f ${names}`, { stdio: "pipe" });
    }
  } finally {
    unlinkSync(TEMP_FILE);
  }
}
