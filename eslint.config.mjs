import { createRequire } from "module";

const require = createRequire(import.meta.url);

/** @type {import("eslint").Linter.Config[]} */
const eslintConfig = [
  ...require("eslint-config-next/core-web-vitals"),
  ...require("eslint-config-next/typescript"),
  {
    ignores: ["node_modules/**"],
  },
  {
    rules: {
      // React Compiler / Hooks 7: too strict for common hydration and controlled-sync patterns in this app
      "react-hooks/set-state-in-effect": "off",
    },
  },
];

export default eslintConfig;
