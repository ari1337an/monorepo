import ClientLibSQL from "knex-libsql-client";
import type { Knex } from "knex";
import type { ConnectionConfig, IDatabaseAdapter } from "../types";

export class LibSQLAdapter implements IDatabaseAdapter {
  buildKnexConfig(connection: string | ConnectionConfig): Knex.Config {
    if (typeof connection !== "string") {
      throw new Error("LibSQL adapter requires a URL string connection");
    }

    if (connection === ":memory:") {
      return {
        client: ClientLibSQL,
        connection: { url: ":memory:" },
        useNullAsDefault: true,
      } as unknown as Knex.Config;
    }

    const parsed = new URL(connection);
    const authToken = parsed.searchParams.get("authToken") ?? undefined;
    parsed.searchParams.delete("authToken");

    return {
      client: ClientLibSQL,
      connection: {
        url: parsed.toString(),
        authToken,
      },
      useNullAsDefault: true,
    } as unknown as Knex.Config;
  }
}
