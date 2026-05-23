import { mockDeep, mockReset, type DeepMockProxy } from "jest-mock-extended";
import { type PrismaClient } from "../generated/client";

export type MockPrismaClient = DeepMockProxy<PrismaClient>;

export function createPrismaMock(): MockPrismaClient {
  return mockDeep<PrismaClient>();
}

export { mockReset };
