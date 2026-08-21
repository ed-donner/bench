# Process - how to implement a change

Work in small increments and validate each one before moving on. A change is finished when the
checks and the e2e suite all pass, you have seen the feature working in a real browser, and it is
committed.

**`npm run check` passes end to end** - typecheck, lint, formatting, secrets, dead code and the 80%
coverage threshold in both workspaces. There are no known failures to read past, so anything it
reports is yours.

**Three things run on their own**, all of them backstops rather than the mechanism: `prebuild` lints
before any build, lefthook formats and lints on pre-commit, and a Claude Code Stop hook holds a turn
open while lint fails. None of that lets you skip `npm run check` - a hook firing means the process
already failed.

**The gate is CI.** It runs `check` and `e2e` on every push and pull request, and `main` is
protected: no merge without it passing. That gate only sees the work once Ed pushes the branch,
which is what makes running the checks locally a requirement rather than a courtesy. See
[CONTROLS.md](./CONTROLS.md).

## 1. Understand before changing

- Read the app's docs first: [crm/](./crm/), [space/](./space/), [rolodex/](./rolodex/),
  [groove/](./groove/). Each holds an IMPLEMENTATION.md with the domain rules and the traps, and a
  REQUIREMENTS.md with the original brief.
- For a bug, **prove the root cause before fixing it.** Reproduce it, measure it, show the evidence.
  Do not apply a workaround to a symptom you have not explained. If a fix depends on a guess, the
  guess is the thing to test first.
- Check whether the behaviour is already covered by a test. If it is, the test is your reproduction.

## 2. If you are provided a SPEC.md, develop a PLAN.md from it

If you are provided with a SPEC.md document for a change, then first write a PLAN.md document for that change,
asking questions to the user as appropriate. The PLAN.md should divide the implementation into phases with
success criteria for each phase, and overall success criteria. Do not proceed to build until the user has
confirmed the PLAN.md. The PLAN.md belongs in the same directory as the SPEC.md

## 3. Build it in increments

Work from the data outwards, because each layer can be validated on its own:

1. **Schema and data layer** (`server/src/<app>/db.ts`). Existing databases are migrated in place -
   see the migration in `server/src/crm/db.ts` for the pattern: check `PRAGMA table_info`, add the
   column, backfill.
2. **API routes** (`server/src/<app>/routes*.ts`), under `/api/crm` or `/api/space`.
3. **Types and helpers** (`web/src/<app>/types.ts`). Derived values belong in one place that both
   the tables and the charts read from.
4. **UI**.

Typecheck as you go: `npm run typecheck`. It is fast and catches most breakage.

## 4. Test

Three layers, each with a different job. Add to whichever ones the change touches.

### Unit tests - `npm test`

vitest, server and web. Server suites live in `server/test/{crm,space,rolodex}/`; web suites sit
beside the code they cover. Coverage is measured across every app at 80% statements and currently
sits at 87% on the server and 86% on web, with `web/src/groove/audio/**` excluded because jsdom has
no `AudioContext`.

Use these for logic with edges: calculations, filtering, sorting, migrations, data transforms. A
new derived value or a new column default should get one.

jsdom implements no layout, no pointer capture, no canvas, no audio and no `Blob.text()`, so any
component that measures itself or reads a file needs a stub before it will render at all.
[CONTROLS.md](./CONTROLS.md) lists the seven that have bitten so far and what each suite does
about them - read it before concluding that a component is untestable.

### End-to-end tests - `npm run e2e`

Playwright, in `e2e/`. Layout: `smoke.spec.ts` (the seams between the apps), then `crm/`, `space/`,
`groove/`. `e2e/tools/screenshots.mjs` is not part of the suite - it drives a running app and
captures every screen in both themes, for reviewing a visual change in one pass.

Rules that keep this suite reliable:

- **Import `test` and `expect` from `../fixtures`**, never from `@playwright/test` directly, or the
  spec gets no server and no `baseURL`.
- **Each worker runs its own server and database.** `e2e/fixtures.ts` spawns the API on
  `8150 + workerIndex` with its own `DATA_DIR` under `e2e/.tmp/w<n>`; `e2e/global-setup.ts` builds
  `web/dist` once. There is no `webServer` block in `playwright.config.ts` - do not add one back.
- **Tests within a worker share a database, and retries re-run against it.** Set up your own state
  at the start of a test rather than depending on the seed or on another test's leftovers. See
  `dealInStage` in `e2e/crm/revenue.spec.ts`.
- **Wait for data before asserting on it.** Figures render as `$0` until the fetch resolves; assert
  on a card being visible, or poll, before capturing a "before" value.
- **Run at 1440x900** (already set). At Playwright's 1280 default a board card sits partly outside
  the viewport and dnd-kit drags never activate.
- **Drag with the keyboard where the library supports it.** CRM's pipeline uses
  `@hello-pangea/dnd`: Space to lift, arrows to move, Space to drop - deterministic, no coordinates.
  Space's board and Rolodex's circles use dnd-kit; the board now has a keyboard sensor, but its
  specs stay mouse-driven because a column drag starts from a grip that only appears on hover.
  A dnd-kit drag needs the pointer to move past its 6px activation distance in several steps before
  it starts, so `mouse.move(..., { steps })` is not optional.
- `getByRole` name matching is substring-based: `{ name: "BASS step 1" }` also matches steps 10-16.
  Pass `exact: true` for numbered labels. **This is a Playwright rule only** - Testing Library's
  `name` already matches the whole string, and `exact` is not one of its options there.
