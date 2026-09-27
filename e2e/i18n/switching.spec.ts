/**
 * The switch itself, across the whole platform: once, and back again, in the middle of work.
 * Switching twice is the test that matters most - a label computed once and memoised shows up
 * here as Spanish left behind on an English page.
 */
import { test, expect } from "../fixtures";
import type { Page } from "@playwright/test";
import { type App, expectNoEnglish, expectNoSpanish } from "./leaks";

const toSpanish = (page: Page) =>
  page.getByRole("button", { name: "Switch to Spanish" }).click();
const toEnglish = (page: Page) =>
  page.getByRole("button", { name: "Cambiar a inglés" }).click();

/**
 * One screen per app with something in it that is easy to get wrong: memoised chart rows on the
 * dashboard, memoised table columns on People, the database toolbar, the pads' accessible names.
 * `en` and `es` are the same landmark in each language, so a check can wait for the render.
 */
const SCREENS: {
  app: App;
  path: string;
  en: string;
  es: string;
  data?: string[];
  open?: (page: Page) => Promise<void>;
}[] = [
  {
    app: "home",
    path: "/",
    en: "Four apps, one server",
    es: "Cuatro aplicaciones",
  },
  { app: "crm", path: "/crm/", en: "Revenue funnel", es: "Embudo de ingresos" },
  {
    app: "crm",
    path: "/crm/pipeline",
    en: "Total pipeline",
    es: "Embudo total",
  },
  {
    app: "rolodex",
    path: "/rolodex/people",
    en: "Last contacted",
    es: "Último contacto",
  },
  {
    app: "rolodex",
    path: "/rolodex/",
    en: "Who to contact",
    es: "A quién contactar",
  },
  {
    app: "space",
    path: "/space/",
    en: "New database",
    es: "Nueva base de datos",
    data: ["Home"],
    open: async (page) => {
      await page
        .getByRole("button", { name: /(Expand|Expandir) Travel/ })
        .click();
      await page.getByRole("treeitem", { name: /Trip Planner/ }).click();
    },
  },
  { app: "groove", path: "/groove/", en: "PLAY", es: "TOCAR" },
];

/** Waits for the landmark, then scans the whole screen for the other language. */
async function expectEnglish(page: Page, s: (typeof SCREENS)[number]) {
  await expect(page.getByText(s.en, { exact: false }).first()).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expectNoSpanish(page, s.app, s.data);
}

async function expectSpanish(page: Page, s: (typeof SCREENS)[number]) {
  await expect(page.getByText(s.es, { exact: false }).first()).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", "es");
  await expectNoEnglish(page, s.app, s.data);
}

test("switching once turns the screen you are on, and every other app, Spanish", async ({
  page,
}) => {
  await page.goto("/crm/contacts");
  await expect(page.getByRole("heading", { name: "Contacts" })).toBeVisible();
  await toSpanish(page);
  await expect(page.getByRole("heading", { name: "Contactos" })).toBeVisible();
  await expect(page).toHaveTitle("CRM personal");

  for (const screen of SCREENS) {
    await page.goto(screen.path);
    await screen.open?.(page);
    await expectSpanish(page, screen);
  }
});

for (const screen of SCREENS) {
  test(`switching twice returns ${screen.path} fully to English, in place`, async ({
    page,
  }) => {
    await page.goto(screen.path);
    await screen.open?.(page);
    await expectEnglish(page, screen);

    await toSpanish(page);
    await expectSpanish(page, screen);

    await toEnglish(page);
    await expectEnglish(page, screen);
  });
}

/**
 * A modal's overlay covers the strip, so with a form open the language button is reachable from
 * the keyboard only - Tab past the form, Enter - which is how this presses it.
 */
async function pressLanguageButton(page: Page, name: string) {
  await page.getByRole("button", { name }).focus();
  await page.keyboard.press("Enter");
}

