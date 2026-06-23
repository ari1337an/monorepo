import { describe } from "@jest/globals";
import { createDatabase } from "../index";
import { runProviderTests } from "./run-provider-tests";

describe("LibSQL", () => {
  runProviderTests({
    client: "libsql",
    createDb: () => createDatabase({ client: "libsql", connection: ":memory:" }),
  });
});
