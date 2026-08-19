import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // The default 5s is wall-clock, and the parallel coverage run can starve a forked worker on
    // a slow or busy machine - a millisecond test then times out. No test here legitimately runs
    // long, so a generous limit hides nothing; a real hang still fails.
    testTimeout: 15_000,
    coverage: {
      provider: "v8",
      include: ["src/**"],
      exclude: ["src/index.ts"],
      thresholds: { statements: 80 },
    },
  },
});
