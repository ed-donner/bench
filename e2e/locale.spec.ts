/**
 * One toggle, five documents. The choice lives in localStorage rather than in React
 * state, because each app is its own page and the locale has to survive navigation.
 */
import { test, expect } from "./fixtures";
import type { Page } from "@playwright/test";

const APPS = ["/", "/crm/", "/space/", "/rolodex/", "/groove/"];

const lang = (page: Page) => page.evaluate(() => document.documentElement.lang);

test("the locale toggle switches the strip and every app after it", async ({
  page,
}) => {
  await page.goto("/crm/");
  await page.evaluate(() => {
    localStorage.setItem("bench.locale", "en");
  });
  await page.reload();
  expect(await lang(page)).toBe("en");
  await expect(page.getByRole("link", { name: "Home" })).toBeVisible();

  await page.getByRole("button", { name: /Switch to Hindi|हिंदी में/ }).click();
  expect(await lang(page)).toBe("hi");
  await expect(page.getByRole("link", { name: "होम" })).toBeVisible();

  for (const path of APPS) {
    await page.goto(path);
    expect(await lang(page), `${path} should still be hi`).toBe("hi");
  }
});

test("the locale choice survives a reload", async ({ page }) => {
  await page.goto("/space/");
  await page.getByRole("button", { name: /Switch to Hindi|हिंदी में/ }).click();
  const chosen = await lang(page);
  await page.reload();
  expect(await lang(page)).toBe(chosen);
});

test("the locale toggle sits beside the theme toggle", async ({ page }) => {
  await page.goto("/rolodex/");
  await expect(
    page.getByRole("button", { name: /Switch to Hindi|हिंदी में/ }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: /Switch to dark|डार्क मोड/ }),
  ).toBeVisible();
});
