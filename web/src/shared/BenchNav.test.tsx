import { describe, expect, it, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import BenchNav from "./BenchNav";
import { LocaleProvider } from "./LocaleProvider";

const nav = () => within(screen.getByRole("navigation", { name: "Primary" }));

function renderNav(active: "home" | "crm" | "space" | "rolodex" | "groove") {
  render(
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
    await userEvent.click(
      screen.getByRole("button", { name: /Switch to (light|dark)/ }),
    );
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(localStorage.getItem("bench.theme")).toBe("dark");

    await userEvent.click(
      screen.getByRole("button", { name: /Switch to (light|dark)/ }),
    );
    expect(document.documentElement.dataset.theme).toBe("light");
    expect(localStorage.getItem("bench.theme")).toBe("light");
  });

  it("toggles the locale and remembers the choice", async () => {
    renderNav("crm");
    const locale = screen.getByRole("button", { name: "Switch to Spanish" });
    expect(locale).toHaveTextContent("ES");
    await userEvent.click(locale);
    expect(document.documentElement.lang).toBe("es");
    expect(localStorage.getItem("bench.locale")).toBe("es");
    expect(
      screen.getByRole("button", {
        name: /Switch to English|Cambiar a inglés/i,
      }),
    ).toHaveTextContent("EN");
  });
});
