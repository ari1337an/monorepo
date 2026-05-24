import config from "@workspace/config-jest/node";

export default {
  ...config,
  moduleNameMapper: {
    ...config.moduleNameMapper,
    "^@/(.*)$": "<rootDir>/src/$1",
  },
};
