/**
 * What makes "fully translated" measurable: every catalog string that differs between the two
 * languages, searched for in what a page shows or speaks. A Spanish page that still says "Delete"
 * fails here, wherever the literal came from - and so does an English page still saying
 * "Eliminar" after switching back, which is what a label memoised once and never recomputed does.
 */
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { expect, type Page } from "@playwright/test";

const src = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../web/src",
);

type Lang = "en" | "es";
type Catalog = Record<string, string>;
const read = (app: string, lang: Lang) =>
  JSON.parse(
    readFileSync(path.join(src, app, "locales", `${lang}.json`), "utf8"),
  ) as Catalog;

/** The documents with catalogs of their own; the launcher's text is in the shared one. */
export type App = "home" | "crm" | "space" | "rolodex" | "groove";

/**
 * An app's values in `lang` that differ in the other language, plus the strip's, split at the
 * {placeholders} so each fixed part is searched on its own. Per app, because one app's
 * vocabulary is another's data: CRM says "Status", and Space's seed has a property called that.
 */
function onlyIn(lang: Lang, app: App): string[] {
  const other: Lang = lang === "en" ? "es" : "en";
  const values = ["shared", app]
    .filter((dir) => existsSync(path.join(src, dir, "locales")))
    .flatMap((dir) => {
      const theirs = read(dir, other);
      return Object.entries(read(dir, lang))
        .filter(([key, value]) => value !== theirs[key])
        .map(([, value]) => value);
    });
  const parts = values.flatMap((v) => v.split(/\{\w+\}/).map((p) => p.trim()));
  return [...new Set(parts.filter((p) => /\p{L}/u.test(p)))];
}

/** Open the app in Spanish from the first paint, the way a returning Spanish visitor sees it. */
export async function inSpanish(page: Page): Promise<void> {
  await page.addInitScript(() => {
    if (!localStorage.getItem("bench.lang"))
      localStorage.setItem("bench.lang", "es");
  });
}

/**
 * Every string a person reads or a screen reader speaks: visible text nodes, option labels, and
 * the aria-label, title, placeholder and alt of every element. Text under aria-hidden is neither
 * - recharts keeps an off-screen span holding the last label it measured, which lags a switch.
 */
async function shownText(page: Page): Promise<string[]> {
  const text = await page.evaluate(() => {
    const out: string[] = [];
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
    );
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const el = node.parentElement!;
      if (["SCRIPT", "STYLE"].includes(el.tagName)) continue;
      if (el.closest("[aria-hidden='true']")) continue;
      if (el.tagName === "OPTION" || el.checkVisibility())
        out.push(node.textContent ?? "");
    }
    return out;
  });
  const attributes = await page.evaluate(() =>
    [...document.body.querySelectorAll("*")].flatMap((el) =>
      ["aria-label", "title", "placeholder", "alt"].map(
        (attr) => el.getAttribute(attr) ?? "",
      ),
    ),
  );
  return [...text, ...attributes].map((s) => s.trim()).filter(Boolean);
}

/**
 * Fails on any shown string in the language the page should not be in: one of its catalog
 * strings exactly, or one of three words or more inside a longer string. `data` names what the
 * seed says on this screen - people, pages and deals are the user's own and stay in whatever
 * language they were written in.
 */
async function expectNone(
  page: Page,
  unwanted: Lang,
  app: App,
  data: (string | RegExp)[],
): Promise<void> {
  const catalog = onlyIn(unwanted, app);
  const isData = (text: string) =>
    data.some((d) => (typeof d === "string" ? text === d : d.test(text)));
  const leaks = (await shownText(page)).filter(
    (text) =>
      !isData(text) &&
      catalog.some(
        (s) => text === s || (s.split(" ").length >= 3 && text.includes(s)),
      ),
  );
  expect(leaks, `${unwanted} text on ${page.url()}`).toEqual([]);
}

export const expectNoEnglish = (
  page: Page,
  app: App,
  data: (string | RegExp)[] = [],
) => expectNone(page, "en", app, data);

export const expectNoSpanish = (
  page: Page,
  app: App,
  data: (string | RegExp)[] = [],
) => expectNone(page, "es", app, data);
