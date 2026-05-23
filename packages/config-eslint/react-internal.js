import eslintReact from "@eslint-react/eslint-plugin"
import pluginReactHooks from "eslint-plugin-react-hooks"
import globals from "globals"

import baseConfig from "./lib.js"

/** @type {import("eslint").Linter.Config[]} */
export const config = [
  ...baseConfig,
  eslintReact.configs["recommended-typescript"],
  {
    languageOptions: {
      globals: {
        ...globals.serviceworker,
        ...globals.browser,
      },
    },
  },
  {
    plugins: {
      "react-hooks": pluginReactHooks,
    },
    rules: {
      ...pluginReactHooks.configs.recommended.rules,
    },
  },
]
