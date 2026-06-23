import type { Knex } from "knex";
import type { ConnectionConfig, IDatabaseAdapter } from "../types";

export class MySQLAdapter implements IDatabaseAdapter {
  buildKnexConfig(connection: string | ConnectionConfig): Knex.Config {
    return {
      client: "mysql2",
      connection,
      pool: { min: 2, max: 10 },
    };
  }
}
