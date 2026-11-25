import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const config = [
  ...nextVitals,
  ...nextTs,
  {
    // index.html is de originele statische website (v0-static-demo) en blijft ongewijzigd.
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
