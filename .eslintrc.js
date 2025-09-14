module.exports = {
  root: true,
  extends: ["next"],
  rules: {
    "@next/next/no-html-link-for-pages": "off",
    "react/no-unescaped-entities": "off",
    "@next/next/no-page-custom-font": "off",
    // Prevent insecure auth mocks and enforce proper auth headers
    "no-restricted-syntax": [
      "error",
      {
        selector: "Literal[value='mock-token']",
        message:
          "Do not use mock-token. Use real auth or omit Authorization header.",
      },
      {
        selector:
          "CallExpression[callee.object.name='localStorage'][callee.property.name='getItem'][arguments.0.value='auth_token']",
        message:
          "Avoid direct localStorage auth_token usage inline. Prefer a centralized helper (e.g., getAuthHeaders).",
      },
    ],
  },
  settings: {
    next: {
      rootDir: ["apps/*/"],
    },
  },
  ignorePatterns: [
    "node_modules/",
    ".next/",
    "dist/",
    "build/",
    "coverage/",
    "**/*.config.js",
    "**/*.config.ts",
  ],
};
