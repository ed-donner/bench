import { defineConfig } from "vitest/config";
import type { PluginOption } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

/** Multi-page build: one HTML entry per app, so their global styles never collide. */
const entry = (name: string) => fileURLToPath(new URL(name, import.meta.url));

const APPS = ["crm", "space", "rolodex", "groove"];

/** Dev only: send a deep link like /crm/contacts to that app's HTML, not the launcher. */
function appFallback(): PluginOption {
  return {
    name: "bench-app-fallback",
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        const { pathname } = new URL(req.url ?? "/", "http://localhost");
        const app = APPS.find(
          (name) => pathname === `/${name}` || pathname.startsWith(`/${name}/`),
        );
        if (app && !/\.[a-z0-9]+$/i.test(pathname))
          req.url = `/${app}/index.html`;
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), appFallback()],
  build: {
    rollupOptions: {
      input: {
        home: entry("index.html"),
        crm: entry("crm/index.html"),
        space: entry("space/index.html"),
        rolodex: entry("rolodex/index.html"),
        groove: entry("groove/index.html"),
      },
    },
  },
  server: {
    port: 8101,
    strictPort: true,
    proxy: { "/api": `http://localhost:${process.env.API_PORT ?? 8100}` },
  },
  preview: { port: 8102, strictPort: true },
  test: {
    environment: "jsdom",
    setupFiles: ["src/space/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    // The default 5s is wall-clock, and the parallel coverage run can starve a forked worker on
    // a slow or busy machine - a millisecond test then times out. No test here legitimately runs
    // long, so a generous limit hides nothing; a real hang still fails.
    testTimeout: 15_000,
    coverage: {
      provider: "v8",
      include: ["src/**"],
      // jsdom has no AudioContext, so Groove's audio graph cannot be unit tested without a mock
      // that would assert nothing about how it sounds. EXPLORATORY.md records that gap; excluding
      // it here keeps this threshold from implying coverage it does not have.
      exclude: [
        "src/**/main.tsx",
        "src/**/test/**",
        "src/**/*.test.*",
        "src/groove/audio/**",
      ],
      thresholds: { statements: 80 },
    },
  },
});
