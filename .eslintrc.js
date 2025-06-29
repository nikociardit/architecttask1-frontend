// .eslintrc.js
module.exports = {
  extends: [
    "next/core-web-vitals",
    "next/typescript"
  ],
  rules: {
    "@next/next/no-img-element": "off",
    "react/no-unescaped-entities": "off",
    "@typescript-eslint/no-unused-vars": "warn",
    "@typescript-eslint/no-explicit-any": "warn",
    "prefer-const": "error",
    "no-var": "error"
  }
};
