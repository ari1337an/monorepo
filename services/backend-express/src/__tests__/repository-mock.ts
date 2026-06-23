import { jest, beforeEach } from "@jest/globals";
import type { IUserRepository } from "@/application/repositories/user/user-repository";

type MockFn = ReturnType<typeof jest.fn>;

export type MockUserRepository = {
  [K in keyof IUserRepository]: MockFn;
};

const mockUserRepository: MockUserRepository = {
  getAll: jest.fn(),
  getById: jest.fn(),
  getByEmail: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

jest.unstable_mockModule("@/shared/database/index", () => ({
  getDatabase: jest.fn().mockReturnValue({}),
  setDatabase: jest.fn(),
}));

jest.unstable_mockModule("@/infrastructure/repositories/user/user-repository", () => ({
  SqlUserRepository: jest.fn().mockImplementation(() => mockUserRepository),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

export { mockUserRepository };
