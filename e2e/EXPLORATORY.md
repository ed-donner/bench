# Exploratory testing charter

What the automated suite deliberately does **not** cover, and how to check it by hand or with an
agent. Run this when you change something the assertions cannot see: audio, visual design,
animation, feel.

The automated suite lives beside this file. Prefer adding a spec over adding a line here - this
document is for what genuinely cannot be asserted.

## Running the apps

```bash
npm run dev     # Vite :8101 (+ API :8100) - the usual choice
npm start       # everything from :8100 - the production path
```

**Check both when you touch routing.** Deep-link fallback is implemented twice - `server/src/app.ts`
for production, the `appFallback` plugin in `web/vite.config.ts` for the dev server. They have
already disagreed once: prod served the right app while dev served the launcher.

With `agent-browser`: `agent-browser --session bench open http://localhost:8101/crm/`, then
`snapshot -i` to list interactive elements. Two traps worth knowing - `fill @ref ""` does **not**
clear a field (reload instead), and refs go stale after navigation, so re-snapshot before clicking.

**Check both themes.** The toggle sits on the right of the nav strip and applies to all four apps.
The specs assert that each app's background actually changes and that the choice survives a
reload; whether the result is _legible_ - chart axes, chips on tinted backgrounds, Groove's lit
steps against a pale panel - is a judgement only you can make.

## Groove - the big one

**Nothing about how it sounds is tested.** The suite proves the transport runs, the playhead
advances, steps toggle and patches load. Every judgement below is yours:

- Do the drums sound like their names - is the kick punchy, the snare snappy, the hats crisp?
- Does the master filter sweep smoothly across its range, and does resonance self-oscillate near
  the top without an ugly jump?
- Does the sidechain pump in time, ducking bass/pads/lead while the kick stays clear?
- Do the four patches each have a distinct character?
- Tempo and swing: does the groove still feel right at 90 and at 160 BPM?
- Any clicks, pops, or dropouts when toggling steps or switching patches **while playing**?
- Does audio stop cleanly on stop, with no ringing tail or stuck voice?

**Headless tests never open an audio device, so the suite cannot hear a regression here.** Note
that driving Groove with a visible browser plays sound out loud - stop the transport before walking
away.

Two related gaps, now that the components carry unit tests:

- **The spectrum scope is tested for its render loop, not its picture.** `Scope.test.tsx` fakes the
  2D context and drives frames by hand, so it proves the loop starts, reads the analyser and the
  filter each frame, and is cancelled on unmount. Whether the curve is drawn in the right place is
  still an eye judgement - watch it track a filter sweep.
- **The engine is stubbed in `App.test.tsx`.** Those tests prove the panels are wired to the patch
  state, not that anything is scheduled or heard.

## CRM

Covered by specs: CRUD for organizations, contacts and deals, search, status filter, keyboard drag
on the pipeline, delete confirmation, deep links. Left to judgement:

- Dashboard charts: the unit suite now asserts the month labels, the `$40k` axis shortening, the
  forecast marker and the funnel's own figures, against a chart given a fixed size. What it cannot
  see is the picture - whether the bars line up under their months, whether the funnel reads as a
  funnel, whether anything overlaps at a real width. Look at it.
- Chart tooltips. They only appear on a real hover, so nothing asserts their wording or their
  figures. Hover each of the four.
- Mouse dragging on the pipeline. The specs drag with the keyboard, which is what
  `@hello-pangea/dnd` supports natively and what makes them stable, and the unit suite stubs the
  library out entirely - so the mouse path is **untested at every level**. Drag a card with the
  mouse after touching the pipeline, between columns and up and down within one, and reload to
  confirm the order stuck.
- Whether a column that overflows scrolls sensibly, and whether dragging a card to the bottom edge
  of a full column auto-scrolls it. The board is sized to the window, so this only shows up with
  enough deals in one stage, or a short window.
- Chart readability: do the funnel proportions, the stacked won-versus-expected bars and the
  probability meters actually communicate at a glance? Only their presence and figures are asserted.
- The forward half of "Revenue and deal volume" only fills if open deals carry future close dates.
  A database seeded weeks ago has a pipeline that has all gone past due, so the months ahead read
  empty - correctly, but it does not look like much. Delete `data/crm.sqlite*` to reseed against
  today before judging that chart.
- Long values: very long organization names, huge deal values, empty descriptions.
- Does the pipeline stay usable with many deals in one stage?

## Space

The best-covered app - pages, editor, databases, all three views, search, themes, plus an
adversarial suite. Left to judgement:

- Editor feel: caret placement after slash-menu inserts, selection across blocks, paste of odd
  content.
- Dark mode on every surface, including modals, menus and the board.
- Board drag with the mouse at narrow widths. The board needs a desktop-width window; below roughly
  1400px its columns plus the sidebar overflow, and a card can sit outside the viewport. This is
  why the suite pins 1440x900.

## Cross-app

- The launcher, then into each app and back. Because the apps are separate documents, back is a
  full page load, not a router transition, and moving between apps through the nav strip is a
  navigation rather than a transition.
- **The nav strip should look identical in all four documents** - same height, same dark, same
  amber line - including Space in dark mode and over Groove's dark rack. The suite asserts the
  links and the current tab; it cannot see that the strip has picked up a host app's font,
  letter-spacing or palette. That is exactly what would go wrong.
- Each app should keep its own look below the strip: CRM light, Space light/dark, Groove dark. Any
  styling bleeding between them means the multi-page split has been broken.
- Refresh on a deep link in **both** dev and prod.

## Spanish

`e2e/language.spec.ts` covers the toggle itself, `<html lang>`, that the choice travels between
apps, and each app's own navigation. What it does not cover, and needs an eye:

- **Every other screen.** The spec asserts on the navigation and a handful of headings, not on all
  ~500 strings. A key that was missed shows up as itself on screen; `web/src/test/locales.test.ts`
  catches one that exists in only one language, and the missing-key handler catches one that exists
  in neither, but neither can see a string that never went into a bundle at all.
- **Fit.** Spanish runs roughly 20% longer than English. Sidebars, table headers, the pipeline
  cards and Groove's fixed-width readouts are where it will show, and only a look can tell you.
  `e2e/tools/screenshots.mjs` in each language is the fastest way to compare.
- **Groove's panel is untranslated on purpose** - CUTOFF, RESO, SAW, and the note names. Only its
  tooltips and aria-labels are Spanish.
- **Seeded data stays English.** Organization names, page content and the Rolodex people are data,
  not chrome, so a Spanish screen is legitimately full of English nouns.
- **The Spanish itself.** Nothing automated judges whether it reads well, and it has not been
  reviewed by a native speaker.
