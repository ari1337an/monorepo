import type { SupportedClient, IDatabaseAdapter } from "../types";
import { PostgresAdapter } from "./postgres.adapter";
import { MySQLAdapter } from "./mysql.adapter";
import { SQLiteAdapter } from "./sqlite.adapter";

const adapterRegistry: Record<SupportedClient, () => IDatabaseAdapter> = {
  postgres: () => new PostgresAdapter(),
  mysql: () => new MySQLAdapter(),
  sqlite: () => new SQLiteAdapter(),
};

export function resolveAdapter(client: SupportedClient): IDatabaseAdapter {
  const factory = adapterRegistry[client];
  if (!factory) {
    throw new Error(
      `Unsupported database client: "${client}". Supported: ${Object.keys(adapterRegistry).join(", ")}`,
    );
  }
  return factory();
}
