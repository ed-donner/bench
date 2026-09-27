import { defineConfig } from "@playwright/test";

/**
 * No webServer block: e2e/fixtures.ts starts one server per worker, each with its own
 * database, so specs never share state. Ports run from 8150 upwards.
 */
export default defineConfig({
  testDir: "e2e",
  globalSetup: "./e2e/global-setup.ts",
  timeout: 30_000,
  retries: 1,
  reporter: [["list"]],
  use: {
    // The board's columns plus the sidebar need a desktop width; at Playwright's 1280 default a
    // card sits partly outside the viewport and drags never activate.
    viewport: { width: 1440, height: 900 },
    // The first visit follows the browser's language, so pin it: the existing specs select by
    // English names and must not turn Spanish on a machine set to es.
    locale: "en-US",
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { browserName: "chromium" } }],
});
