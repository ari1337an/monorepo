import config from "@workspace/config-jest/node";

export default {
  ...config,
  globalSetup: "<rootDir>/src/__tests__/global-setup.ts",
  globalTeardown: "<rootDir>/src/__tests__/global-teardown.ts",
};