- **Never poll a periodic value for a one-off reading.** `expect.poll` settles at a 1s interval
  once it has worked through its defaults of 100, 250, 500, 1000ms. Groove's playhead is periodic -
  134ms a step, 2.14s a bar - so each poll advances 7.47 steps and two polls fall a step short of
  the bar, which walks the samples backwards through it in a comb: 12, 11, 10, 9. "Wait for the
  playhead to pass step 12" could therefore miss steps 13 to 15 for a whole 10s window, and this
  spec failed roughly 1 run in 60 because of it. Heavy CPU load moved the phase, which made it look
  like an audio-clock problem for a while; it was not - the headless audio clock measures within
  0.1% of real time and rAF runs at 119fps. **Accumulate instead**: `recordSteps` in
  `e2e/groove/instrument.spec.ts` collects every step the LED strip lights via a MutationObserver
  in the page, and the spec polls that set until most of the bar has been seen. A value that only
  ever grows cannot be aliased by the poll interval. The threshold is 12 of 16 rather than all 16
  because the engine's draw loop reports one step per frame, so a machine slower than 7.5fps
  renders a bar with gaps: measured with CDP CPU throttling, 12 holds to a 50x slowdown, where all
  16 would start failing at 50x and 13 of 16 at 30x. Throttle the renderer through CDP to check
  that kind of thing - do not put load on the machine.

Run one file while iterating: `npx playwright test e2e/crm/revenue.spec.ts --retries=0`.

**A new API route can 404 against a stale dev server.** `tsx watch` does not always pick up a new
route, and an old process can still hold the port. If a route you just added 404s, restart before
you debug the routing: `pkill -f concurrently; pkill -f vite; pkill -f tsx` then `npm run dev`.

### Browser testing with Agent Browser

Automated tests confirm what you already thought to assert. Driving the real app finds what you did
not. Do this **before** writing specs for new UI, so the specs encode what actually matters, and
again afterwards to confirm the feature feels right.

Invoke the `agent-browser` skill, then:

```bash
agent-browser --session bench open http://localhost:8101/crm/
agent-browser --session bench snapshot -i          # interactive elements with @eN refs
agent-browser --session bench click @e12
agent-browser --session bench screenshot /tmp/x.png
agent-browser --session bench errors               # console and page errors
agent-browser --session bench close
```

Traps worth knowing:

- `fill @ref ""` does **not** clear a field. Reload the page instead.
- Refs go stale after navigation - re-snapshot before clicking.
- `snapshot -i` lists only interactive elements; a container with a role may not appear, which is
  not evidence that it is missing. Confirm against the source before reporting it as a defect.
- Driving Groove with a visible browser **plays sound out loud**. Stop the transport when done.

Record anything that automation cannot assert in [e2e/EXPLORATORY.md](../e2e/EXPLORATORY.md).

### Verifying visually

Screenshot the whole area you changed, not just the element - alignment work in particular disturbs
neighbours. When checking spacing or alignment, measure rather than eyeball:
`getBoundingClientRect()` through `page.evaluate` gives numbers you can compare against the
elements around it, above and below included.

## 5. Maintaining the test suite

- **A bug fix gets a test that fails without it.** That is what stops it coming back.
- **Fix flakiness at the root.** Every failure so far has been shared state, an unmet wait, or a
  viewport too small - not chance. Prove the cause before adding a retry or a timeout.
- **Prefer accessible selectors** - roles, labels, names - over CSS classes, then keep the markup
  accessible enough to support them. Reach for `data-testid` only for figures with no natural name,
  as the pipeline and dashboard totals do.
- **Delete tests that no longer describe intended behaviour.** A test kept alive by workarounds is
  worse than no test.
- **Do not state test counts in the docs.** They are stale by the next commit. `npx playwright
test --list` answers it on demand.
- When you deliberately leave something uncovered, say so in `e2e/EXPLORATORY.md` rather than
  letting a green suite imply coverage it does not have. Groove's audio is the standing example.

## 6. Finishing

1. `npm run format` - formatting is not applied to agent edits automatically, and `check` fails on
   unformatted files.
2. `npm run check` - typecheck, lint, formatting, secrets, dead code, and unit tests with coverage.
3. `npm run e2e`
4. Look at it in a browser.
5. Update the docs the change invalidates - the app doc for behaviour, `PROJECT.md` for structure,
   `EXPLORATORY.md` for coverage gaps.
6. **Commit**, with everything above green - see [STANDARDS.md](./STANDARDS.md). Then report what
   changed and say honestly which parts are incomplete or unverified.

**Run the checks yourself.** The lefthook pre-commit hook and the Claude Code stop hook both run
lint, but they are backstops for the times something slips - not the mechanism. Do not hand work
over and let a hook discover what `npm run check` would have told you a minute earlier. A hook
firing means the process already failed.

**If vitest will not start**, saying "Cannot find native binding", npm has pruned an optional
platform package - it does that when a dependency is added. Clear all three `node_modules`, not
just the root one, or a stale nested copy shadows the hoisted package inside that workspace:
`rm -rf node_modules web/node_modules server/node_modules package-lock.json && npm install`. See
[CONTROLS.md](./CONTROLS.md).

See [CONTROLS.md](./CONTROLS.md) for what the checks are and how each layer is enforced.

## 7. Self-improvement

Based on feedback and experiences on the build, update this PROCESS.md to incorporate lessons learned,
to ensure that you continuously improve. When you update PROCESS.md, also consider updating this very section on self-improvement
to improve the way that you improve (recursive self-improvement).

## Related documents

- [PROJECT.md](./PROJECT.md) - purpose, layout, architectural decisions
- [STANDARDS.md](./STANDARDS.md) - coding standards
- [CONTROLS.md](./CONTROLS.md) - lint, static analysis, coverage and how each is enforced
