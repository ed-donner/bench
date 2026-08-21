# Bench - agent instructions

Four local-first apps (CRM, Space, Rolodex, Groove) behind one Express server. One npm workspace
root with two workspaces: `web/` (one Vite project, an HTML entry point per app) and `server/`.
TypeScript throughout, data in local SQLite files under `data/`, Playwright specs in `e2e/`. All
commands run from the root.

## Golden rules

- **Run `npm run check` before handing work over** - typecheck, lint, formatting, secrets, dead
  code and unit tests with coverage. There are no known failures to read past.
- **`npm run format` before `check`** - formatting is not applied to agent edits automatically,
  and `check` fails on unformatted files.
- **Never push.** The agent commits; the user pushes and opens the pull request, and CI gates the merge.
- **If a session begins on `main`, branch before committing**, and say so in the reply.

## Commands

```
npm start            build and serve everything on :8100
npm run dev          API on :8100 plus Vite hot reload on :8101 (use :8101)
npm run typecheck    fast, run as you go
npm test             unit tests, server and web
npm run e2e          Playwright suite (npx playwright install chromium once, first)
npm run format       prettier --write
npm run check        the full pre-commit bar; needs the gitleaks binary (see README.md)
```

## The working documents

Read the one that fits the task; each is short.

- [docs/PROJECT.md](docs/PROJECT.md) - purpose, layout and architectural decisions, plus the index
  of per-app docs. Each app has an IMPLEMENTATION.md and a REQUIREMENTS.md - read the app's before
  changing its behaviour.
- [docs/PROCESS.md](docs/PROCESS.md) - how to implement a change: increments, the three test
  layers, browser verification, the finishing steps.
- [docs/STANDARDS.md](docs/STANDARDS.md) - coding standards: keep it small, do not over-engineer,
  comments say why.
- [docs/CONTROLS.md](docs/CONTROLS.md) - every check and how it is enforced. Only CI is a gate;
  everything else is a backstop.
