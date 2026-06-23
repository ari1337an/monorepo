import { mockDeep, mockReset, type DeepMockProxy } from "jest-mock-extended";
import type { Knex } from "knex";
import type { Database } from "./database";

export type MockDatabase = DeepMockProxy<Database>;

export function createDatabaseMock(): MockDatabase {
  return mockDeep<Database>();
}

export type MockKnexQueryBuilder = DeepMockProxy<Knex.QueryBuilder>;

export function createQueryBuilderMock(): MockKnexQueryBuilder {
  return mockDeep<Knex.QueryBuilder>();
}

export { mockReset };
