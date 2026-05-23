import { jest, beforeEach } from "@jest/globals";
import { createPrismaMock, mockReset, type MockPrismaClient } from "@workspace/database/testing";

const prismaMock: MockPrismaClient = createPrismaMock();

jest.unstable_mockModule("@workspace/database", () => ({
  prisma: prismaMock,
}));

beforeEach(() => {
  mockReset(prismaMock);
});

export { prismaMock };
