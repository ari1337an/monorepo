import { Database } from "./database";
import type { DatabaseConfig } from "./types";

export function createDatabase(config: DatabaseConfig): Database {
  return new Database(config);
}

export { Database } from "./database";

export type {
  SupportedClient,
  DatabaseConfig,
  ConnectionConfig,
  IDatabaseAdapter,
  QueryResult,
  TransactionFn,
} from "./types";
