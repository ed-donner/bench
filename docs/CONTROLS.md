# Controls - lint, static analysis and enforcement

The checks that mechanise [STANDARDS.md](./STANDARDS.md), and how each one is enforced. Everything
here is in place and running. The decisions are settled: changing one is a project-level call.

## The layers

| Layer               | Runs                               | Bypassable                      |
| ------------------- | ---------------------------------- | ------------------------------- |
| `npm run check`     | By hand, when finishing a change   | Yes - by not running it         |
| `prebuild`          | Before every `npm run build`       | Yes - by calling `vite` direct  |
| lefthook pre-commit | On `git commit`                    | Yes - `git commit --no-verify`  |
| Claude Code Stop    | When the agent tries to end a turn | Yes - one turn, then it relents |
| GitHub Actions      | On push and pull request           | **No**                          |

Only the last one is a gate. The rest are backstops for the times the process slips, and
[PROCESS.md](./PROCESS.md) requires whoever did the work - agent or human - to run `npm run check`
before committing. A hook firing means that already failed.

## npm scripts

The base layer every other layer calls.

```
npm run lint          eslint across the repo
npm run lint:fix      the same, applying fixes
npm run format        prettier --write
npm run format:check  prettier --check, for CI
npm run knip          unused files, exports, dependencies
npm run gitleaks      leaked credentials
npm run check:secrets PII and files that must never be tracked
npm run jscpd         cross-file duplication
npm run check         typecheck + lint + format:check + gitleaks + check:secrets + knip
                      + test with coverage
```

Unit tests run **with coverage** inside `check`, so the 80% threshold is a gate rather than a
report.

`jscpd` stays outside it: duplication findings are advisory rather than pass/fail, so they should
not gate a green run. It reports 2.2% across the tree.

`knip` needs `knip.json` to be told the multi-page entry points, or it reports every web source file
as unused.

## ESLint

One flat config at the repo root covering `web`, `server` and `e2e`. A single config rather than one
per workspace: type-aware linting reaches both tsconfigs through typescript-eslint's
`projectService`, and one config means one process and one cache. Rules are **strict** -
`strictTypeChecked` plus `stylisticTypeChecked`.

| Package                       | Job                                                                                      |
| ----------------------------- | ---------------------------------------------------------------------------------------- |
| `eslint`                      | The runner, flat config                                                                  |
| `typescript-eslint`           | Type-aware TS rules. The strict core                                                     |
| `eslint-plugin-sonarjs`       | Code smells: cognitive complexity, duplicated blocks, identical functions, dead stores   |
| `eslint-plugin-react-hooks`   | Rules of hooks, exhaustive-deps                                                          |
| `eslint-plugin-react-refresh` | Export shapes that break Vite HMR                                                        |
| `eslint-plugin-jsx-a11y`      | Accessibility - the e2e suite selects by role and label, so a11y regressions break tests |
| `@vitest/eslint-plugin`       | No focused or skipped tests left behind                                                  |
| `eslint-plugin-playwright`    | No conditional expects, no `waitForTimeout`                                              |
| `eslint-config-prettier`      | Last in the config, switching off the rules that would fight Prettier                    |

Two things need no package, only configuration:

- The built-in size rules, which enforce "short functions, short modules": `max-lines` 500,
  `max-lines-per-function` 200, `complexity` 15, `max-depth` 4, `max-params` 5. Seed, patch and
  locale modules are literal data and exempt from the line counts, and `max-lines-per-function` is off for
  `.tsx`, whose bodies are mostly a JSX tree the rule counts as logic. `complexity` and
  `cognitive-complexity` measure whether a function is actually hard to follow, and stay strict
  everywhere outside Groove's audio. The numbers were calibrated against this codebase rather than
  picked round, and they bite.
- **`no-restricted-imports`**, stopping the three apps importing from each other. It is a denylist of
  the sibling apps rather than an allowlist of permitted paths, so a future `web/src/shared/` is
  allowed by default. Note what it does **not** cover: the collision
  [PROJECT.md](./PROJECT.md) warns about is the three global stylesheets, and a lint rule cannot see
  CSS. Separate HTML entry points are what keeps those apart. This rule guards the module graph only.

### Rules deliberately off

