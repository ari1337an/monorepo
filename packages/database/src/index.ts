import { Database } from "./database";
import { parseClientFromUrl } from "./types";
import type { DatabaseConfig } from "./types";

export function createDatabase(urlOrConfig: string | DatabaseConfig): Database {
  if (typeof urlOrConfig === "string") {
    return new Database({
      client: parseClientFromUrl(urlOrConfig),
      connection: urlOrConfig,
    });
  }
  return new Database(urlOrConfig);
}

export { Database } from "./database";
export { parseClientFromUrl } from "./types";

export type {
  SupportedClient,
  DatabaseConfig,
  ConnectionConfig,
  IDatabaseAdapter,
  QueryResult,
  TransactionFn,
} from "./types";
