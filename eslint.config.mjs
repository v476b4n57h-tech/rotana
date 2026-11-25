import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const config = [
  ...nextVitals,
  ...nextTs,
  {
    // index.html is the original static website (v0-static-demo) and stays untouched.
    ignores: [
      ".next/**",
      "node_modules/**",
      "index.html",
      "playwright-report/**",
      "test-results/**",
      "next-env.d.ts",
    ],
  },
];

export default config;
