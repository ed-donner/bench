# Plan: English and Spanish across all four apps

Plan for [SPEC.md](./SPEC.md). Nothing is built until this plan is confirmed.

## Decisions

Settled with Ed before planning:

| Question      | Decision                                                                                                                                                                                                                                    |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Which Spanish | Neutral Spanish wording, formatted with the `es` locale: `1.234,50 US$`, `26 sept 2026`. Currency stays USD, because the stored amounts are dollars.                                                                                        |
| First visit   | Follow the browser: Spanish if `navigator.language` starts with `es`, otherwise English. Once the user picks a language it is remembered in `localStorage` under `bench.lang`. This is the same rule the theme uses.                        |
| Groove        | Translate the prose, buttons and accessibility text: help, Play/Stop/Clear, aria-labels and tooltips. Keep the panel legends (BPM, STEP, CUTOFF, RES), unit names, patch names and the GROOVEBOX GX-4 badge in English, as the spec allows. |
| Selector      | A compact `EN` / `ES` button to the left of the theme toggle. One click switches to the other language.                                                                                                                                     |

These follow from the spec and the architecture, so they were not put to Ed:

- **No i18n library.** There are two languages, flat keys, `{name}` interpolation and plurals
  through `Intl.PluralRules`. That comes to roughly 60 lines in `web/src/shared/i18n.ts`, which is
  less code than wiring up i18next. This follows "build what is asked for" in STANDARDS.md.
- **Switching is live, not a reload.** Space's editor and the open modals would lose state on a
  reload. Language lives in a small store read through `useSyncExternalStore`, so the strip's
  button re-renders the whole app in place. Like `initTheme()`, `initLang()` runs before the first
  render and sets `<html lang>`.
- **Translation text lives in JSON, separate from code.** Each app gets
  `web/src/<app>/locales/en.json` and `es.json`, and the strip and launcher share
  `web/src/shared/locales/`. Keys are flat and dotted (`"deals.title"`) so the types stay trivial:
  a key is `keyof typeof en`, which makes a typo a type error. Each app keeps its own catalogs,
  following the one-way import rule between apps.
- **User data is never translated, and the server does not change.** This covers the seed
  content as well as anything you type. Space's pages, databases, property names and select
  options, the sample CRM deals and organizations, and Rolodex people and tags all stay exactly as
  stored. Because the demo content is English, Spanish screenshots of Space will show English page
  bodies inside Spanish chrome. That is correct under the spec, and the final report will say so.
- **Fixed app vocabulary is translated at display time only.** This covers deal stages, contact
  statuses, activity types, Rolodex circles and their cadences, and Space's block and property
  type names. The stored value (`"Qualified"`, `"inner"`) stays the key, and the label comes from
  `t(\`stage.${stage}\`)`. `CIRCLE_META` and similar keep their numbers and lose their English
  strings to the catalogs.
- **Server error text is shown as a translated message.** Rolodex's `errorMessage` and Space's
  `api.ts` currently display the server's English `error` string. The client will show a
  translated message for each failure, and the server's text stays in the console for debugging.
  If Phase 2 finds that Rolodex's CSV/vCard import reports errors row by row, those rows get a
  stable `code` on the server response and a catalog entry. That is the only server change, and
  it adds a field without changing any data.
- **Dates and numbers are formatted in one place.** A shared `formatters.ts` exposes date, number
  and currency formatting keyed on the current language. It uses `Intl` for most output, the
  `date-fns` `es` locale in Rolodex, react-calendar's `locale` prop, and the recharts tick
  formatters.

## Controls this adds

- **A lint rule against literal UI text.** This is the built-in `no-restricted-syntax`, so no
  package is added. It rejects `JSXText` containing a letter, and string literals in `aria-label`,
  `title`, `placeholder` and `alt`, across `web/src`, excluding tests. The rule's scope grows one
  app per phase so `check` stays green throughout. Groove's legend files are named exemptions in
  `eslint.config.js`, with the reason beside them, like the other rules that are off. Once this
  lands, nobody can add an untranslated string without lint catching it.
- **A catalog parity unit test** for every app. It checks that `en` and `es` have identical key
  sets, that every key uses the same `{placeholders}` in both languages, and that no value is
  empty.
- **An English-leak scan in e2e.** On every screen rendered in Spanish, it collects the visible
  text plus aria-labels, titles and placeholders. It fails if any English catalog value appears
  there, unless that value is identical in Spanish (such as "CRM") or is known seed data on that
  screen. This is what makes "fully translated" measurable rather than eyeballed.

## Phases

Each phase ends with `npm run format`, `npm run check` and `npm run e2e` green, a look in the
browser in both languages, and a commit.

### Phase 1: Foundation, the strip and the launcher

- `web/src/shared/i18n.ts` holds the `Lang` type, `initLang()`, the store, `useLang()`,
  `setLang()`, and a `makeT(catalogs)` that gives each app a typed `useT()`.
- `web/src/shared/formatters.ts` holds locale-aware date, number and currency formatting.
- The `EN`/`ES` button in `BenchNav.tsx` is styled in `nav.css`, kept self-contained and prefixed
  `bench-nav`. It gets an aria-label that says which way it goes ("Switch to Spanish" /
  "Cambiar a inglés"). The strip's own labels and the theme toggle's label are translated too.
