import { describe } from "@jest/globals";
import { readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createDatabase } from "../index";
import { runProviderTests } from "./run-provider-tests";

const TEMP_FILE = join(tmpdir(), "db-integration-test.json");
const state = JSON.parse(readFileSync(TEMP_FILE, "utf-8"));
const { url } = state.postgres as { url: string };

describe("PostgreSQL", () => {
  runProviderTests({
    client: "postgres",
    createDb: () => createDatabase(url),
  });
});
