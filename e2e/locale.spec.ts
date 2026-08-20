/**
 * One locale across all four apps. The choice lives in localStorage rather than in React state,
 * because each app is its own document and the locale has to survive the navigation between them.
 */
import { test, expect } from "./fixtures";
import type { Page } from "@playwright/test";

const APPS = ["/", "/crm/", "/space/", "/rolodex/", "/groove/"];

const locale = (page: Page) =>
  page.evaluate(() => document.documentElement.lang);

test("the locale toggle switches the app you are in and every app after it", async ({
  page,
}) => {
  await page.goto("/crm/");
  await page.evaluate(() => {
    localStorage.setItem("bench.locale", "en");
    document.documentElement.lang = "en";
  });
  await page.reload();
  expect(await locale(page)).toBe("en");

  await page.getByRole("button", { name: "Switch to Spanish" }).click();
  expect(await locale(page)).toBe("es");

  for (const path of APPS) {
    await page.goto(path);
    expect(await locale(page), `${path} should still be es`).toBe("es");
  }
});

test("Spanish copy appears on the CRM dashboard", async ({ page }) => {
  await page.goto("/crm/");
  await page.getByRole("button", { name: "Switch to Spanish" }).click();
  await expect(page.getByRole("heading", { name: "Panel" })).toBeVisible();
});

test("the locale choice survives a reload", async ({ page }) => {
  await page.goto("/space/");
  await page.getByRole("button", { name: "Switch to Spanish" }).click();
  expect(await locale(page)).toBe("es");
  await page.reload();
  expect(await locale(page)).toBe("es");
});

test("the strip says which way the locale toggle goes", async ({ page }) => {
  await page.goto("/rolodex/");
  const button = page.getByRole("button", { name: "Switch to Spanish" });
  await button.click();
  await expect(
    page.getByRole("button", { name: /Switch to English|Cambiar a inglés/i }),
  ).toBeVisible();
});
