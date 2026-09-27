import { describe, expect, it, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import BenchNav from "./BenchNav";

const nav = () => within(screen.getByRole("navigation", { name: "Primary" }));

beforeEach(() => {
  localStorage.clear();
  delete document.documentElement.dataset.theme;
});

describe("BenchNav", () => {
  it("offers the launcher and all four apps, in order", () => {
    render(<BenchNav active="crm" />);
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
    render(<BenchNav active="space" />);
    const current = nav()
      .getAllByRole("link")
      .filter((link) => link.getAttribute("aria-current") === "page");
    expect(current.map((link) => link.textContent)).toEqual(["Space"]);
  });

  it("names the project", () => {
    render(<BenchNav active="home" />);
    expect(screen.getByText("Bench")).toBeInTheDocument();
  });

  it("toggles the theme for every app and remembers the choice", async () => {
    render(<BenchNav active="rolodex" />);
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

  it("switches the language both ways, in place, and remembers it", async () => {
    render(<BenchNav active="crm" />);
    await userEvent.click(
      screen.getByRole("button", { name: "Switch to Spanish" }),
    );
    expect(localStorage.getItem("bench.lang")).toBe("es");
    expect(document.documentElement.lang).toBe("es");
    expect(
      screen.getByRole("navigation", { name: "Principal" }),
    ).toHaveTextContent("Inicio");
    expect(
      screen.getByRole("button", { name: /Cambiar a modo (claro|oscuro)/ }),
    ).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole("button", { name: "Cambiar a inglés" }),
    );
    expect(localStorage.getItem("bench.lang")).toBe("en");
    expect(nav().getAllByRole("link")[0]).toHaveTextContent("Home");
  });

  it("keeps the app names as they are in both languages", async () => {
    render(<BenchNav active="crm" />);
    await userEvent.click(
      screen.getByRole("button", { name: "Switch to Spanish" }),
    );
    expect(
      within(screen.getByRole("navigation", { name: "Principal" }))
        .getAllByRole("link")
        .map((link) => link.textContent),
    ).toEqual(["Inicio", "CRM", "Space", "Rolodex", "Groove"]);
  });
});
