import { describe, expect, it, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import BenchNav from "./BenchNav";

const nav = () => within(screen.getByRole("navigation", { name: "Primary" }));

const themeButton = () =>
  screen.getByRole("button", { name: /Switch to (light|dark)/ });

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
    await userEvent.click(themeButton());
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(localStorage.getItem("bench.theme")).toBe("dark");

    await userEvent.click(themeButton());
    expect(document.documentElement.dataset.theme).toBe("light");
    expect(localStorage.getItem("bench.theme")).toBe("light");
  });

  // The theme button is found by a name of its own, because the language button sits beside it
  // and an unanchored /Switch to/ would match them both.
  it("offers the language switch beside the theme, naming what it goes to", () => {
    render(<BenchNav active="crm" />);
    const button = screen.getByRole("button", {
      name: "Switch language to Spanish",
    });
    expect(button).toHaveTextContent("ES");
    expect(themeButton()).toBeInTheDocument();
  });
});
