import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import sonarjs from "eslint-plugin-sonarjs";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import jsxA11y from "eslint-plugin-jsx-a11y";
import vitest from "@vitest/eslint-plugin";
import playwright from "eslint-plugin-playwright";
import prettier from "eslint-config-prettier";

/**
 * One flat config for web, server and e2e. Type-aware rules reach both workspace tsconfigs plus
 * the root one covering e2e through typescript-eslint's projectService.
 *
 * TypeScript is pinned to exactly 6.0.3 repo-wide: it is the last release exposing the JS compiler
 * API these rules are built on, and 6.1.0 would fall outside typescript-eslint's peer range.
 */
export default tseslint.config(
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/coverage/**",
      "e2e/.tmp/**",
      "test-results/**",
      "playwright-report/**",
      "data/**",
    ],
  },

  js.configs.recommended,
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  sonarjs.configs.recommended,

  {
    linterOptions: { reportUnusedDisableDirectives: "error" },
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // `onChange={(e) => setName(e.target.value)}` is the React idiom and reads better than the
      // braced form the rule would otherwise demand at ~190 call sites. The rule still catches the
      // case worth catching: `return someVoidCall()` from a normal function.
      "@typescript-eslint/no-confusing-void-expression": [
        "error",
        { ignoreArrowShorthand: true },
      ],

      // A number in a template literal is unambiguous. What this rule is worth keeping for is
      // `string | undefined`, which silently prints "undefined", and that stays an error.
      "@typescript-eslint/restrict-template-expressions": [
        "error",
        { allowNumber: true },
      ],

      // `useFetch<Deal[]>(url)` names the shape the caller expects back from untrusted JSON. The
      // rule is right that a once-used type parameter is a disguised cast - that is exactly what
      // it is, and moving the cast to every call site would not make it any more checked.
      "@typescript-eslint/no-unnecessary-type-parameters": "off",

      // A sort key is a number for a numeric column and a string for everything else, and that is
      // the point: collapsing it to one type would sort 10 before 9.
      "sonarjs/function-return-type": "off",

      // `Readonly<Props>` on 61 component signatures, for a mutation this codebase never performs
      // and which `Readonly` is too shallow to prevent anyway. Ceremony, not safety.
      "sonarjs/prefer-read-only-props": "off",

      // Contradicts non-nullable-type-assertion-style, which is also on and asks for `x!` in
      // preference to `x as T`. Every site here is one TypeScript's narrowing cannot follow - a
      // `.filter(Boolean)`, a length already checked, the app's own `#root` - so `!` is the
      // honest spelling and `as T` would only be the same assertion, worse.
      "@typescript-eslint/no-non-null-assertion": "off",

      // `job_title || "—"` is deliberate: an empty string should fall through to the dash, and `??`
      // would render the empty string instead. The rule is right about objects, wrong about these.
      "@typescript-eslint/prefer-nullish-coalescing": [
        "error",
        { ignorePrimitives: { string: true } },
      ],

      // These enforce "short functions, short modules" from STANDARDS.md. `complexity` and
      // sonarjs/cognitive-complexity are the ones that measure whether a function is actually hard
      // to follow, and they stay strict; the line counts are here to catch sprawl.
      complexity: ["error", 15],
      "max-depth": ["error", 4],
      "max-lines": [
        "error",
        { max: 500, skipBlankLines: true, skipComments: true },
      ],
      "max-lines-per-function": [
        "error",
        { max: 200, skipBlankLines: true, skipComments: true },
      ],
      "max-params": ["error", 5],
    },
  },

  // A component's body is mostly its JSX tree, which max-lines-per-function counts as though it
  // were logic. What makes a component hard to follow is branching, and the complexity rules above
  // still apply to it.
  {
    files: ["web/src/**/*.tsx"],
    rules: { "max-lines-per-function": "off" },
  },

  // Seed, patch and locale modules are literal data - rows to insert, synth presets, the two
  // dictionaries. Counting their lines measures the size of the fixture, not the difficulty of
  // the code.
  {
    files: [
      "server/src/**/seed.ts",
      "web/src/groove/patches.ts",
      "web/src/*/locales/*.ts",
    ],
    rules: { "max-lines": "off", "max-lines-per-function": "off" },
  },

  // Building a Web Audio graph is long and linear: a voice's parameters are its signal inputs, and
  // the branches are "does this patch use vibrato". EXPLORATORY.md records that none of this has
  // automated coverage, so a refactor driven by these metrics could only be checked by ear -
  // which is a worse trade than the metric is worth. Math.random shapes noise buffers and sample
  // offsets here; nothing in Groove is security-sensitive.
  {
    files: ["web/src/groove/audio/**"],
    rules: {
      complexity: "off",
      "max-params": "off",
      "sonarjs/cognitive-complexity": "off",
      "sonarjs/pseudo-random": "off",
    },
  },

  // Config files and plain scripts sit outside any tsconfig, so type-aware rules cannot run.
  {
    files: ["**/*.{js,mjs,cjs}"],
    extends: [tseslint.configs.disableTypeChecked],
    languageOptions: { globals: globals.node },
    rules: { "@typescript-eslint/no-require-imports": "off" },
  },

  {
    files: ["web/src/**/*.{ts,tsx}"],
    extends: [
      reactHooks.configs.flat["recommended-latest"],
      jsxA11y.flatConfigs.recommended,
    ],
    languageOptions: { globals: globals.browser },
  },

  // The four apps stay separate. A denylist of the siblings rather than an allowlist of what is
  // permitted, so the shared module needs no rule change. This guards the module graph only: the
  // collision PROJECT.md warns about is the four global stylesheets, which no lint rule sees.
  ...["crm", "space", "rolodex", "groove"].map((app) => ({
    files: [`web/src/${app}/**`],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: ["crm", "space", "rolodex", "groove"]
            .filter((other) => other !== app)
            .flatMap((other) => [`**/${other}/**`, `../${other}/*`]),
        },
      ],
    },
  })),

  {
    files: ["web/src/**/*.tsx"],
    extends: [reactRefresh.configs.vite],
  },

  {
    files: [
      "server/**/*.ts",
      "e2e/**/*.ts",
      "playwright.config.ts",
      "scripts/**",
    ],
    languageOptions: { globals: globals.node },
  },

  {
    files: ["e2e/**/*.ts"],
    extends: [playwright.configs["flat/recommended"]],
    rules: {
      // `await expect.poll(...)` is how this suite asserts on anything eventually consistent, and
      // the rule does not recognise it, so it reports those tests as having no assertion at all.
      "sonarjs/assertions-in-tests": "off",

      // The harness spawns this repo's own toolchain on a developer machine. The rule is aimed at
      // services where PATH is attacker-influenced, which a local Playwright run is not.
      "sonarjs/no-os-command-from-path": "off",
    },
  },

  // Same reasoning: these run git and the local toolchain on a developer machine.
  {
    files: ["scripts/**"],
    rules: { "sonarjs/no-os-command-from-path": "off" },
  },

  {
    files: ["server/test/**/*.ts", "web/src/**/*.test.{ts,tsx}"],
    extends: [vitest.configs.recommended],
    rules: {
      // A test body is one long arrow function by nature; splitting it hides the arrangement.
      "max-lines-per-function": "off",
      "max-lines": "off",
    },
  },

  prettier,
);
