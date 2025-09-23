module.exports = {
  root: true,
  extends: ["next/core-web-vitals"],
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
          "CallExpression[callee.object.name='localStorage'][callee.property.name='getItem']",
        message:
          "Do not read auth tokens from localStorage; use useAuthHeaders() from @makrx/auth. Avoid direct localStorage usage.",
      },
    ],
  },
  settings: {
    next: {
      rootDir: ["apps/*/", "packages/*/"],
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
    "backends/",
    "services/",
    "k8s/",
    "monitoring/",
    "scripts/",
    "ci/",
    "docs/"
  ],
};
