/**
 * One toggle, four apps. Like the theme, the choice lives in localStorage so it survives the
 * navigation between documents - but unlike the theme it reloads, because each app reads its
 * labels once when its modules evaluate.
 */
import { test, expect } from "./fixtures";
import type { Page } from "@playwright/test";

const APPS = ["/", "/crm/", "/space/", "/rolodex/", "/groove/"];

const langAttr = (page: Page) =>
  page.evaluate(() => document.documentElement.lang);

const langButton = (page: Page) =>
  page.getByRole("button", { name: /Switch language|Cambiar idioma/ });

/** Back to English, so a spec that fails part-way does not leave the worker in Spanish. */
async function useEnglish(page: Page) {
  await page.evaluate(() => {
    localStorage.setItem("bench.lang", "en");
  });
}

test.afterEach(async ({ page }) => {
  await useEnglish(page);
});

test("the toggle switches the app you are in and every app after it", async ({
  page,
}) => {
  await page.goto("/crm/");
  await useEnglish(page);
  await page.reload();
  expect(await langAttr(page)).toBe("en");

  await langButton(page).click();
  expect(await langAttr(page)).toBe("es");

  for (const path of APPS) {
    await page.goto(path);
    expect(await langAttr(page), `${path} should still be Spanish`).toBe("es");
  }
});

test("the choice survives a reload", async ({ page }) => {
  await page.goto("/rolodex/");
  await langButton(page).click();
  expect(await langAttr(page)).toBe("es");
  await page.reload();
  expect(await langAttr(page)).toBe("es");
});

test("the button says which language it goes to, in the one you are reading", async ({
  page,
}) => {
  await page.goto("/space/");
  await expect(langButton(page)).toHaveAttribute(
    "aria-label",
    "Switch language to Spanish",
  );
  await expect(langButton(page)).toHaveText("ES");

  await langButton(page).click();
  await expect(langButton(page)).toHaveAttribute(
    "aria-label",
    "Cambiar idioma a inglés",
  );
  await expect(langButton(page)).toHaveText("EN");
});

/**
 * The navigation of each app, which is the part every screen carries. Asserting on accessible
 * names rather than sweeping the page text keeps this away from the seeded data, which is
 * English on purpose.
 */
const SHELLS: { path: string; english: string[]; spanish: string[] }[] = [
  {
    path: "/crm/",
    english: ["Dashboard", "Organizations", "Contacts", "Deals", "Pipeline"],
    spanish: [
      "Panel",
      "Organizaciones",
      "Contactos",
      "Oportunidades",
      "Embudo",
    ],
  },
  {
    path: "/rolodex/",
    english: ["Today", "People", "Circles", "Calendar", "Timeline"],
    spanish: ["Hoy", "Personas", "Círculos", "Calendario", "Cronología"],
  },
];

test("every app's own navigation is translated", async ({ page }) => {
  for (const { path, english, spanish } of SHELLS) {
    await page.goto(path);
    for (const name of english)
      await expect(page.getByRole("link", { name, exact: true })).toBeVisible();

    await langButton(page).click();
    for (const name of spanish)
      await expect(page.getByRole("link", { name, exact: true })).toBeVisible();
    for (const name of english)
      await expect(page.getByRole("link", { name, exact: true })).toHaveCount(
        0,
      );

    await useEnglish(page);
  }
});

test("Space and the launcher translate their chrome too", async ({ page }) => {
  await page.goto("/space/");
  // exact, because getByText matches a substring case-insensitively and the seeded first page
  // opens with "This is your personal space:".
  await expect(page.getByText("Personal Space", { exact: true })).toBeVisible();
  await langButton(page).click();
  await expect(
    page.getByText("Espacio personal", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Página nueva" }),
  ).toBeVisible();

  await page.goto("/");
  await expect(
    page.getByText("Todo lo que sabes, en un solo sitio"),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: /Inicio/ })).toBeVisible();
});

test("figures follow the language: Spanish dates and grouping", async ({
  page,
}) => {
  await page.goto("/crm/deals");
  const table = page.getByRole("table");
  await expect(table).toBeVisible();
  // en-US puts the symbol in front of the digits; es-ES puts it after them, behind a space.
  await expect(table).toContainText(/\$\d/);

  await langButton(page).click();
  await expect(page.getByRole("table")).toBeVisible();
  // \s rather than a literal space: Intl separates the figure from the symbol with U+00A0.
  await expect(page.getByRole("table")).toContainText(/\d\s\$/);
});
