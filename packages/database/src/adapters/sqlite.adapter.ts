import type { Knex } from "knex";
import type { ConnectionConfig, IDatabaseAdapter } from "../types";

export class SQLiteAdapter implements IDatabaseAdapter {
  buildKnexConfig(connection: string | ConnectionConfig): Knex.Config {
    const filename = typeof connection === "string"
      ? connection
      : `:memory:`;

    return {
      client: "better-sqlite3",
      connection: { filename },
      useNullAsDefault: true,
    };
  }
}
