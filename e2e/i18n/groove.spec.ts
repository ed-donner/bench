/** Groove in Spanish: the buttons and every tooltip translated, the legends left as printed. */
import { test, expect } from "../fixtures";
import { expectNoEnglish, inSpanish } from "./leaks";

test("the instrument's controls speak Spanish and its legends stay put", async ({
  page,
}) => {
  await inSpanish(page);
  await page.goto("/groove/");
  await expect(page.getByRole("button", { name: /TOCAR/ })).toBeVisible();
  await expect(page.getByText("MASTER FILTER")).toBeVisible();
  await expectNoEnglish(page, "groove");

  await page.getByRole("button", { name: /TOCAR/ }).click();
  await expect(page.getByRole("button", { name: /PARAR/ })).toBeVisible();
  await page.getByRole("button", { name: "KICK paso 2", exact: true }).click();
  await expect(page.getByRole("button", { name: "RESTAURAR" })).toBeEnabled();
  await expectNoEnglish(page, "groove");
  await page.getByRole("button", { name: /PARAR/ }).click();
});
