import { describe, expect, it } from "vitest";
import { act, render, screen, within } from "@testing-library/react";
import App from "./App";
import { setLang } from "../shared/i18n";

const APPS = [
  ["CRM", "/crm/", "Deals, and the people behind them"],
  ["Space", "/space/", "Everything you know, in one place"],
  ["Rolodex", "/rolodex/", "The people in your life, kept close"],
  ["Groove", "/groove/", "A groovebox in the browser"],
];

describe("launcher", () => {
  it("links each app card at its own document root", () => {
    render(<App />);
    for (const [name, href] of APPS) {
      expect(
        screen.getByRole("heading", { name }).closest("a")!,
      ).toHaveAttribute("href", href);
    }
  });

  it("marks itself as the current page in the nav", () => {
    render(<App />);
    expect(
      within(screen.getByRole("navigation", { name: "Primary" })).getByRole(
        "link",
        { name: "Home" },
      ),
    ).toHaveAttribute("aria-current", "page");
  });

  it("names every app and describes what it is", () => {
    render(<App />);
    for (const [name, , tagline] of APPS) {
      expect(screen.getByRole("heading", { name })).toBeInTheDocument();
      expect(screen.getByText(tagline)).toBeInTheDocument();
    }
  });

  it("describes every app in Spanish, keeping their names", () => {
    render(<App />);
    act(() => setLang("es"));
    expect(
      screen.getByRole("heading", { name: "Rolodex" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Las personas de tu vida, siempre cerca"),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Abrir")).toHaveLength(4);
  });
});
