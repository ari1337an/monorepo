import base from "./base.js";

/** @type {import("jest").Config} */
const config = {
  ...base,
  testEnvironment: "node",
};

export default config;
