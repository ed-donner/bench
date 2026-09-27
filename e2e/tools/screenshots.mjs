/**
 * Drives the running app in real Chromium and captures every screen of all five documents, in
 * English and Spanish in the light theme and in Spanish in the dark one, into
 * screenshots/i18n/<lang>-<theme>/. Usage: node e2e/tools/screenshots.mjs [baseURL]
 *
 * It opens menus and forms, and a Space view remembers an added filter, so point it at a server
 * with a throwaway DATA_DIR rather than the one holding your own data. Selectors are classes,
 * test ids and seed names rather than words, so one walk serves both languages.
 */
/* global document, getComputedStyle -- findClipped runs inside the page */
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const base = process.argv[2] ?? "http://localhost:8100";
const PASSES = [
  ["en", "light"],
  ["es", "light"],
  ["es", "dark"],
];

const browser = await chromium.launch();
const consoleErrors = [];
/** Per pass, per screen: text the layout cuts off, so a longer translation shows up as a count. */
const clipped = {};

/**
 * Elements whose own text is wider than their box and whose overflow is not visible - an
 * ellipsis, or a clip. Scrolling containers are left out; they are meant to be wider.
 */
const findClipped = (page) =>
  page.evaluate(() =>
    [...document.querySelectorAll("body *")]
      .filter((el) => {
        const style = getComputedStyle(el);
        const hasText = [...el.childNodes].some(
          (c) => c.nodeType === 3 && c.textContent.trim(),
        );
        return (
          hasText &&
          el.scrollWidth > el.clientWidth + 1 &&
          ["hidden", "clip"].includes(style.overflowX) &&
          el.checkVisibility()
        );
      })
      .map((el) => el.textContent.trim().slice(0, 60)),
  );

async function walk(lang, theme) {
  const dir = `screenshots/i18n/${lang}-${theme}`;
  mkdirSync(dir, { recursive: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    locale: lang === "es" ? "es-ES" : "en-US",
  });
  await context.addInitScript(
    ([l, t]) => {
      localStorage.setItem("bench.lang", l);
      localStorage.setItem("bench.theme", t);
    },
    [lang, theme],
  );
  const page = await context.newPage();
  page.on("console", (m) => {
    if (m.type() === "error") consoleErrors.push(m.text());
  });
  page.on("pageerror", (e) => consoleErrors.push(e.message));

  let n = 0;
  const pass = `${lang}-${theme}`;
  clipped[pass] = {};
  const shot = async (name) => {
    await page.waitForTimeout(400);
    clipped[pass][name] = await findClipped(page);
    n += 1;
    await page.screenshot({
      path: `${dir}/${String(n).padStart(2, "0")}-${name}.png`,
    });
  };
  const visit = async (path, ready, name) => {
    await page.goto(base + path);
    await page.locator(ready).first().waitFor();
    await shot(name);
  };

  await visit("/", ".home-card", "home");

  await visit("/crm/", "[data-testid=dash-total]", "crm-dashboard");
  await visit("/crm/organizations", "tbody tr", "crm-organizations");
  await visit("/crm/organizations/1", ".props", "crm-organization");
  await visit("/crm/contacts", "tbody tr", "crm-contacts");
  await visit("/crm/contacts/1", ".props", "crm-contact");
  await visit("/crm/deals", "tbody tr", "crm-deals");
  await page.locator(".page-header .btn-primary").click();
  await shot("crm-deal-form");
  await visit("/crm/deals/1", ".props", "crm-deal");
  await page.locator(".header-actions .btn-danger").click();
  await shot("crm-deal-delete");
  await visit("/crm/pipeline", ".deal-card", "crm-pipeline");

  await visit("/rolodex/", ".hero", "rolodex-today");
  await visit("/rolodex/people", "tbody tr", "rolodex-people");
  await page.locator(".page-actions .btn-primary").click();
  await shot("rolodex-person-form");
  await page.goto(base + "/rolodex/people");
  await page.locator(".page-actions .btn").first().click();
  await shot("rolodex-import");
  await visit("/rolodex/people/1", ".person-head", "rolodex-person");
  await page.locator(".person-actions .btn-blue").click();
  await shot("rolodex-log");
  await page.goto(base + "/rolodex/people/1");
  await page.locator(".person-col .card-header .btn-sm").nth(2).click();
  await shot("rolodex-add-date");
  await visit("/rolodex/circles", ".person-card", "rolodex-circles");
  await visit("/rolodex/calendar", ".react-calendar", "rolodex-calendar");
  await visit("/rolodex/timeline", ".feed-item", "rolodex-timeline");

  await visit("/space/", ".block-text", "space-page");
  await page.locator(".block-text").last().click();
  await page.keyboard.press("End");
  await page.keyboard.press("Enter");
  await page.keyboard.type("/");
  await page.locator(".slash-menu").waitFor();
  await shot("space-slash-menu");
  // Take back the "/" and the block it opened, so the next pass finds the page as it was.
  await page.keyboard.press("Escape");
  await page.keyboard.press("Backspace");
  await page.keyboard.press("Backspace");
  await page.goto(base + "/space/");
  await page.locator(".block-text").first().waitFor();
  await page.keyboard.press("ControlOrMeta+k");
  await page.keyboard.type("japan");
  await page.locator(".search-results [role=option]").first().waitFor();
  await shot("space-search");
  await page.keyboard.press("Escape");
  await page
    .locator(".tree-row", { hasText: "Travel" })
    .locator(".chevron")
    .click();
  await page.locator(".tree-row", { hasText: "Trip Planner" }).click();
  await page.locator(".db-table").waitFor();
  await shot("space-table");
  await page.locator(".toolbar-btn").first().click();
  await page.locator(".filter-panel .btn-subtle").click();
  await shot("space-filter");
  await page.locator(".filter-row .icon-btn").last().click();
  await page.locator(".menu-overlay").click({ position: { x: 5, y: 5 } });
  await page.locator(".add-prop").click();
  await shot("space-add-property");
  await page.locator(".menu-overlay").click({ position: { x: 5, y: 5 } });
  await page.locator(".view-tab").nth(1).click();
  await page.locator("[data-testid=board]").waitFor();
  await shot("space-board");
  await page.locator(".view-tab").nth(2).click();
  await shot("space-list");
  await page.locator(".list-row").first().click();
  await page.locator(".row-breadcrumb").waitFor();
  await shot("space-row");

  await visit("/groove/", ".transport", "groove");
  await context.close();
  console.log("captured", n, "screens in", dir);
}

for (const [lang, theme] of PASSES) await walk(lang, theme);

// Clipping that Spanish adds over English is what a translation broke; the rest was already so.
const total = (pass) =>
  Object.values(clipped[pass]).reduce((sum, list) => sum + list.length, 0);
console.log(
  `clipped text: ${total("en-light")} in English, ${total("es-light")} in Spanish`,
);
for (const [name, es] of Object.entries(clipped["es-light"])) {
  const en = clipped["en-light"][name] ?? [];
  if (es.length > en.length)
    console.log(`clipped in Spanish only, ${name}:`, es.slice(0, 8));
}

console.log(
  "console errors during walkthrough:",
  consoleErrors.length === 0 ? "none" : consoleErrors,
);
await browser.close();
