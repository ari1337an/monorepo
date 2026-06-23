import type { Knex } from "knex";

export type SupportedClient = "postgres" | "mysql" | "sqlite";

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