test("an open form keeps what was typed through both switches", async ({
  page,
}) => {
  await page.goto("/crm/deals");
  await page.getByRole("button", { name: "Add deal" }).click();
  await page.getByRole("dialog").getByLabel("Name").fill("Half-typed deal");
  await page.getByRole("dialog").getByLabel("Value (USD)").fill("1234");

  await pressLanguageButton(page, "Switch to Spanish");
  const dialog = page.getByRole("dialog", { name: "Añadir negocio" });
  await expect(dialog.getByLabel("Nombre")).toHaveValue("Half-typed deal");
  await expect(dialog.getByLabel("Valor (USD)")).toHaveValue("1234");
  await expectNoEnglish(page, "crm");

  await pressLanguageButton(page, "Cambiar a inglés");
  await expect(
    page.getByRole("dialog", { name: "Add deal" }).getByLabel("Name"),
  ).toHaveValue("Half-typed deal");
  await expectNoSpanish(page, "crm");
});

test("a block being edited keeps its text and saves through both switches", async ({
  page,
  baseURL,
}) => {
  await page.goto("/space/");
  await page.getByRole("button", { name: "New page" }).click();
  // Wait for the new page: until it loads, the title input is still the previous page's.
  const title = page.getByPlaceholder("Untitled");
  await expect(title).toHaveValue("");
  await title.fill(`Switching ${Date.now()}`);
  await page.locator(".block-text").first().click();
  await page.keyboard.type("Written before the switch");

  await toSpanish(page);
  await expect(page.locator(".block-text").first()).toHaveText(
    "Written before the switch",
  );
  await expect(page.getByPlaceholder("Sin título")).not.toHaveValue("");
  await toEnglish(page);
  await expect(page.locator(".block-text").first()).toHaveText(
    "Written before the switch",
  );

  const pageId = new URL(page.url()).pathname.split("/").pop()!;
  await expect
    .poll(async () => {
      const res = await page.request.get(
        `${baseURL}/api/space/pages/${pageId}`,
      );
      const body = (await res.json()) as {
        blocks: { content: { text?: string } }[];
      };
      return body.blocks[0]?.content.text;
    })
    .toBe("Written before the switch");
});

test("Groove keeps playing through both switches", async ({ page }) => {
  await page.goto("/groove/");
  await page.getByRole("button", { name: /PLAY/ }).click();
  await expect(page.getByRole("button", { name: /STOP/ })).toBeVisible();

  await toSpanish(page);
  await expect(page.getByRole("button", { name: /PARAR/ })).toBeVisible();
  await toEnglish(page);
  const stop = page.getByRole("button", { name: /STOP/ });
  await expect(stop).toBeVisible();
  await stop.click();
});

/** Everything the three databases hold that a screen reads, as the API returns it. */
const ENDPOINTS = [
  "/api/crm/organizations",
  "/api/crm/contacts",
  "/api/crm/deals",
  "/api/crm/activities",
  "/api/space/tree",
  "/api/rolodex/people",
  "/api/rolodex/tags",
  "/api/rolodex/timeline",
];

async function snapshot(page: Page, baseURL: string): Promise<string[]> {
  const bodies: string[] = [];
  for (const url of ENDPOINTS)
    bodies.push(await (await page.request.get(baseURL + url)).text());
  return bodies;
}

test("switching both ways leaves every database byte-identical, and the data as written", async ({
  page,
  baseURL,
}) => {
  const before = await snapshot(page, baseURL!);

  for (const path of ["/crm/deals", "/space/", "/rolodex/people", "/groove/"]) {
    await page.goto(path);
    await toSpanish(page);
    await expect(page.locator("html")).toHaveAttribute("lang", "es");
    await toEnglish(page);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
  }
  await page.goto("/rolodex/people");
  await expect(page.getByRole("cell", { name: /Maya Chen/ })).toBeVisible();
  await toSpanish(page);
  // The seed's names are data, and read the same in both languages.
  await expect(page.getByRole("cell", { name: /Maya Chen/ })).toBeVisible();
  await page.goto("/crm/organizations");
  await expect(
    page.getByRole("cell", { name: "Bluepeak Software" }).first(),
  ).toBeVisible();

  expect(await snapshot(page, baseURL!)).toEqual(before);
});