Each was measured before it was switched off, and each sits in `eslint.config.js` with the same
reason next to it.

| Rule                                                                                              | Why not                                                                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sonarjs/prefer-read-only-props`                                                                  | `Readonly<Props>` on 61 component signatures, for a mutation this codebase never makes and which `Readonly` is too shallow to prevent                                                                                      |
| `@typescript-eslint/no-non-null-assertion`                                                        | Contradicts `non-nullable-type-assertion-style`, also on, which asks for `x!` over `x as T`. Every site is one TypeScript's narrowing cannot follow                                                                        |
| `@typescript-eslint/no-unnecessary-type-parameters`                                               | Flags `useFetch<Deal[]>(url)`, which is the JSON boundary. Moving the cast to each call site would not make it any more checked                                                                                            |
| `sonarjs/function-return-type`                                                                    | A sort key is a number for a numeric column and a string otherwise; collapsing it would sort 10 before 9                                                                                                                   |
| `prefer-nullish-coalescing` (strings only)                                                        | `job_title \|\| "—"` is deliberate - `??` would render the empty string                                                                                                                                                    |
| `restrict-template-expressions` (numbers only)                                                    | Interpolating a number is unambiguous; `string \| undefined` printing "undefined" still errors                                                                                                                             |
| `no-confusing-void-expression` (arrow shorthand)                                                  | The braced form it wants at ~190 React handlers reads worse                                                                                                                                                                |
| In `e2e/` and `scripts/`: `sonarjs/assertions-in-tests`, `no-os-command-from-path`                | Plugin limits, not findings: it does not recognise `await expect.poll(...)`, and its PATH rule is aimed at services, not a local run of this repo's own toolchain                                                          |
| In `web/src/groove/audio/**`: `complexity`, `max-params`, `cognitive-complexity`, `pseudo-random` | Building a Web Audio graph is long and linear, a voice's parameters are its signal inputs, and EXPLORATORY.md records that none of it has automated coverage - a refactor to satisfy a metric could only be checked by ear |

### The two inline suppressions

`react-hooks/incompatible-library` is the only rule suppressed at a call site rather than in the
config. It warns that React Compiler will skip memoizing a component that calls
`useReactTable()`, because TanStack Table returns functions that cannot be memoized safely. Both
of Bench's tables hit it - `web/src/crm/components/DataTable.tsx` and
`web/src/rolodex/pages/People.tsx` - and neither can do anything about it: it is the library's only
API, the check is keyed on the module name so no version of TanStack Table changes it, and Bench
does not run React Compiler at all.

Two `eslint-disable-next-line` comments rather than turning the rule off, for two reasons. The rule
covers React Hook Form's `watch()` and TanStack Virtual's `useVirtualizer()` too, and should still
report those. And `reportUnusedDisableDirectives` is `error`, so if the incompatibility is ever
fixed, lint fails on the now-pointless directive and tells us to delete it. A rule switched off in
the config would just sit there.

Neither `"use no memo"` nor `"use no forget"` silences it - the compiler logs the diagnostic before
it reads the directive, so the warning is reported either way. That was measured, not assumed.

**`eslint-plugin-unicorn` is not installed.** Three of its rules fight this codebase directly.
`prevent-abbreviations` would rename `db` (185 uses), `(req, res)` (39 Express handlers), `(e) =>`
(73 handlers) and `Props` (32 files). `no-null` hits 301 `null`s, which is not a style habit: SQLite
stores NULL, the columns are nullable, and `better-sqlite3` binds `null` and rejects `undefined`.
`filename-case` defaults to kebab-case against PascalCase components. What remains once those are
off overlaps heavily with `strictTypeChecked` and SonarJS.

## TypeScript 6.0.3, pinned exactly

**The whole repo runs one TypeScript: 6.0.3, pinned exactly in all three `package.json` files.**

TypeScript 7 is the native Go compiler and ships `tsc.js` and nothing else - the JS compiler API that
type-aware linting is built on is gone, and typescript-eslint refuses to install alongside 7 at all.
6.0.3 is the last release carrying that API (`lib/typescript.js`, `createProgram`,
`createLanguageService`), so one compiler serves both `tsc --noEmit` and the linter.

The pin is exact rather than `^6.0.3` because 6.1.0 falls outside typescript-eslint's `<6.1.0` peer
range. That upper bound is a hard constraint, not a preference, so **upgrading past 6.0.3 is a
deliberate, coordinated change** - check the peer range first.

The cost is build speed: 3.34s across both workspaces against 0.48s under 7.0.2, roughly seven times
slower and three seconds. **Revisit when typescript-eslint supports the native compiler**, expected
in TypeScript 7.1 ([typescript-eslint#12518][ts-eslint-7]). At that point this whole arrangement
collapses into "use 7".

[ts-eslint-7]: https://github.com/typescript-eslint/typescript-eslint/issues/12518

### npm drops platform binaries when you add a dependency

Adding any dependency rewrites the lockfile and can drop optional platform packages already on disk
([npm/cli#4828]). It is not silent - npm prints "removed N packages" - but it does not say what it
removed or that it mattered, and the failure surfaces later as vitest refusing to start with "Cannot
find native binding".

The remedy needs **all three `node_modules`, and the lockfile**. Removing the root one alone leaves
`web/node_modules` and `server/node_modules` in place, and a package nested there shadows the
hoisted copy for anything running inside that workspace:

```bash
rm -rf node_modules web/node_modules server/node_modules package-lock.json && npm install
```

[npm/cli#4828]: https://github.com/npm/cli/issues/4828

## Prettier

**Prettier's defaults, with no configuration**: semicolons, double quotes, print width 80. An empty
config file is deliberate - Prettier's value is ending the argument, and every option added reopens
it. `eslint-config-prettier` goes last in the flat config so Prettier owns formatting outright.

The whole tree was reformatted in one commit that did nothing else, and `.git-blame-ignore-revs`
names it so `git blame` skips past. GitHub honours that file automatically.

Formatting is applied in four places, and the split between which ones **write** and which ones
**check** matters:

| Where                                    | Covers                          | Action               |
| ---------------------------------------- | ------------------------------- | -------------------- |
| Editor on save                           | Ed, in VS Code                  | write                |
| `npm run format`, in the finishing steps | The agent's edits               | write                |
| lefthook pre-commit                      | Anything that slipped past both | write, then re-stage |
| `npm run check`, `prebuild`, CI          | The gate                        | **check only**       |

- **On save** is `.vscode/settings.json` with `editor.formatOnSave`, plus `.vscode/extensions.json`
  recommending Prettier and ESLint. Both are committed. `.gitignore` lists `.vscode/*` rather than
  `.vscode/` to allow it: **git will not re-include a file whose parent directory is excluded**, so
  the `!` negations under a `.vscode/` rule would be dead letters. `git check-ignore -v` is how you
  find that out.
- **On save does nothing for the agent** - it writes files through tools, not an editor. A
  `PostToolUse` hook was considered as the equivalent and rejected: reformatting a file immediately
  after an edit invalidates the text the agent is about to match for its next edit. Instead
  [PROCESS.md](./PROCESS.md) puts `npm run format` in the finishing steps, before `npm run check`.
  Without it, `format:check` inside `check` fails on every unformatted agent edit.
- **Never `prettier --write` in `prebuild` or CI.** A build that rewrites its own source is not
  reproducible, and in CI it would pass while leaving the repository unformatted.

## Language, in the suites

**The unit suite runs in English, pinned.** `web/src/test/setup-i18n.ts` initialises i18next with
every app's bundle before any test renders - without it each label comes out as its key - and sets
`bench.lang` to `en`, so the suites stay independent of the machine's language. `playwright.config.ts`
pins `locale: "en-US"` for the same reason: the first visit follows the browser, and a machine set
to Spanish would otherwise flip every English selector in the e2e suite at once.

`web/src/test/locales.test.ts` is what keeps the two dictionaries honest - same keys, nothing empty,
the same interpolation names on both sides. A missed string is invisible to the typechecker and
shows up in the UI as a raw key, so this is the test that catches it. `initI18n` also installs a
`missingKeyHandler` that **throws under vitest**, which catches the other direction: a key used but
never defined.

## Coverage

vitest's built-in `coverage.thresholds`, **80% statements**, configured per workspace and measured
across every app: `server/vitest.config.ts` includes `src/**` and excludes `src/index.ts`;
`web/vite.config.ts` includes `src/**` and excludes `main.tsx`, the test files and Groove's audio.

Where it stands, from `npm run coverage`:

| Scope                       | Statements |
| --------------------------- | ---------- |
| `server/src`                | 87%        |
| `web/src/crm`               | 100%       |
| `web/src/crm/components`    | 95%        |
| `web/src/crm/pages`         | 96%        |
| `web/src/space`             | 92%        |
| `web/src/rolodex`           | 82%        |
| `web/src/rolodex/pages`     | 80%        |
| `web/src/groove`            | 88%        |
| `web/src/groove/components` | 97%        |
| `web/src/home`              | 100%       |
| **web overall**             | **86%**    |

**Do not lower the bar to make a red run green.**

**Thresholds stay on `statements` only.** Branches are at 81% on web but 72% on the server, so a
branches threshold at 80 would fail there. Revisit by raising the server's branch coverage first.

**Seed files are covered by asserting on the seeded database, not by exclusion.**
`server/test/rolodex/seed.test.ts` runs `seedIfEmpty` and checks the shape of what comes out -
every circle populated, an overdue person and an in-touch one, dates inside the next month, no
interaction in the future. It is 1,000 lines of literal data, so the alternative was excluding it
from the measure; the test is worth more, because the seed is the first thing anyone sees.
`server/src/crm/seed.ts` has no such test and is the largest uncovered file left.

### What is not covered, and why

**`web/src/groove/audio/**` is excluded outright** - 1,053 lines across four files. jsdom has no
`AudioContext`, so they cannot be unit tested without a mock that would assert nothing about how
anything sounds. [EXPLORATORY.md](../e2e/EXPLORATORY.md) records that gap, and a coverage threshold
must not be allowed to imply otherwise. Groove's pure modules (`music.ts`, `params.ts`,
`patches.ts`, `filter.ts`) stay in, and are ordinary logic to test.

The largest remaining hole is Space's `BoardView` at 31%.

Seven jsdom and library gaps shape how the suites are written. None is a fault in the code, and every
one of them will bite again:

- **jsdom implements no pointer capture.** Every knob, fader and grid calls `setPointerCapture` on
  pointerdown, so all of them throw without the stub in `web/src/space/test/setup.ts` - which despite
  its path is the setup file for the whole workspace.
- **jsdom lays nothing out**, so `getBoundingClientRect` returns zeros and any component that maps a
  coordinate to an index divides by zero. `VelocityLane.test.tsx` stubs the rect.
- **recharts renders nothing without a measured size.** `ResponsiveContainer` reads its parent's box,
  which is zero in jsdom. `DashboardCharts.test.tsx` mocks the container to hand the chart a fixed
  640x240, which is what recharts itself does once it has measured one.
- **recharts also leaves a text-measurement span on `document.body`**, holding the last label it
  sized. It survives Testing Library's cleanup, so `screen.getByText` finds a phantom second match
  for whatever the chart last measured. Query the container `render` returns, not `screen`.
- **`@hello-pangea/dnd` cannot drag in jsdom** - it measures the boxes it moves. `Pipeline.test.tsx`
  stubs the library and calls the `onDragEnd` the page hands it, which covers the optimistic
  re-stage. The real drag is an e2e test. dnd-kit is the same: Space's board and Rolodex's circles
  are dragged in `e2e/`, and their unit tests cover what the drag hands back.
- **jsdom has no `Blob.text()`**, which is how Rolodex's import modal reads a chosen file - the
  upload succeeds and the read throws. The setup file polyfills it through `FileReader`, which
  jsdom does implement.
- **`exact: true` is a Playwright option, not a Testing Library one.** Testing Library's `name`
  already matches the full string; passing `exact` there is a type error. The substring-matching
  warning in [PROCESS.md](./PROCESS.md) applies to the e2e suite only.

## Enforcement

### prebuild

`prebuild` runs lint, and npm fires it before `npm run build` automatically, so it cannot be
forgotten. One gap: `pre*` scripts only fire for `npm run <script>`, so calling `vite build` directly
walks past it.

`e2e/global-setup.ts` shells out to `npm run build`, which means **`npm run e2e` lints first and
pays the cost** - roughly doubling its wall time, 22s to 44s. That is a considered trade. Rerouting
global-setup to `npm run build -w web` would skip the root `prebuild` and buy the time back; do not
do it without asking.

### lefthook, on pre-commit

Configured in `lefthook.yml`, installed through a `prepare` script so `npm install` wires it up.
Two jobs in order:

1. **format** - `prettier --write` over the staged files, with `stage_fixed: true` so what it
   rewrites is re-staged rather than left as an unstaged surprise.
2. **lint** - `npm run lint` over the whole tree. Not the staged files: the rules are type-aware, so
   a staged subset can pass while the change has broken a file that was not staged.

The second job costs **about 30 seconds, on every commit**. Adding `--cache` would cut it, at the
price of `npm run lint` meaning something slightly different here than in CI.

### Claude Code Stop hook

`.claude/settings.json` registers a `Stop` hook running `scripts/stop-lint.mjs`, which holds a turn
open while `npm run lint` fails. This is the only lever that binds the coding agent rather than
asking it to remember; `settings.json` is committed, unlike `settings.local.json`. It blocks by
exiting 2 with ESLint's own output on stderr, which is what reaches the agent - a bare "lint failed"
gives it nothing to act on. It runs `lint` only, not the full `check`, so a slow suite does not run
on every turn end.

**The loop hazard is the thing to understand before changing it.** A hook that blocks on failure can
cycle forever: the agent stops, the hook blocks, it cannot fix the problem, it stops again. The
script caps that with its own marker in the temp directory keyed by `session_id` - the first failing
stop is blocked, the next clears the marker and lets the stop through with a `systemMessage`, and a
passing lint clears it. So the cost is one extra turn either way.

It works that way because **`stop_hook_active`, the documented field this was meant to use, is no
longer in the Claude Code hooks documentation**. The documented `Stop` input is `session_id`,
`prompt_id`, `transcript_path`, `cwd`, `permission_mode`, `hook_event_name`,
`last_assistant_message` and `effort`. This layer sits on someone else's schema: check the fields
against the current docs before relying on one, and prefer a mechanism that holds if the field is
not there.

### CI - the gate

`.github/workflows/ci.yml`, on push and pull request, running **`npm run check` and `npm run e2e`** -
naming the aggregates rather than restating their parts, so CI cannot drift out of step with what
package.json defines. Node 24, npm cached, Chromium installed for Playwright, and `test-results/`
uploaded on failure so a red run can be read without reproducing it. A full run takes about three
minutes.

It triggers on both push and pull request, so a PR from a same-repo branch runs the suite twice per
commit. That is accepted.

**A second job, `check-node-22`, repeats the same steps on Node 22.** The README promises the repo
works on Node 22.22 or newer - the floor set by react-router 8 - and this job is what tests that
promise. It is a separate job, not a matrix on `check`, because branch protection requires the
status named `check` and a matrix would rename it (see below); only `check` is in the required set.
The root package.json declares the same range in `engines` (`^22.22.0 || >=24.0.0`, Node 23 being
excluded by vitest), and `.npmrc` sets `engine-strict=true` so an unsupported Node fails `npm ci`
with an error naming the required range, rather than a warning scrolled past and a confusing
failure at runtime.

**It installs the gitleaks release rather than using `gitleaks/gitleaks-action`.** `npm run check`
shells out to the `gitleaks` binary and fails when it is missing, on purpose; the action runs its own
scan inside a container and does not leave the binary on `PATH`, so `check` would still fail. The
version is pinned in the workflow - bump it in step with whatever `brew install gitleaks` puts on
your machine.

### Branch protection

A ruleset named `main` on `ed-donner/bench`, enforcement **active**, targeting the default branch,
with an **empty bypass list** so it binds the repository owner too:

- Restrict deletions, block force pushes
- Require a pull request before merging, 0 required approvals
- Require the `check` status check, with branches required to be up to date

**The required check is matched by name.** It is `check`, which is the job name in `ci.yml`. Rename
that job and the requirement silently stops matching - pull requests then wait forever for a status
that never reports, which looks like a hang rather than a misconfiguration.

This is the only layer that cannot be bypassed. "Nothing lands unless it passes" means nothing is
_merged_ - not that nothing is _committed_, which no client-side hook can guarantee.

## Secrets and PII

**Three tools, with a clean division of labour.** `gitleaks` handles credentials, which is a solved
problem with a maintained ruleset and no reason to hand-roll. A small script in this repo handles
the two things no general scanner can know about: what counts as PII here, and which files must
never be tracked. GitHub secret scanning with push protection is on, and is the only one of the
three that is server-side and can stop a secret before it leaves the machine.

### gitleaks

Run as `npm run gitleaks`, inside `npm run check`. Custom rules and allowlists go in
`.gitleaks.toml`.

It is a Go binary, not an npm package, so it does not arrive with `npm ci` - `brew install gitleaks`
on macOS, `winget install -e --id Gitleaks.Gitleaks` on Windows, and the pinned release in CI.
**If the binary is missing the check fails with an actionable message rather than skipping.** A
control that silently passes when its tool is absent is worse than no control.

The invocation lives in `scripts/run-gitleaks.mjs` rather than as a shell one-liner in
`package.json`, because **npm runs scripts through `cmd.exe` on Windows**. The previous
`command -v gitleaks >/dev/null || { ...; }` guard is POSIX shell, so on Windows `npm run check`
failed at this step even with gitleaks installed. Anything in `scripts` that has to run on both
platforms belongs in a `.mjs` file for the same reason; `e2e/fixtures.ts` spawns `npx.cmd` rather
than `npx` on Windows on the same principle, since `child_process` cannot execute a `.cmd` by its
bare name.

A full history scan was run once when this was built; it was clean across all 27 commits.

### The bespoke script

`scripts/check-secrets.mjs`, run as `npm run check:secrets`, zero dependencies. Scans tracked files
only, via `git ls-files`. With gitleaks covering credentials it stays small, and exists for the
repo-specific rules:

**Structural.** Fail if `.env` is tracked, or if anything under `data/` is. Both are gitignored;
this makes it durable rather than dependent on `.gitignore` staying correct.

**PII.** Flag email shapes and phone shapes, with three carve-outs:

- **The seed files are excluded** - `server/src/crm/seed.ts`, `server/src/space/seed.ts` and
  `server/src/rolodex/seed.ts`. They exist to hold synthetic data, and that is the standing
  assumption: nothing real goes in them. If that ever stops holding, this exclusion is why a leak
  would go unnoticed. Rolodex's seed is a list of invented people with addresses to match, and it
  earned the exclusion the hard way: the check found 24 of them the moment the file was staged.
  The three that sat at **live** domains were changed rather than excused - an invented person at
  a real mailbox is the one case where synthetic data reaches someone.
- **Phone numbers in the `555-01xx` range pass.** That is the NANP block reserved for fiction and it
  cannot dial a real person.
- **Addresses on a reserved domain pass** - `example.com`, `.net`, `.org`, and the `.test`,
  `.invalid` and `.localhost` TLDs. RFC 2606 and RFC 6761 reserve those for exactly this.

**No generic entropy check.** It is the classic false-positive engine - hashes, minified output,
base64 data URIs - and with gitleaks handling real credential patterns it would add noise and
nothing else.

**One escape hatch**: an inline `// allow-secret: <reason>` on the offending line. The reason is
required; a bare marker is not accepted. There is no baseline file - in a repo this size an
unexplained standing exception is worse than a red run.

**What none of this can do:** once a secret has been pushed to a public repository it must be
**rotated, not deleted**. Removing it from the tree, or even from history, does not unpublish it.

## Branching

Ed creates a branch before work starts. The agent commits to it and **never pushes**; Ed pushes and
opens the pull request, CI runs there, and the required check gates the merge into `main`.

There is no conflict between committing and branch protection: protection governs `main` only, a
feature branch is unprotected, and the agent never pushes anything anywhere.

**If a session begins on `main`, branch before committing** rather than committing onto `main`, and
say so in the reply.

Because the agent never pushes, CI does not see the work until Ed pushes the branch. That is what
makes running `npm run check` locally a requirement rather than a courtesy.

## Related documents

- [PROCESS.md](./PROCESS.md) - implementing a change and testing it.
- [STANDARDS.md](./STANDARDS.md) - the coding standards these rules mechanise.
- [PROJECT.md](./PROJECT.md) - layout and architectural decisions.