- Every entry point calls `initLang()` next to `initTheme()`.
- The launcher (`web/src/home/`) is translated.
- `playwright.config.ts` pins `locale: "en-US"`, so the existing English specs cannot drift if
  the browser default changes.
- The lint rule is turned on for `web/src/shared` and `web/src/home`, and the parity test is added.

**Done when:** the unit tests cover the store, init from storage and from the browser, plurals,
interpolation and `<html lang>`. An e2e spec switches the language on the launcher and it holds on
all five documents and across a reload. The button fits the strip at 1440 wide in both themes.

### Phase 2: Rolodex

All pages and modals are translated: Today, People, Circles, Calendar, Timeline, the person
detail views, and the Add, Log, Import and Person forms. This includes circle labels and
cadences, status text and relative dates ("in 3 days" / "en 3 días"), and the date-fns and
react-calendar locales. This phase also resolves the import-error question from Decisions.

**Done when:** the lint rule and the parity test cover `web/src/rolodex`, the unit coverage for
Rolodex stays at or above the current level, and every Rolodex screen in Spanish passes the leak
scan.

### Phase 3: CRM

The dashboard, including the chart axes, legends and tooltips, is translated, along with the
lists, detail pages, pipeline, forms and table headers. Stage, status and activity-type labels are
translated as display labels only. Currency and probability use the shared formatters.

**Done when:** the same bar as Phase 2 is met, and in Spanish the pipeline's keyboard drag still
works, with its live-region announcements translated.

### Phase 4: Space

The sidebar, tree, search modal, editor chrome, slash menu, block-type names, database toolbar,
view tabs, filter and sort menus, property-type names, the board, table and list views, and the
empty states are all translated. Page content, database names, properties and options stay
untouched.

**Done when:** the same bar as Phase 2 is met, and the slash menu still filters in Spanish, so
typing `/enca` finds "Encabezado".

### Phase 5: Groove

The strings named in Decisions are translated. The legend exemptions are named in the lint config.

**Done when:** the same bar as Phase 2 is met, and the instrument spec still passes in both
languages.

### Phase 6: Whole-platform e2e, screenshots and docs

**e2e**, in `e2e/i18n/`, uses a fixture that seeds `bench.lang` through an init script:

- For each app, a walk through every screen in Spanish, asserting on the headings and controls
  and running the leak scan.
- **Switch once:** start in English, switch to Spanish mid-app, and assert that the current screen
  and every other app are in Spanish.
- **Switch twice:** English to Spanish to English. Assert a full return to English, with no
  Spanish left over from stale memoised labels, which is the likely bug.
- Switching in the middle of a task keeps its state. Examples are a Space block being edited, an
  open CRM form with typed values, and Groove playing.
- **User data is unchanged:** API responses for all three databases are byte-identical before and
  after switching both ways, and the seed names render identically in both languages.
- `<html lang>` is correct on every document, and the first visit follows `locale: "es-ES"` in a
  dedicated browser context.

**Screenshots:** `e2e/tools/screenshots.mjs` is extended to capture every screen of all five
documents in English and Spanish, in light mode, plus a dark-mode pass in Spanish, into
`screenshots/i18n/`. That directory is added to `.gitignore`. To validate them, I review each
Spanish screenshot for:

- untranslated text
- text overflowing or truncating, since Spanish runs about 25% longer (buttons, the pipeline
  columns, the strip, table headers)
- broken alignment, measured with `getBoundingClientRect` where it looks marginal

I record what I checked, and every fix goes back into the phase it belongs to.

**Docs:**

- PROJECT.md gets a new decision, "One language, chosen once", next to the theme decision, and
  adds catalogs to the checklist in "Adding a fifth app".
- STANDARDS.md adds the rule: no literal UI text, and every string goes into both catalogs.
- CONTROLS.md documents the lint rule, the parity test and the leak scan.
- Each app's IMPLEMENTATION.md gets a note on where its catalogs live and which vocabulary is
  display-only.
- EXPLORATORY.md records that a native Spanish speaker has not reviewed the translations.

## Overall success criteria

1. One `EN`/`ES` button next to the theme toggle switches all five documents, live, without a
   reload, and the choice persists across apps and reloads.
2. All UI text lives in `locales/*.json`, and lint fails on any new literal UI string outside the
   documented Groove exemptions.
3. The database contents are unchanged by switching, as shown by the e2e test.
4. Screenshots of every screen exist in both languages and have been reviewed, with no untranslated
   chrome and no overflow.
5. The e2e suite covers every app in both languages, switching once and twice, and passes.
   `npm run check` passes with coverage at or above today's levels.

## Risks

- **Size.** There are about 11.8k lines of TSX, and I estimate 900 to 1,400 strings. Phases 2 to 4
  are the bulk of the work. Converting them is mechanical but has to be exhaustive, which is why
  the lint rule and the leak scan exist.
- **Labels that are computed once and kept.** Examples are module-level constants such as
  `APPS` in `BenchNav.tsx` and TanStack column definitions built in a `useMemo`. These will not
  update when the language switches unless they depend on it. The switch-twice test targets this.
- **Existing specs select by English names.** They keep running in English, so they are
  unaffected. The Spanish coverage comes from the new specs rather than from doubling every
  existing one.
- **Translation quality** is mine, not a native speaker's. The final report will say so, and
  EXPLORATORY.md will record it.
