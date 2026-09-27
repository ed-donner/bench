/** Every CRM screen and form in Spanish, scanned for English the catalogs should have covered. */
import { test, expect } from "../fixtures";
import { json, type Deal } from "../api";
import { expectNoEnglish, inSpanish } from "./leaks";

test.beforeEach(async ({ page }) => {
  await inSpanish(page);
});

test("the five sections", async ({ page }) => {
  await page.goto("/crm/");
  await expect(page.getByRole("heading", { name: "Panel" })).toBeVisible();
  await expect(page.getByTestId("dash-total")).toContainText("US$");
  await expect(page.getByText("Embudo de ingresos")).toBeVisible();
  await expectNoEnglish(page, "crm");

  for (const [link, heading] of [
    ["Organizaciones", "Organizaciones"],
    ["Contactos", "Contactos"],
    ["Negocios", "Negocios"],
  ]) {
    await page.getByRole("link", { name: link }).click();
    await expect(page.getByRole("heading", { name: heading })).toBeVisible();
    await expect(page.getByRole("row").nth(1)).toBeVisible();
    await expectNoEnglish(page, "crm");
  }

  await page.getByRole("link", { name: "Embudo" }).click();
  for (const stage of [
    "Nuevo",
    "Cualificado",
    "Propuesta",
    "Negociación",
    "Ganado",
    "Perdido",
  ])
    await expect(page.locator(".col-title", { hasText: stage })).toBeVisible();
  await expectNoEnglish(page, "crm");
});

test("each detail page and every form", async ({ page }) => {
  for (const [list, openButton, formTitle] of [
    ["/crm/organizations", "Añadir organización", "Añadir organización"],
    ["/crm/contacts", "Añadir contacto", "Añadir contacto"],
    ["/crm/deals", "Añadir negocio", "Añadir negocio"],
  ]) {
    await page.goto(list);
    await page.getByRole("button", { name: openButton }).click();
    await expect(page.getByRole("dialog", { name: formTitle })).toBeVisible();
    await expectNoEnglish(page, "crm");
    await page.getByRole("button", { name: "Cancelar" }).click();

    await page.getByRole("row").nth(1).click();
    await expect(page.getByRole("heading", { name: "Detalles" })).toBeVisible();
    await expectNoEnglish(page, "crm");

    await page.getByRole("button", { name: "Editar" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expectNoEnglish(page, "crm");
    await page.getByRole("button", { name: "Cancelar" }).click();

    await page.getByRole("button", { name: "Eliminar" }).click();
    await expect(page.getByRole("dialog", { name: /Eliminar/ })).toBeVisible();
    await expectNoEnglish(page, "crm");
    await page.getByRole("button", { name: "Cancelar" }).click();
  }

  await page.getByRole("button", { name: "Registrar actividad" }).click();
  await expect(
    page.getByRole("dialog", { name: "Registrar actividad" }),
  ).toBeVisible();
  await expectNoEnglish(page, "crm");
});

test("the pipeline's keyboard drag works and speaks Spanish", async ({
  page,
  baseURL,
}) => {
  await page.goto("/crm/pipeline");
  const deals = await json<Deal[]>(
    await page.request.get(`${baseURL}/api/crm/deals`),
  );
  const deal = deals.find((d) => d.stage === "New")!;

  const card = page.getByRole("button", { name: new RegExp(`^${deal.name}`) });
  await expect(card).toHaveAttribute("aria-describedby", /.+/);
  const instructions = await page
    .locator(`#${await card.getAttribute("aria-describedby")}`)
    .textContent();
  expect(instructions).toContain("Pulsa Espacio");

  await card.focus();
  await page.keyboard.press("Space");
  const live = page.locator("[aria-live]");
  await expect(live).toContainText(`Has levantado ${deal.name} desde Nuevo`);
  await page.keyboard.press("ArrowRight");
  await expect(live).toContainText("Moviendo a Cualificado");
  await page.keyboard.press("Space");
  await expect(live).toContainText(`${deal.name} soltado en Cualificado`);

  await expect
    .poll(async () => {
      const after = await json<Deal[]>(
        await page.request.get(`${baseURL}/api/crm/deals`),
      );
      return after.find((d) => d.id === deal.id)!.stage;
    })
    .toBe("Qualified");
});
