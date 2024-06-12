import { FlatCompat } from "@eslint/eslintrc";
import eslintConfigPrettier from "eslint-config-prettier";
import path from "path";
import { fileURLToPath } from "url";

// mimic CommonJS variables -- not needed if using CommonJS
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
    baseDirectory: __dirname
});

export default [
  //...[].concat(config),
  // mimic ESLintRC-style extends
    ...compat.extends("eslint-config-airbnb-base"),
    eslintConfigPrettier,
  {
      ignores: ["dist/*", "tests/*"]
  }
];