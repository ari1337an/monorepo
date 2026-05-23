import base from "./base.js";

/** @type {import("jest").Config} */
const config = {
  ...base,
  testEnvironment: "jest-environment-jsdom",
  setupFilesAfterEnv: ["@testing-library/jest-dom"],
};

export default config;
