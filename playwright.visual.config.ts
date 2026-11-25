import { defineConfig } from "@playwright/test";

/**
 * Visual comparison: renders the original index.html and the new Next.js site
 * side by side and compares the screenshots pixel by pixel.
 * Run after `npm run build`: npm run test:visual
 */
const PORT = 3100;

export default defineConfig({
  testDir: "tests/visual",
  fullyParallel: true,
  reporter: "list",
  timeout: 90_000,
  use: { baseURL: `http://localhost:${PORT}`, trace: "off" },
  webServer: {
    command: `npm run start -- --port ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
