# CRM

A personal sales CRM at `/crm`. Organizations, contacts, deals, a drag-and-drop pipeline,
activities with follow-ups, and a dashboard. Backed by `data/crm.sqlite`.

- Frontend: `web/src/crm/` - `pages/`, `components/`, `types.ts`, `api.ts`, `styles.css`
- Backend: `server/src/crm/` - `db.ts`, `routes.ts`, `seed.ts`
- Tests: `server/test/crm/`, `web/src/crm/types.test.ts` (the derived values), `e2e/crm/`

## Data model

Four tables in `server/src/crm/db.ts`: `organizations`, `contacts`, `deals`, `activities`.
Contacts and deals link to an organization; deals and activities link to a contact. Deleting an
organization sets those links null rather than cascading.

`deals.board_order` is the card's position within its own pipeline column. Existing databases get
it added and backfilled by `migrate`, numbering each column by id; a new deal lands at the end of
its column, and `moveDeal` renumbers a column when a card is dropped into it.

Deal stages, in order: **New, Qualified, Proposal, Negotiation, Won, Lost.**
Contact statuses: lead, qualified, customer. Activity types: note, call, email.

## Probability and expected revenue

This is the part of the domain worth reading before changing anything on the pipeline or dashboard.

- **Every deal carries a `probability` (0-100).** `STAGE_PROBABILITY` holds the per-stage defaults
  and is declared in **two** places that must agree: `server/src/crm/db.ts` and
  `web/src/crm/types.ts`. New 10, Qualified 25, Proposal 50, Negotiation 75, Won 100, Lost 0.
- **Moving a deal re-bases its probability on the new stage.** `moveDeal` does this server-side;
  the pipeline mirrors it optimistically so the totals move with the card rather than after it; the
  deal form re-bases on stage change too. This is what makes expected revenue respond to a drag -
  without it, dragging would only change a column. **Reordering inside one column does not
  re-base**, or a card could not be moved without losing a probability set by hand.
- **Expected revenue = value x probability.** `expectedValue`, `sumValue` and `sumExpected` in
  `web/src/crm/types.ts` are the single source; the pipeline header, the stage columns, the deals
  table and the dashboard tiles all read from them.
- **Open means not Won and not Lost** (`isOpen`, `OPEN_STAGES`). Pipeline totals count open deals
  only, so winning a deal removes its value from the pipeline.
- An explicit probability set on the deal form is kept until the stage changes.

## Dashboard

`web/src/crm/pages/Dashboard.tsx` composes and fetches; the charts themselves are
`components/DashboardCharts.tsx`, via recharts. Every figure they draw comes from a function in
`types.ts` - none of the aggregation lives in the component, which is what makes it unit-testable
(`types.test.ts`).

Tiles, then **four charts**, then recent activity and follow-ups.

- Tiles: open deals, pipeline value, expected revenue, deals won (6mo), revenue won (6mo). Each
  carries an icon, a supporting line, and a **tone**. The two "6 mo" tiles read the **trailing
  slice** of the month range, not all of it - the range now runs into the future, and a win dated
  next month is not revenue you have booked.
- **One colour, one meaning, across the page.** Purple counts deals, blue is the open pipeline,
  amber is forecast, green is money already won, red is lost or late. The charts use the same
  four - won bars green, expected bars amber, the volume line purple, top organizations blue - so a
  tile and the chart under it agree. `StatTile`'s `tone` sets `--tint` and `--tone`, and the values
  are the tints and inks the stage and status chips already use. The **stage** colours are a
  different axis: a scale along the pipeline, gray through to green and red, and the funnel and the
  board columns read from `STAGE_COLOR` rather than from this scheme.
- **Revenue and deal volume** (`monthRange`, `monthlyRevenue`) - twelve months, six back and six
  forward, with a dashed marker on the first forecast month. Won value fills the months behind it,
  weighted pipeline the months ahead. The two stack rather than sit side by side: a month is nearly always one or the
  other, and stacking keeps the bars readable across twelve of them. Deal volume rides over the top
  as a line on its own right-hand axis.
- **Revenue funnel** (`pipelineFunnel`) - **cumulative**: value at or past each stage, which is why
  the labels carry a trailing `+`. Charting value _sitting in_ each stage produces an inverted
  funnel, because historical Won dwarfs the open stages. If the funnel ever widens downwards, this
  is why. Wins are capped at the trailing six months; without a horizon every win ever recorded
  keeps widening the top. Lost deals never appear - a lost deal overwrites the stage it reached, so
  there is nothing to place it at, and a **conversion** funnel is not buildable on this schema.
- **Win rate** (`winLoss`) - closed deals in the trailing six months, won against lost, with the
  rate in the middle of the donut.
- **Top organizations** (`topOrganizations`) - open pipeline by organization, largest five.

**The charts set `isAnimationActive={false}`, deliberately.** recharts animates bars in from zero,
and anything that re-measures the container restarts that animation - a full-page screenshot, a
viewport resize, an HMR reload. Screenshots taken during it show axes, labels and correct totals
with **no bars at all**, which reads as a broken chart and is not one. Turning animation off makes
the page deterministic to capture. If you see an empty-looking chart here, check this before
debugging the data.

