/**
 * One language button, five documents. Like the theme, the choice travels in localStorage, and
 * unlike the theme it re-renders in place rather than on the next load.
 */
import { test, expect } from "../fixtures";
import type { Page } from "@playwright/test";

const DOCUMENTS = ["/", "/crm/", "/space/", "/rolodex/", "/groove/"];

const primary = (page: Page, name: string) =>
  page.getByRole("navigation", { name });

test("switching on the launcher holds in every app and across a reload", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await page.getByRole("button", { name: "Switch to Spanish" }).click();
  await expect(page.getByText("Abrir").first()).toBeVisible();

  for (const path of DOCUMENTS) {
    await page.goto(path);
    await expect(page.locator("html"), path).toHaveAttribute("lang", "es");
    await expect(
      primary(page, "Principal").getByRole("link").first(),
    ).toHaveText("Inicio");
    await page.reload();
    await expect(page.locator("html"), path).toHaveAttribute("lang", "es");
  }
});

test("a first visit follows a Spanish browser", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({ locale: "es-ES", baseURL });
  const page = await context.newPage();
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("lang", "es");
  await expect(
    page.getByRole("button", { name: "Cambiar a inglés" }),
  ).toBeVisible();
  await context.close();
});

test("the language button fits the strip beside the theme toggle", async ({
  page,
}) => {
  for (const theme of ["light", "dark"]) {
    await page.goto("/crm/");
    await page.evaluate((t) => {
      localStorage.setItem("bench.theme", t);
    }, theme);
    await page.reload();
    const strip = await page.locator(".bench-nav").boundingBox();
    const lang = await page
      .getByRole("button", { name: "Switch to Spanish" })
      .boundingBox();
    const toggle = await page
      .getByRole("button", { name: /Switch to (light|dark)/ })
      .boundingBox();
    // Inside the strip, on one line, and to the left of the toggle without touching it.
    expect(lang!.y).toBeGreaterThanOrEqual(strip!.y);
    expect(lang!.y + lang!.height).toBeLessThanOrEqual(
      strip!.y + strip!.height,
    );
    expect(lang!.x + lang!.width).toBeLessThanOrEqual(toggle!.x);
    expect(toggle!.x + toggle!.width).toBeLessThanOrEqual(
      strip!.x + strip!.width,
    );
  }
});
