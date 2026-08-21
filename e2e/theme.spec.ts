/**
 * One toggle, four apps. The choice lives in localStorage rather than in React state, because
 * each app is its own document and the theme has to survive the navigation between them.
 */
import { test, expect } from "./fixtures";
import type { Page } from "@playwright/test";

const APPS = ["/", "/crm/", "/space/", "/rolodex/", "/groove/"];

const theme = (page: Page) =>
  page.evaluate(() => document.documentElement.dataset.theme);

const bodyBackground = (page: Page) =>
  page.locator("body").evaluate((el) => getComputedStyle(el).backgroundColor);

test("the toggle switches the app you are in and every app after it", async ({
  page,
}) => {
  // Start from light, so the assertion names one theme rather than whichever was there.
  await page.goto("/crm/");
  await page.evaluate(() => {
    localStorage.setItem("bench.theme", "light");
  });
  await page.reload();
  expect(await theme(page)).toBe("light");

  await page.getByRole("button", { name: /Switch to dark|डार्क मोड/ }).click();
  expect(await theme(page)).toBe("dark");

  for (const path of APPS) {
    await page.goto(path);
    expect(await theme(page), `${path} should still be dark`).toBe("dark");
  }
});

test("each app repaints rather than only the strip", async ({ page }) => {
  for (const path of APPS) {
    await page.goto(path);
    // Start from a known theme, then flip it.
    const before = await bodyBackground(page);
    await page
      .getByRole("button", { name: /Switch to dark|डार्क मोड/ })
      .click();
    const after = await bodyBackground(page);
    expect(after, `${path} kept the same background`).not.toBe(before);
  }
});

test("the choice survives a reload", async ({ page }) => {
  await page.goto("/rolodex/");
  await page.getByRole("button", { name: /Switch to dark|डार्क मोड/ }).click();
  const chosen = await theme(page);
  await page.reload();
  expect(await theme(page)).toBe(chosen);
});

test("the strip says which way the toggle goes", async ({ page }) => {
  await page.goto("/space/");
  const button = page.getByRole("button", {
    name: /Switch to dark|Switch to light|डार्क मोड|लाइट मोड/,
  });
  const label = await button.getAttribute("aria-label");
  await button.click();
  await expect(button).not.toHaveAttribute("aria-label", label!);
});
