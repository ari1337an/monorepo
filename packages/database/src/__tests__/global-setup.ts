import { execSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
import { tmpdir } from "node:os";
import { join } from "node:path";

export const TEMP_FILE = join(tmpdir(), "db-integration-test.json");

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function readPort(containerName: string, internalPort: number): string {
  const output = execSync(`docker port ${containerName} ${internalPort}`, {
    encoding: "utf-8",
  }).trim();
  return output.split(":").pop()!;
}

async function waitForPostgres(containerName: string, user: string, dbName: string): Promise<void> {
  for (let i = 0; i < 30; i++) {
    try {
      execSync(`docker exec ${containerName} pg_isready -U ${user} -d ${dbName}`, {
        stdio: "pipe",
      });
      return;
    } catch {
      await sleep(1000);
    }
  }
  throw new Error("PostgreSQL did not become ready within 30s");
}

async function waitForMySQL(containerName: string, password: string, dbName: string): Promise<void> {
  for (let i = 0; i < 60; i++) {
    try {
      execSync(
        `docker exec ${containerName} mysql -u root -p${password} ${dbName} -e "SELECT 1"`,
        { stdio: "pipe" },
      );

      // MySQL may restart after initial setup; verify stability
      await sleep(2000);
      execSync(
        `docker exec ${containerName} mysql -u root -p${password} ${dbName} -e "SELECT 1"`,
        { stdio: "pipe" },
      );
      return;
    } catch {
      await sleep(1000);
    }
  }
  throw new Error("MySQL did not become ready within 60s");
}

export default async function setup(): Promise<void> {
  const suffix = randomBytes(4).toString("hex");

  const pgName = `test_pg_${suffix}`;
  const pgPassword = randomBytes(16).toString("hex");
  const pgDb = `testdb_${suffix}`;

  const myName = `test_mysql_${suffix}`;
  const myPassword = randomBytes(16).toString("hex");
  const myDb = `testdb_${suffix}`;

  execSync(
    [
      "docker run -d",
      `--name ${pgName}`,
      `-e POSTGRES_USER=test_user`,
      `-e POSTGRES_PASSWORD=${pgPassword}`,
      `-e POSTGRES_DB=${pgDb}`,
      `-p 0:5432`,
      `postgres:18-alpine`,
    ].join(" "),
    { stdio: "pipe" },
  );

  execSync(
    [
      "docker run -d",
      `--name ${myName}`,
      `-e MYSQL_ROOT_PASSWORD=${myPassword}`,
      `-e MYSQL_DATABASE=${myDb}`,
      `-p 0:3306`,
      `mysql:9-oracle`,
    ].join(" "),
    { stdio: "pipe" },
  );

  try {
    await waitForPostgres(pgName, "test_user", pgDb);
    await waitForMySQL(myName, myPassword, myDb);
  } catch (err) {
    execSync(`docker rm -f ${pgName} ${myName}`, { stdio: "pipe" });
    throw err;
  }

  const pgPort = readPort(pgName, 5432);
  const myPort = readPort(myName, 3306);

  const state = {
    postgres: {
      url: `postgresql://test_user:${pgPassword}@localhost:${pgPort}/${pgDb}`,
      containerName: pgName,
    },
    mysql: {
      url: `mysql://root:${myPassword}@localhost:${myPort}/${myDb}`,
      containerName: myName,
    },
  };

  writeFileSync(TEMP_FILE, JSON.stringify(state));
}
