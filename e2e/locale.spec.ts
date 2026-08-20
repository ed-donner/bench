/**
 * One toggle, five documents. The choice lives in localStorage rather than in React state,
 * because each app is its own page and the locale has to survive navigation between them.
 */
import { test, expect } from "./fixtures";
import type { Page } from "@playwright/test";

const APPS = ["/", "/crm/", "/space/", "/rolodex/", "/groove/"];

const lang = (page: Page) => page.evaluate(() => document.documentElement.lang);

const localeButton = (page: Page) =>
  page.getByRole("button", { name: /Switch to Spanish|Cambiar a español/ });

const englishButton = (page: Page) =>
  page.getByRole("button", { name: /Switch to English|Cambiar a inglés/ });

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => {
    localStorage.setItem("bench.locale", "en");
    document.documentElement.lang = "en";
  });
});

test("the toggle switches the app you are in and every app after it", async ({
  page,
}) => {
  await page.goto("/crm/");
  await localeButton(page).click();
  expect(await lang(page)).toBe("es");

  for (const path of APPS) {
    await page.goto(path);
    expect(await lang(page), `${path} should still be es`).toBe("es");
  }
});

test("the choice survives a reload", async ({ page }) => {
  await page.goto("/rolodex/");
  await localeButton(page).click();
  expect(await lang(page)).toBe("es");
  await page.reload();
  expect(await lang(page)).toBe("es");
});

test("Spanish chrome appears on CRM and Rolodex", async ({ page }) => {
  await page.goto("/crm/");
  await localeButton(page).click();
  await expect(page.getByRole("link", { name: "Panel" })).toBeVisible();

  await page.goto("/rolodex/");
  await expect(page.getByRole("link", { name: "Hoy" })).toBeVisible();
});

test("the strip shows EN after switching to Spanish", async ({ page }) => {
  await page.goto("/space/");
  await localeButton(page).click();
  await expect(englishButton(page)).toBeVisible();
});
