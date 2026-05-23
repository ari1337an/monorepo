import config from "@workspace/config-eslint/lib.js";

export default [
  { ignores: ["generated/"] },
  ...config,
];
