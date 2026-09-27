/** Every Rolodex screen and form in Spanish, scanned for English the catalogs should have covered. */
import { test, expect } from "../fixtures";
import type { Page } from "@playwright/test";
import { expectNoEnglish, inSpanish } from "./leaks";

test.beforeEach(async ({ page }) => {
  await inSpanish(page);
});

/** Maya's seeded gift idea happens to contain the gift form's English placeholder. */
const MAYA_DATA = [/Ceramic ramen bowl set from the Lisbon potters/];

const openMaya = async (page: Page) => {
  await page.goto("/rolodex/people");
  await page.getByPlaceholder(/Buscar por nombre/).fill("Maya");
  await page.getByRole("row").filter({ hasText: "Maya Chen" }).click();
  await expect(page.getByRole("heading", { name: "Maya Chen" })).toBeVisible();
};

/** Close whatever modal is open, then check it went. */
const closeModal = async (page: Page) => {
  await page.getByRole("button", { name: "Cerrar" }).click();
  await expect(page.getByRole("dialog")).toBeHidden();
};

test("the five sections", async ({ page }) => {
  await page.goto("/rolodex/");
  await expect(page.getByRole("heading", { name: "Hoy" })).toBeVisible();
  await expect(page.getByText("A quién contactar")).toBeVisible();
  await expect(
    page.getByText("Interacciones registradas por mes"),
  ).toBeVisible();
  await expectNoEnglish(page, "rolodex");

  await page.getByRole("link", { name: "Personas" }).click();
  await expect(
    page.getByRole("columnheader", { name: /Último contacto/ }),
  ).toBeVisible();
  await expect(page.getByRole("row").nth(1)).toBeVisible();
  await expectNoEnglish(page, "rolodex");

  await page.getByRole("link", { name: "Círculos" }).click();
  await expect(
    page
      .getByText("Suelta a alguien aquí")
      .or(page.locator(".person-card").first()),
  ).toBeVisible();
  await expectNoEnglish(page, "rolodex");

  await page.getByRole("link", { name: "Calendario" }).click();
  await expect(page.getByText("Próximamente: 30 días")).toBeVisible();
  // react-calendar names the weekdays from its locale prop.
  await expect(
    page.locator(".react-calendar__month-view__weekdays"),
  ).toContainText(/lun/i);
  await expectNoEnglish(page, "rolodex");

  await page.getByRole("link", { name: "Cronología" }).click();
  await expect(page.getByText(/entradas de todo el mundo/)).toBeVisible();
  await expectNoEnglish(page, "rolodex");
});

test("a person's page and every form on it", async ({ page }) => {
  await openMaya(page);
  await expect(page.getByRole("heading", { name: "Detalles" })).toBeVisible();
  await expectNoEnglish(page, "rolodex", MAYA_DATA);

  for (const [button, title] of [
    ["Registrar interacción", /Registrar una interacción/],
    ["Editar", /Editar a Maya Chen/],
    ["Añadir dato", /Añadir un dato/],
    ["Añadir noticia", /Anotar noticias/],
    ["Añadir fecha", /Añadir una fecha importante/],
    ["Añadir recordatorio", /Crear un recordatorio/],
    ["Añadir regalo", /Añadir un regalo/],
    ["Añadir conexión", /Conectar a Maya/],
  ] as const) {
    await page.getByRole("button", { name: button, exact: true }).click();
    await expect(
      page.getByRole("dialog").getByRole("heading", { name: title }),
    ).toBeVisible();
    await expectNoEnglish(page, "rolodex", MAYA_DATA);
    await closeModal(page);
  }
});

test("the people table's own modals", async ({ page }) => {
  await page.goto("/rolodex/people");
  await page.getByRole("button", { name: "Añadir persona" }).click();
  await expect(
    page.getByRole("heading", { name: "Añadir una persona" }),
  ).toBeVisible();
  await expectNoEnglish(page, "rolodex");
  await closeModal(page);

  await page.getByRole("button", { name: "Importar" }).click();
  await expect(page.getByText("Elige un archivo .csv o .vcf")).toBeVisible();
  await expectNoEnglish(page, "rolodex");
  await closeModal(page);

  await page.getByRole("row").nth(1).hover();
  await page.getByRole("row").nth(1).getByTitle("Eliminar").click();
  await expect(page.getByRole("dialog", { name: /¿Eliminar a/ })).toBeVisible();
  await expectNoEnglish(page, "rolodex");
  await page.getByRole("button", { name: "Cancelar" }).click();
});

test("logging a contact reads back in Spanish", async ({ page }) => {
  await page.goto("/rolodex/");
  await page
    .locator(".hero-row")
    .first()
    .getByRole("button", { name: "Registrar contacto" })
    .click();
  await page.getByRole("button", { name: "Encuentro" }).click();
  await page.getByRole("button", { name: "Guardar interacción" }).click();
  await expect(page.getByText(/El contador vuelve a empezar/)).toBeVisible();
  await expectNoEnglish(page, "rolodex");
});
