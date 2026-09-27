# Rolodex

A personal CRM at `/rolodex`: the people in your life, when you last spoke, and when you are
overdue a catch-up. Five sections - Today, People, Circles, Calendar, Timeline. Backed by
`data/rolodex.sqlite`.

- Frontend: `web/src/rolodex/` - `pages/`, `components/`, `types.ts`, `api.ts`, `styles.css`
- Backend: `server/src/rolodex/` - `db/`, `routes/`, `seed.ts`, and the pure modules beside them
- Tests: `server/test/rolodex/`, `web/src/rolodex/**/*.test.tsx`, `e2e/rolodex/`

It arrived from its own repo (`projects/rolodex`) and was adapted rather than rewritten: same
schema, same screens, same seed. What changed is listed under [The port](#the-port).

## Data model

Eight tables in `server/src/rolodex/db/schema.ts`: `people`, plus `interactions`,
`important_dates`, `facts`, `news`, `reminders`, `gifts` and `connections`, each hanging off a
person and cascading on delete. There is no migration history: the schema is created if absent.

`people.tags` is a JSON array in a text column, and `checkins_off` is 0 or 1 - SQLite has neither
a list nor a boolean, and `personFromRow` is the one place that converts both back.

## Check-in status is derived, never stored

This is the part of the domain to read before changing anything on Today, People or Circles.

- **Last contacted is the date of the most recent interaction.** It is never typed in and never
  written to the person row; `peopleRepo` reads `MAX(date)` on the way out.
- **A circle sets a cadence**: Inner 30 days, Close 91, Wider 182, Distant 365
  (`CIRCLE_META` in `server/src/rolodex/cadence.ts`, mirrored for labels in
  `web/src/rolodex/types.ts`). A person can override the number of days, or turn check-ins off.
- **Status is computed from the cadence** by `computeStatus`: `off`, `snoozed`, `overdue`,
  `due_soon` (within a week of the due date) or `in_touch`.
- **Never contacted means due from today** - which reads as `due_soon` on the day itself and
  `overdue` from tomorrow. That is why a brand new person is not immediately red.
- Because it is all derived, logging an interaction is the only thing that moves someone out of
  the overdue list, and it does so on the next read with no extra write.

## Annual dates

`importantDates.ts` resolves a stored month/day/year to its next occurrence, on the server for
Today and the calendar, and again in `web/src/rolodex/dates.ts` for a person's own page, which
resolves its dates without a round trip. **The two implementations must agree**; the server is the
authority, and the web copy exists because the page already has the raw dates in hand.

**A 29 February date is celebrated on the 28th in common years** (`effectiveDay`), and a birthday
whose next occurrence is a multiple of ten is flagged as a milestone.

## Importing

`server/src/rolodex/import.ts` reads a CSV (Papa Parse) or a vCard (`vcf`), suggests a column
mapping from a table of header synonyms, and checks each parsed person against those already in
the rolodex - by email first, then by exact name. Duplicates are flagged and cannot be ticked for
import; everything else is selected by default. `POST /import/apply` runs in one transaction, so a
failure half way through imports nobody.

Two traps live in that file:

- **A ragged CSV row has fewer cells than headers**, so `CsvRow` is `Record<string, string |
undefined>` rather than `Record<string, string>`. Reading a missing cell as a string is how the
  original threw on real exports.
- **The vcf library hands back two shapes.** `Property.valueOf()` returns the value for a card
  parsed from text, and the whole `[field, params, type, value]` tuple for one built from jCard.
  `propValue` handles both; it is the only place that touches the library's types.

## The frontend

`App.tsx` is the sidebar and the routes; `StoreProvider.tsx` holds the one list of people every
page reads (`useStore`) and the toast stack (`useToast`). Pages fetch their own data through
`api.ts`, which prefixes every path with `/api/rolodex`.

- **The store is loaded once and refreshed explicitly.** Anything that changes a person calls
  `refresh()`; a person's own page also reloads itself, because the list carries no detail.
- **`format.ts` holds the words, `dates.ts` the arithmetic.** `relativeDays` is the one that reads
  everywhere - "12 days ago", "in 3 days", "today".
- **Forms are built from `components/Field.tsx`**, which wraps a label round its control so the
  association needs no ids. The hint sits outside the label deliberately: inside it, it would
  become part of the control's accessible name and every test would have to spell out the hint.
- A person's page is composed from `components/person/`: header, main column, side column, and the
  quick-add modals. `PersonDetail.tsx` only loads, holds the modal state, and lays the three out.

## Two languages

Text lives in `web/src/rolodex/locales/`, and `strings.ts` holds `t`/`useT` plus `dateLocale()`,
which every date-fns `format` call passes so month and weekday names follow the page.
react-calendar takes `intlLocale()` as its `locale`, which also moves the week to start on Monday
in Spanish.

- **Display-only vocabulary**: check-in statuses, circles and their cadences and blurbs,
  interaction types and verbs, date types, gift kinds. The stored value is the key - `circle.inner`,
  `status.overdue` - through `statusLabel`, `circleLabel` and friends in `format.ts`.
  `CIRCLE_META` is gone: the web copy only ever held labels, and the cadence numbers live on the
  server.
- **Connections are worded on the page.** The people endpoint still sends the server's English
  `description`, and now also `role` (`parent`/`child` for a parent_child link, the kind
  otherwise) and `label` (the free text for that side). `PersonSide` words it from those. A
  free-text connection left blank stores nothing, where it used to store the English "Connected
  to ...".
- **A failed request shows a translated message chosen by status** (`errorMessage` in
  `format.ts`); the server's English text goes to the console. `RequestError` sits in its own
  module so suites that mock `api.ts` still construct real ones. The one refusal a person can
  reach - a day the month does not have - is caught in `AddDateModal` before it is sent.
- **The Today charts** take their axis labels from the row keys, not the server's English
  `label`.

## The port

Bench's checks are stricter than the original repo's, so the code changed shape on the way in.
Anything below is a difference from `projects/rolodex`, not a decision to revisit lightly.

- **`node:sqlite` to `better-sqlite3`.** One driver in the process, matching CRM and Space. The
  APIs are near-identical; the ported tests are what proved it.
- **One 777-line `db.ts` became `db/`**, a module per table composed by `createRepo`, because 500
  lines and 200 lines-per-function are hard limits here. `createDate` and `createConnection` grew
  an object parameter for the same reason: `max-params` is 5.
- **One 469-line router became `routes/`** - people, log, dashboard, import - plus `validate.ts`,
  which is what turns Express's `any` body into something typed. The original trusted the body's
  shape after checking a field or two.
- **React 18 to 19, react-router-dom 7 to react-router 8, recharts 2 to 3**, and the store split
  into `store.ts` (contexts and hooks) and `StoreProvider.tsx` (the component), because
  `react-refresh/only-export-components` wants a file to export components or not.
- **Types are duplicated into `web/src/rolodex/types.ts`.** The original imported them from
  `server/`; here the workspaces do not reach into each other, which is the same arrangement CRM
  has.
- **A real bug came with it and is fixed**: `relativeDays` had "yesterday" and "tomorrow" the wrong
  way round, so anything exactly one day old read as being in the future. `format.test.ts` covers
  it.

## Things that will bite

- **`react-calendar` ships its own stylesheet** and it is written for a light page. The overrides
  in `styles.css` are not decoration: without the two rules for `:disabled` and `:focus` on the
  navigation buttons, the month label sits on a white block in dark mode.
- **jsdom has no `Blob.text()`**, which is how the import modal reads a chosen file.
  `web/src/space/test/setup.ts` polyfills it for the whole web workspace.
- **The Today hero is a dark panel in both themes** (`--panel`), and its own foreground tokens go
  with it. Colours inside it cannot come from the page palette.
- **`.app` must not be `100vh`.** The nav strip takes 47px above it; the app fills what is left and
  `.main` is the scroll container.
- **A failed request has to survive a body that is not JSON.** `request()` catches the parse and
  falls back to the status, because that is the difference between "404 Not Found" and a
  `SyntaxError` naming neither the request nor what went wrong. The 304 that used to cause it is
  gone - see the `no-store` note in [PROJECT.md](../PROJECT.md).

## Related documents

- [REQUIREMENTS.md](./REQUIREMENTS.md) - the original brief, kept for intent
- [PROJECT.md](../PROJECT.md) - how the four apps fit together
- [PROCESS.md](../PROCESS.md) - how to make a change here
