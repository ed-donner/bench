# Bench

Four local-first apps behind one server. No login, no cloud - everything runs on your machine and
your data lives in local SQLite files. Light and dark, one toggle for all four.

|             |            |                                                                                                                     |
| ----------- | ---------- | ------------------------------------------------------------------------------------------------------------------- |
| **CRM**     | `/crm`     | Personal sales CRM: organizations, contacts, deals, a drag-and-drop pipeline, activities and a dashboard.           |
| **Space**   | `/space`   | Personal knowledge manager: pages and blocks, databases with table / board / list views, quick find.                |
| **Rolodex** | `/rolodex` | Personal CRM for the people in your life: who to contact, circles, birthdays, and a timeline of every conversation. |
| **Groove**  | `/groove`  | Browser groovebox: four synth units, one transport, a master DJ filter. All Web Audio, no samples.                  |

This README is the full walkthrough: install it, run the checks, make a change, open a pull
request. Work through it in order.

---

# 1. Installation

## 1.1 Installing Node.js if required

Best is **Node.js 24 or newer**. The Node 22 LTS line also works from **22.22** up, but if you
are installing fresh, install 24. Check what you have:

```bash
node -v
```

If that prints nothing, or a version below 22.22:

**macOS** - with [Homebrew](https://brew.sh):

```bash
brew install node
```

**Windows** - with winget, which ships with Windows 10 (1809+) and 11:

```powershell
winget install -e --id OpenJS.NodeJS.LTS
```

Either way, close and reopen your terminal afterwards so `node` and `npm` are on your PATH, then
confirm with `node -v`. If you would rather not use a package manager, the installers at
[nodejs.org](https://nodejs.org) work fine on both platforms.

## 1.2 Fork the repository

**Fork first - do not clone this repository directly.** You will be opening a pull request at the
end, and that only works from your own copy.

1. Go to **https://github.com/ed-donner/bench**
2. Click **Fork** (top right), then **Create fork**

You now have `https://github.com/<your-username>/bench`.

**If you cannot fork** - no Fork button, or your account is not allowed to - clone this repository
directly instead and carry on from 1.4:

```bash
git clone https://github.com/ed-donner/bench.git
cd bench
```

Everything up to and including the tests works the same; only pushing and opening the pull request
(3.3 onwards) needs a fork.

## 1.3 Clone your fork

Substitute your own username:

```bash
git clone https://github.com/<your-username>/bench.git
cd bench
```

## 1.4 Install the dependencies

```bash
npm ci
```

**Use `npm ci`, not `npm install`.** npm skips optional platform packages often enough that a fresh
`npm install` here can leave the bundler without its native binding, and the build then dies with
"Cannot find native binding" ([npm/cli#4828](https://github.com/npm/cli/issues/4828)). `npm ci`
installs exactly what the lockfile names, which is also what CI runs. Use `npm install <package>`
only when you are deliberately adding a dependency.

`npm ci` prints one deprecation warning, about `prebuild-install`. It is expected and harmless -
the reason it stays is documented in [docs/PROJECT.md](./docs/PROJECT.md).

## 1.5 Run it

```bash
npm start
```

This lints, typechecks, builds the frontend and starts the server - it takes **about 35 seconds
before anything appears**, which is normal, not a hang. Then open:

**http://localhost:8100**

The first run creates and seeds the three SQLite databases under `data/` with sample data. Click
through all four apps and the theme toggle to confirm it works.

Stop the server with `Ctrl+C`.

---

# 2. Local testing

The repository has two test commands. `npm run check` is the fast one you run constantly;
`npm run e2e` drives a real browser.

## 2.1 One-time tool installation

Two tools do not arrive with `npm ci` and have to be installed once.

### gitleaks - the credential scanner

**macOS:**

```bash
brew install gitleaks
```

**Windows:**

```powershell
winget install -e --id Gitleaks.Gitleaks
```

`npm run check` deliberately **fails** rather than skipping if gitleaks is missing - a control that
quietly passes without its tool is worse than no control.

### The Playwright browser

Both platforms, from the repository root:

```bash
npx playwright install chromium
```

This downloads a private copy of Chromium (a few hundred MB). It is only needed for `npm run e2e`.

## 2.2 `npm run check` - the fast gate

```bash
npm run format   # always run this first
npm run check
```

`npm run format` matters because `check` **fails on unformatted files** rather than fixing them - a
build that rewrites its own source is not reproducible. Formatting first turns a guaranteed failure
into a pass.

`npm run check` then runs seven controls in order, stopping at the first failure:

| #   | Control           | What it does                                                                                                                                                   | If it fails                                                                        |
| --- | ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| 1   | **Typecheck**     | `tsc --noEmit` over both workspaces. Strict mode, including unused locals and parameters.                                                                      | A real type error. Fix the code - do not loosen the config.                        |
| 2   | **Lint**          | ESLint over web, server and e2e. Type-aware rules, code smells, React hooks, accessibility, plus size limits: 500 lines a file, 200 a function, complexity 15. | Read the rule name it prints. `npm run lint:fix` handles the mechanical ones.      |
| 3   | **Formatting**    | `prettier --check` over the whole tree.                                                                                                                        | You skipped `npm run format`. Run it.                                              |
| 4   | **Credentials**   | gitleaks scans for API keys, tokens and passwords using a maintained ruleset.                                                                                  | Something secret-shaped is in the tree. Remove it - do not just delete the commit. |
| 5   | **Secrets & PII** | A small local script: fails if `.env` or anything under `data/` is tracked, and flags email and phone shapes.                                                  | Usually a real address or a file that should never be committed.                   |
| 6   | **Dead code**     | knip reports unused files, exports and dependencies.                                                                                                           | You left something behind. Delete it - git remembers.                              |
| 7   | **Unit tests**    | vitest across server and web **with coverage**, and an 80% statement floor in each workspace.                                                                  | A failing test, or coverage below the bar. Do not lower the bar.                   |

A clean run ends with two coverage tables and exits quietly. **There are no known failures to read
past** - anything it reports is yours.

## 2.3 `npm run e2e` - the browser suite

```bash
npm run e2e
```

Playwright drives a real Chromium through all four apps: the launcher, CRM, Space, Rolodex, Groove
and the shared theme toggle. It takes about a minute.

What it does under the hood, which explains the wait and the ports:

- It **builds the frontend once** before the first test, so it exercises the real production bundle.
- **Each parallel worker starts its own API server with its own SQLite databases**, on ports from
  8150 up. Tests never share state with each other or with your `npm start` data.
- It runs at 1440x900, because at a narrower viewport the drag-and-drop boards fall outside the
  window and drags never activate.

If something fails, Playwright writes traces and screenshots to `test-results/`. View one with:

```bash
npx playwright show-trace test-results/<folder>/trace.zip
```

To run a single file while you iterate:

```bash
npx playwright test e2e/crm/revenue.spec.ts --retries=0
```

## 2.4 The other commands

- `npm run dev` - API on :8100 plus Vite with hot reload on :8101. **Use :8101.** Port 8100 serves
  the last build, not your live edits.
- `npm test` - unit tests only, no coverage gate. Quicker than `check` while you iterate.
- `npm run build` - typecheck and bundle the frontend.
- `npm run lint:fix` - apply the lint fixes that can be applied automatically.

---

# 3. Make a change and open a pull request

## 3.1 Branch first

Never work on `main` - your pull request needs a branch of its own.

```bash
git checkout -b my-change
```

Pick a name that says what you are doing, like `internationalize`.

## 3.2 Let your coding agent do the plan

Open the repository in your coding agent - Claude Code, Cursor, or whatever you use - and describe
the change you were given, and ask for a plan with success critiera.

The repository is set up to brief the agent for you. `CLAUDE.md` and `AGENTS.md` at the root pull in
the house rules, so your agent already knows the architecture, the coding standards and the process
it is expected to follow. You should not need to explain any of that.

If you want to build the Internationalization feature, the spec is already there. Just say to the LLM:

> Please make a plan for docs/changes/internationalization/SPEC.md

Your Agent may ask questions, then will plan the work.

If you are satisfied with the plan, then tell it to go ahead and build.

## 3.3 Commit and push to your fork

Your agent will usually commit for you. If not:

```bash
git add -A
git commit -m "Say what changed and why"
```

Then push the branch to **your fork**:

```bash
git push -u origin my-change
```

## 3.4 Open the pull request on github.com

Do this in the browser.

1. Go to your fork: **https://github.com/<your-username>/bench**
2. A yellow banner appears: **"my-change had recent pushes"** with a **Compare & pull request**
   button. Click it. (No banner? Click **Contribute** → **Open pull request**, or use the
   **Pull requests** tab → **New pull request**.)
3. Check the four dropdowns at the top read:
   - **base repository:** `ed-donner/bench`
   - **base:** `main`
   - **head repository:** `<your-username>/bench`
   - **compare:** `my-change`
4. Give it a title and describe what you changed and why.
5. Click **Create pull request**.

## 3.5 What happens next

Your pull request is raised - that part is done, and it needed nothing from anyone else.

**On the pull request itself you will probably see "waiting for approval" rather than a green
tick.** Nothing is wrong. GitHub does not run workflows from a first-time contributor's fork until
a maintainer releases them, and with a room full of people raising pull requests at once they may
never be released. That is fine: the checks that matter are the ones you already ran.

## 3.6 Watching the full CI run yourself

If you want to see the whole suite run on GitHub rather than take your local run's word for it, run
it in **your own fork**, where you need nobody's permission:

1. Go to your fork and click the **Actions** tab.
2. If it offers a button to enable workflows, click it. Forks arrive with workflows switched off.
3. Push your branch again, or use **Run workflow** if the workflow offers it.

The same workflow then runs on your account: `npm run check` and `npm run e2e`, on Linux on
Node 24, about three minutes. That is the identical gate this repository uses to protect `main`,
so a green run there means your change would pass.

If it goes red, fix it and push again - the run repeats on each push.