## Pipeline

`web/src/crm/pages/Pipeline.tsx`, drag via `@hello-pangea/dnd`.

- Six columns, colour-coded from `STAGE_COLOR` (gray, blue, purple, amber, green, red) and passed
  down as a `--stage` CSS custom property so the header dot, card hover, probability badge and
  drag-over outline all take the stage colour.
- The board is a **grid** - `repeat(6, minmax(0, 1fr))` - so the columns always fit. Do not go back
  to fixed-width flex columns; that is what produced a horizontal scrollbar.
- **The board takes the height the window leaves it** - `calc(100vh - 175px)`, that being the nav
  strip, the content padding and the page header - and each column scrolls its own cards. The
  droppable is the scrolling list rather than the column, which is what makes a long column
  auto-scroll while you drag near its edge.
- Header shows total pipeline and expected revenue; each column shows its own total and expected.
  Those figures carry `data-testid` attributes (`pipeline-total`, `stage-total-<Stage>`, ...) that
  the e2e suite reads.
- **Cards keep the order you leave them in.** `deals.board_order` is the position within a column;
  `boardOrder` sorts the fetched list by stage then position, `moveDeal` in `types.ts` computes the
  optimistic result, and `PATCH /deals/:id/stage` carries `{ stage, index }` so the server can
  renumber that column. A drop in the same column at the same index sends nothing.
- **Drag with the keyboard in tests**: Space to lift, arrows, Space to drop. Deterministic and free
  of viewport sensitivity. The mouse path works but is not covered.

## Tables

`web/src/crm/components/DataTable.tsx`, built on TanStack Table.

Supports sorting, per-row edit and delete icon actions, an empty state, and a summary footer. Pass
`rowLabel` so the action buttons get accessible names - "Edit Bluepeak Software" - which is what the
e2e specs select on.

**Derived columns must live on the row data, not in an `accessorFn`.** TanStack memoises its core
row model on `data` alone, so an accessor that reads a `useMemo` map keeps the values it produced
before the related fetch resolved. This showed up as every count in the Organizations table
rendering `0` while the footer total was correct. Build an enriched row type instead - see
`OrgRow` in `pages/Organizations.tsx`.

## Conventions

- Forms are modals (`Modal.tsx`, `role="dialog"` with the title as its accessible name); deletes go
  through `ConfirmDialog`.
- Money and dates format through `format.ts`: `formatMoney` / `formatDate` everywhere, plus
  `formatMoneyCompact` and `formatDateShort` for the pipeline cards, which have no room for a year
  or a full figure twice.
- **Every page opens with `PageHeader`** - its section icon, the title, a line of context, then
  whatever actions the page has. Detail pages use their section's icon too, so a contact and the
  Contacts list are visibly the same place.
- Icons are inline SVG in `components/Icons.tsx`, one 24-grid, sized by prop. The app's own mark is
  the odd one out: `IconCrm` comes from `web/src/shared/AppIcons.tsx`, so the brand block and the
  Bench nav tab show the same glyph. `ActivityIcon` picks the note, call or email glyph for a badge
  shared by the timeline and the dashboard feed.
- Sidebar: brand, then nav, sharing one icon column - check alignment against the brand when
  touching it. Getting home is the Bench nav's job, above the app.

## Two languages

Text lives in `web/src/crm/locales/`; `strings.ts` holds `t`/`useT` and `stageLabel`,
`statusLabel` and `activityLabel`. Stages, contact statuses and activity types are **display-only**:
`"Qualified"` is still what the database, the API, the CSS class (`stage-Qualified`) and the pipeline's
droppable ids carry. Money and dates go through `intlLocale()` in `format.ts` - `12.345 US$`,
`4 mar 2026` in Spanish - and the compact figures on the cards read `22,5 k US$`.

- **The dashboard's month and funnel rows are memoised with the language as a dependency**, because
  their labels are baked into the rows. Without it a switch leaves the axis in the old language.
- **The pipeline speaks for itself to a screen reader.** `@hello-pangea/dnd`'s announcements are
  English only, so `Pipeline.tsx` passes `onDragStart`/`onDragUpdate`/`onDragEnd` announcements and
  `dragHandleUsageInstructions` from the catalog. The unit stub drives all three responders;
  `e2e/i18n/crm.spec.ts` drags in Spanish and reads the live region.
- `DataTable`'s `noun` is a catalog key (`deal`, `contact`, `organization`), counted with plurals.

## Related

- [REQUIREMENTS.md](./REQUIREMENTS.md) - the original product brief
- [../PROJECT.md](../PROJECT.md), [../PROCESS.md](../PROCESS.md), [../STANDARDS.md](../STANDARDS.md)
- [../../e2e/EXPLORATORY.md](../../e2e/EXPLORATORY.md) - what is left to manual judgement here
