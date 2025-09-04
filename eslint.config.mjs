import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "**/*", // Ignore all files - ESLint disabled
    ],
  },
  {
    rules: {
      // Disable all ESLint rules
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/prefer-const": "off",
      "@typescript-eslint/no-inferrable-types": "off",
      "@typescript-eslint/no-empty-function": "off",
      "@typescript-eslint/no-var-requires": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "react/no-unescaped-entities": "off",
      "react/display-name": "off",
      "react/prop-types": "off",
      "react-hooks/rules-of-hooks": "off",
      "react-hooks/exhaustive-deps": "off",
      "prefer-const": "off",
      "no-unused-vars": "off",
      "no-console": "off",
      "no-debugger": "off",
      "no-alert": "off",
      "no-undef": "off",
      "no-unreachable": "off",
      "no-empty": "off",
      "no-irregular-whitespace": "off",
      "no-extra-semi": "off",
      "semi": "off",
      "quotes": "off",
      "indent": "off",
      "eqeqeq": "off",
      "curly": "off",
      "brace-style": "off",
      "no-trailing-spaces": "off",
      "eol-last": "off",
      "comma-dangle": "off",
      "object-curly-spacing": "off",
      "array-bracket-spacing": "off",
      "space-before-function-paren": "off",
      "space-in-parens": "off",
      "keyword-spacing": "off",
      "space-before-blocks": "off",
      "spaced-comment": "off",
      "no-multiple-empty-lines": "off",
      "padded-blocks": "off",
      "no-mixed-spaces-and-tabs": "off",
      "no-tabs": "off"
    }
  }
];

export default eslintConfig;
