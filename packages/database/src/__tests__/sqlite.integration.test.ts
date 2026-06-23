import { describe } from "@jest/globals";
import { createDatabase } from "../index";
import { runProviderTests } from "./run-provider-tests";

describe("SQLite", () => {
  runProviderTests({
    client: "sqlite",
    createDb: () => createDatabase(":memory:"),
  });
});
