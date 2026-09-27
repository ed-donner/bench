# Coding standards

Write code that reads like the code already around it. When these rules and the surrounding file
disagree, match the file and mention it.

## Keep it small

- **Short functions, short modules.** If a function needs a paragraph to explain, split it.
- **Name things plainly.** `expectedValue`, `sumExpected`, `dealInStage`. A good name removes the
  need for a comment.
- **One place per concept.** Derived values live in one helper that every caller reads from -
  `expectedValue` in `web/src/crm/types.ts`, not repeated in each table and chart.
- **Delete rather than comment out.** Git remembers.

## Do not over-engineer

- Build what is asked for, not a framework that could also do it.
- No abstraction until there is a second real caller. Two similar lines beat a premature helper.
- **No defensive programming.** Do not add try/catch, null guards or fallbacks for cases that cannot
  happen. Let it throw - a crash with a stack trace beats a silent wrong answer.
- Error handling where an error is genuinely expected: a bad request, a missing record, a user
  mistake. Not everywhere.
- No configuration, feature flags or options that nothing sets.
- Use current library APIs. Check the installed version before reaching for a pattern you remember.

## Comments

Sparing. A docstring on a function or module that earns one; very little else.

Write a comment when the code cannot say it itself: **why**, not what.

```ts
// Changing column re-bases the probability on the new stage; reordering inside one does not, or a
// card could not be moved without losing a probability set by hand.
export function moveDeal(db: DB, id: number, stage: DealStage, index?: number) { ... }

// The board's columns plus the sidebar need a desktop width; at 1280 a card sits partly outside
// the viewport and drags never activate.
viewport: { width: 1440, height: 900 },
```

Do not narrate:

```ts
// Loop through the deals            <- says what the next line says
for (const deal of deals) {
// Set the state                     <- adds nothing
setOpen(true)
```

Comments that record a trap, a root cause, or a decision that looks wrong until explained are the
ones worth keeping. Those are exactly the comments in this codebase.

## LLM tells to avoid

These read as machine-written and are unwelcome here.

**In prose and comments**

- Emoji in code, comments, logs or commit messages. None, anywhere.
- Bold-lead bullets everywhere, "It's not just X, it's Y", "Let's dive in", "In today's fast-paced".
- Restating the task before doing it, or summarising what you just wrote at the end of every block.
- Hedging that adds nothing: "This should probably work", "may or may not".
- Marketing adjectives for ordinary things: "robust", "seamless", "powerful", "comprehensive",
  "leverage", "utilize" (use "use").

**In code**

- Ceremonial comment banners: `// ===== HELPERS =====`, `/** Constructor */`.
- Every line commented, or a docstring restating the signature.
- `try { ... } catch (e) { console.error(e) }` wrapped around code that cannot fail.
- Defensive `?.` and `?? ''` on values that are always present.
- Config objects, `options` parameters and abstract base classes with one implementation.
- `utils.ts` / `helpers.ts` dumping grounds. Name the module for what it holds.
- Renaming or reformatting code you were not asked to touch.

**In UI**

- Gradients. Flat colour only.
- A brand colour per app. In Bench chrome, colour means state - amber is "you are here" - and an
  app is told apart by its glyph. One colour per app stops scaling at about four.
- Left-border accent stripes on cards and callouts.
- Drop shadows used for decoration rather than to lift something that is genuinely floating.
- Emoji as icons. Use the inline SVG set in `web/src/crm/components/Icons.tsx`, or `lucide-react`
  in Space.
- Purple-to-blue hero gradients, glassmorphism, oversized rounded corners.

The exception, kept deliberately: the small conic-gradient brand mark.

## Text in two languages

- **No literal UI text.** Every word a person reads or a screen reader speaks comes from the app's
  `locales/en.json` and `locales/es.json` through `t()`, and goes into **both** catalogs in the same
  change. Lint rejects text between JSX tags and in `aria-label`, `title`, `placeholder` and `alt`;
  a string built in a helper - a toast, a chart label - is the case it cannot see, so treat those
  the same way.
- **Translate labels, never values.** A stored value (`"Qualified"`, `"inner"`) is a key; the label
  comes from ``t(`stage.${stage}`)``. Nothing the user typed, and nothing the seed wrote, goes
  through a catalog.
- **Keys are flat and dotted** (`"deals.col.stage"`), grouped by screen. Plurals are
  `"key.one"`/`"key.other"` and chosen by a numeric `count`.
- **Anything memoised that holds a label depends on the language**, or it keeps the old one after
  a switch - `t` from `useT()` changes identity when the language does, so put it in the deps.
- Format numbers, money and dates with `intlLocale()` or the app's date-fns locale, never a
  hard-coded `"en-US"`.

## TypeScript and React

- `strict` is on, with `noUnusedLocals` and `noUnusedParameters`. Do not loosen the config to make
  an error go away.
- No `any` in new code. `unknown` plus a narrow is fine when a library forces it.
- Derived UI values belong on the row data, not in a TanStack `accessorFn` - see
  [crm/IMPLEMENTATION.md](./crm/IMPLEMENTATION.md) for why that specifically bites.
- Keep components focused: a component that fetches, transforms and renders three panels is three
  components.

## CSS

- Each app owns one global `styles.css`. They are **not** scoped, and class names across the four
  apps genuinely collide - see [PROJECT.md](./PROJECT.md).
- Reuse the palette variables in `:root`. Do not introduce a new colour without a reason.
- **Every colour goes through a variable, and every variable has a dark value.** A literal in a
  rule is a colour that cannot be themed; the exceptions are the nav strip, which is deliberately
  self-contained, and the handful of tokens that mean "on a dark block" and stay put in both
  themes. Set `color-scheme` too, or native date pickers and scrollbars stay light.
- Prefer grid or flex sizing that adapts over fixed widths that overflow. A board built from
  `repeat(6, minmax(0, 1fr))` never produces a horizontal scrollbar; six 210px columns do.
- Check the whole box when you change spacing - above, below, left and right. Insets are often
  supplied by a neighbour rather than the element itself.

## Commits

**Commit your work when it is finished.** Finishing means the checks are green and you have seen the
change working - see [PROCESS.md](./PROCESS.md). Do not leave completed work sitting in the tree.

- **Never commit red.** If the checks do not pass, the work is not finished; fix it or say plainly
  what you could not fix and leave it uncommitted.
- **Write the message in the commit,** not in your reply. Plain sentences, wrapped at roughly 80
  columns, no emoji and no `feat:` / `chore:` prefixes. Say what changed and why.
- **Still report in your reply.** Name anything a reader would otherwise be surprised by: a bug that
  turned out to be pre-existing, a deliberate gap, a decision that looks odd without the reason,
  anything incomplete or unverified. The commit records the change; the reply records the judgement.
- **Leave the tree clean of scratch files** - delete any throwaway scripts you wrote along the way.
  Commit the work, not the workings.
- **Do not rewrite history.** No amending, rebasing, force-pushing or tagging unless asked directly.
- **Do not push** unless asked. Committing is now part of the job; publishing is still Ed's call.

## Related documents

- [PROJECT.md](./PROJECT.md) - purpose, layout, architectural decisions
- [PROCESS.md](./PROCESS.md) - implementing a change, testing, suite maintenance
- [CONTROLS.md](./CONTROLS.md) - the checks that mechanise these standards, and how each is enforced
