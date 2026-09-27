/**
 * Every Space screen and menu in Spanish. The page bodies, database names, property names and
 * options are the seed's own English, so the leak scan only ever looks for the chrome's.
 */
import { test, expect } from "../fixtures";
import type { Page } from "@playwright/test";
import { expectNoEnglish, inSpanish } from "./leaks";

/** The seed's first page is called "Home", which is also the strip's English for the launcher. */
const scan = (page: Page) => expectNoEnglish(page, "space", ["Home"]);

test.beforeEach(async ({ page }) => {
  await inSpanish(page);
});

async function openTripPlanner(page: Page) {
  await page.goto("/space/");
  await page.getByRole("button", { name: "Expandir Travel" }).click();
  await page.getByRole("treeitem", { name: /Trip Planner/ }).click();
  await expect(page.getByRole("tab", { name: "Tabla" })).toBeVisible();
}

/** Open a toolbar popover, scan the page with it open, then click away. */
async function scanPopover(page: Page, button: string, dialog: string) {
  await page.getByRole("button", { name: new RegExp(`^${button}`) }).click();
  await expect(page.getByRole("dialog", { name: dialog })).toBeVisible();
  await scan(page);
  await page.locator(".menu-overlay").click({ position: { x: 5, y: 5 } });
  await expect(page.getByRole("dialog", { name: dialog })).toBeHidden();
}

test("a page, its editor and the slash menu", async ({ page }) => {
  await page.goto("/space/");
  await expect(page.getByRole("tree", { name: "Páginas" })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Nueva página" }),
  ).toBeVisible();
  await expect(page.getByTestId("editor-body")).toBeVisible();
  await scan(page);

  await page.locator(".block-text").last().click();
  await page.keyboard.press("End");
  await page.keyboard.press("Enter");
  await page.keyboard.type("/");
  const menu = page.getByRole("listbox", { name: "Tipos de bloque" });
  await expect(
    menu.getByRole("option", { name: "Lista con viñetas" }),
  ).toBeVisible();
  await scan(page);

  // Filtering reads the Spanish name, so "/enca" finds the headings.
  await page.keyboard.type("enca");
  await expect(menu.getByRole("option")).toHaveText([
    "Encabezado 1",
    "Encabezado 2",
    "Encabezado 3",
  ]);
  await page.keyboard.press("Enter");
  await expect(page.locator(".block-text").last()).toHaveAttribute(
    "data-placeholder",
    "Encabezado 1",
  );
});

test("the search modal, the icon picker and a page's menu", async ({
  page,
}) => {
  await page.goto("/space/");
  await expect(page.getByTestId("editor-body")).toBeVisible();
  await page.keyboard.press("ControlOrMeta+k");
  const search = page.getByRole("dialog", { name: "Búsqueda rápida" });
  await expect(search).toBeVisible();
  await page.keyboard.type("japan");
  await expect(search.getByRole("option").first()).toBeVisible();
  await scan(page);
  await page.keyboard.type("zzzz");
  await expect(search.getByText(/No hay resultados para/)).toBeVisible();
  await page.keyboard.press("Escape");

  await page.getByRole("button", { name: "Cambiar icono" }).click();
  await expect(
    page.getByRole("dialog", { name: "Elige un icono" }),
  ).toBeVisible();
  await scan(page);
  await page.locator(".menu-overlay").click({ position: { x: 5, y: 5 } });

  const first = page.getByRole("treeitem").first();
  await first.hover();
  await first.getByRole("button", { name: /Opciones de la página/ }).click();
  await expect(
    page.getByRole("menuitem", { name: "Cambiar nombre" }),
  ).toBeVisible();
  await scan(page);
  await page.getByRole("menuitem", { name: "Eliminar" }).click();
  await expect(page.getByRole("dialog", { name: /¿Eliminar/ })).toBeVisible();
  await scan(page);
  await page.getByRole("button", { name: "Cancelar" }).click();
});

test("a database in its three views, with every toolbar panel", async ({
  page,
}) => {
  await openTripPlanner(page);
  await expect(
    page.getByRole("columnheader", { name: "Nombre" }),
  ).toBeVisible();
  await scan(page);

  await scanPopover(page, "Filtrar", "Filtros");
  await page.getByRole("button", { name: /^Filtrar/ }).click();
  await page.getByRole("button", { name: "+ Añadir filtro" }).click();
  await expect(page.getByLabel("Operador del filtro")).toContainText(
    "contiene",
  );
  await scan(page);
  await page.locator(".menu-overlay").click({ position: { x: 5, y: 5 } });

  await scanPopover(page, "Ordenar", "Ordenar");

  await page.getByRole("button", { name: "Añadir propiedad" }).click();
  await expect(
    page.getByRole("dialog", { name: "Nueva propiedad" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Selección múltiple" }),
  ).toBeVisible();
  await scan(page);
  await page.locator(".menu-overlay").click({ position: { x: 5, y: 5 } });

  await page.getByRole("tab", { name: "Tablero" }).click();
  await expect(page.getByTestId("board")).toBeVisible();
  await scan(page);
  await scanPopover(page, "Agrupar", "Agrupar por");

  await page.getByRole("tab", { name: "Lista" }).click();
  await expect(page.locator(".list-row").first()).toBeVisible();
  await scan(page);
});

test("a row opened as a page", async ({ page }) => {
  await openTripPlanner(page);
  const title = page.getByLabel(/^Título de la fila/).first();
  await title.hover();
  await page
    .getByRole("button", { name: /^Abrir / })
    .first()
    .click();
  await expect(page.locator(".row-breadcrumb")).toBeVisible();
  await scan(page);
});
