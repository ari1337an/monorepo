import type { Knex } from "knex";
import type { ConnectionConfig, IDatabaseAdapter } from "../types";

export class PostgresAdapter implements IDatabaseAdapter {
  buildKnexConfig(connection: string | ConnectionConfig): Knex.Config {
    const conn = typeof connection === "string"
      ? this.sanitizeConnectionString(connection)
      : connection;

    return {
      client: "pg",
      connection: conn,
      pool: { min: 2, max: 10 },
    };
  }

  private sanitizeConnectionString(url: string): string {
    const parsed = new URL(url);
    parsed.searchParams.delete("schema");
    return parsed.toString();
  }
}
