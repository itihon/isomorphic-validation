import { FlatCompat } from "@eslint/eslintrc";
import eslintConfigPrettier from "eslint-config-prettier";
import globals from 'globals';
import path from "path";
import { fileURLToPath } from "url";

// mimic CommonJS variables -- not needed if using CommonJS
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
    baseDirectory: __dirname
});

const filesToLint = ['{src,__tests__}/**/*.{js,mjs}'];

const airbnb = compat.extends('eslint-config-airbnb-base')
  .map(cfg => {
    const rule = cfg.rules?.['no-restricted-syntax'];

    if (rule) {
      const allowForOfStatement = rule.filter(
        ({ selector }) => selector !== 'ForOfStatement',
      );

      cfg.rules['no-restricted-syntax'] = allowForOfStatement;
    }

    return cfg;
  })
  .map(cfg => (cfg.files = filesToLint, cfg));

/** @type { import("eslint").Linter.FlatConfig[] } */
export default [
  ...airbnb,
    eslintConfigPrettier,
    {
      files: filesToLint,
      languageOptions: {
        globals: {
          ...globals.browser,
        },
        parserOptions: {
          ecmaVersion: "latest",
          sourceType: "module",
        }
      } 
    },
    {
      rules: {
        "import/no-named-as-default": "off",
        "import/no-named-as-default-member": "off",
        "import/extensions": "off",
        "no-cond-assign": ["error", "except-parens"],
        "no-use-before-define": ["error", { "functions": false }],
        "no-plusplus": "off",
        "no-param-reassign": ["error", { "props": true, "ignorePropertyModificationsForRegex": [".*"] }],
        "no-nested-ternary": "off",
        "max-classes-per-file": [ "error", { "ignoreExpressions": true, "max": 2 } ],
      }
    },
    {
        ignores: ['dist/*', 'coverage/*', '**/*.jsdoc.*', '**/*bundle/*'],
    }
];