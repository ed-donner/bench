import { describe, expect, it, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import BenchNav from "./BenchNav";
import { LocaleProvider } from "./LocaleContext";

const nav = () =>
  within(screen.getByRole("navigation", { name: /Primary|Principal/ }));

function renderNav(
  active: "home" | "crm" | "space" | "rolodex" | "groove" = "crm",
) {
  return render(
    <LocaleProvider>
      <BenchNav active={active} />
    </LocaleProvider>,
  );
}

beforeEach(() => {
  localStorage.clear();
  delete document.documentElement.dataset.theme;
  document.documentElement.lang = "en";
});

describe("BenchNav", () => {
  it("offers the launcher and all four apps, in order", () => {
    renderNav("crm");
    expect(
      nav()
        .getAllByRole("link")
        .map((link) => [link.textContent, link.getAttribute("href")]),
    ).toEqual([
      ["Home", "/"],
      ["CRM", "/crm/"],
      ["Space", "/space/"],
      ["Rolodex", "/rolodex/"],
      ["Groove", "/groove/"],
    ]);
  });

  it("marks only the app it is rendered in", () => {
    renderNav("space");
    const current = nav()
      .getAllByRole("link")
      .filter((link) => link.getAttribute("aria-current") === "page");
    expect(current.map((link) => link.textContent)).toEqual(["Space"]);
  });

  it("names the project", () => {
    renderNav("home");
    expect(screen.getByText("Bench")).toBeInTheDocument();
  });

  it("toggles the theme for every app and remembers the choice", async () => {
    renderNav("rolodex");
    const theme = screen.getByRole("button", {
      name: /Switch to dark|Cambiar a oscuro/,
    });
    await userEvent.click(theme);
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(localStorage.getItem("bench.theme")).toBe("dark");

    await userEvent.click(
      screen.getByRole("button", { name: /Switch to light|Cambiar a claro/ }),
    );
    expect(document.documentElement.dataset.theme).toBe("light");
    expect(localStorage.getItem("bench.theme")).toBe("light");
  });

  it("shows ES and switches the document language to Spanish", async () => {
    renderNav("crm");
    await userEvent.click(
      screen.getByRole("button", {
        name: /Switch to Spanish|Cambiar a español/,
      }),
    );
    expect(document.documentElement.lang).toBe("es");
    expect(localStorage.getItem("bench.locale")).toBe("es");
    await userEvent.click(
      screen.getByRole("button", {
        name: /Switch to English|Cambiar a inglés/,
      }),
    );
    expect(
      nav().getByRole("link", { name: /Inicio|Home/ }),
    ).toBeInTheDocument();
  });
});
