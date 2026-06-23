import type { Knex } from "knex";
import type { ConnectionConfig, IDatabaseAdapter } from "../types";

export class SQLiteAdapter implements IDatabaseAdapter {
  buildKnexConfig(connection: string | ConnectionConfig): Knex.Config {
    const filename = typeof connection === "string"
      ? this.parseFilename(connection)
      : `:memory:`;

    return {
      client: "better-sqlite3",
      connection: { filename },
      useNullAsDefault: true,
    };
  }

  private parseFilename(url: string): string {
    if (url === ":memory:") return url;
    if (url.startsWith("sqlite:")) return url.slice("sqlite:".length);
    if (url.startsWith("file:")) return url.slice("file:".length);
    return url;
  }
}
