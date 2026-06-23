import { createDatabase, type Database } from "@workspace/database";
import { env } from "@/shared/env/index";

let instance: Database | null = null;

export function getDatabase(): Database {
  if (!instance) {
    instance = createDatabase(env.DATABASE_URL);
  }
  return instance;
}

export function setDatabase(db: Database): void {
  instance = db;
}
