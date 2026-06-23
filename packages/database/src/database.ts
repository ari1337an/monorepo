import knex, { type Knex } from "knex";
import type { DatabaseConfig, TransactionFn } from "./types";
import { resolveAdapter } from "./adapters/index";

export class Database {
  private readonly instance: Knex;

  constructor(config: DatabaseConfig) {
    const adapter = resolveAdapter(config.client);
    const knexConfig = adapter.buildKnexConfig(config.connection);
    this.instance = knex(knexConfig);
  }

  table<T extends Record<string, unknown> = Record<string, unknown>>(tableName: string) {
    return this.instance<T>(tableName);
  }

  raw<T = unknown>(sql: string, bindings?: readonly Knex.RawBinding[]): Knex.Raw<T> {
    return this.instance.raw<T>(sql, bindings as Knex.RawBinding[]);
  }

  async transaction<T>(fn: TransactionFn<T>): Promise<T> {
    return this.instance.transaction(fn);
  }

  async disconnect(): Promise<void> {
    await this.instance.destroy();
  }

  get knex(): Knex {
    return this.instance;
  }
}
