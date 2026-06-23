import type { Knex } from "knex";

export type SupportedClient = "postgres" | "mysql" | "sqlite" | "libsql";

export interface ConnectionConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

export interface DatabaseConfig {
  client: SupportedClient;
  connection: string | ConnectionConfig;
}

export interface IDatabaseAdapter {
  buildKnexConfig(connection: string | ConnectionConfig): Knex.Config;
}

export type QueryResult<T = Record<string, unknown>> = T[];

export type TransactionFn<T> = (trx: Knex.Transaction) => Promise<T>;

const PROTOCOL_MAP: Record<string, SupportedClient> = {
  "postgresql:": "postgres",
  "postgres:": "postgres",
  "mysql:": "mysql",
  "sqlite:": "sqlite",
  "libsql:": "libsql",
  "file:": "sqlite",
};

export function parseClientFromUrl(url: string): SupportedClient {
  if (url === ":memory:") return "sqlite";

  for (const [protocol, client] of Object.entries(PROTOCOL_MAP)) {
    if (url.startsWith(protocol)) return client;
  }

  if (url.endsWith(".sqlite") || url.endsWith(".db")) return "sqlite";

  throw new Error(
    `Cannot infer database client from URL. Supported protocols: ${Object.keys(PROTOCOL_MAP).join(", ")}`,
  );
}
