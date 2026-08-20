import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { LocaleProvider } from "../shared/LocaleContext";
import App from "./App";

const APPS = [
  ["CRM", "/crm/", "Deals, and the people behind them"],
  ["Space", "/space/", "Everything you know, in one place"],
  ["Rolodex", "/rolodex/", "The people in your life, kept close"],
  ["Groove", "/groove/", "A groovebox in the browser"],
];

function renderApp() {
  return render(
    <LocaleProvider>
      <App />
    </LocaleProvider>,
  );
}

describe("launcher", () => {
  it("links each app card at its own document root", () => {
    renderApp();
    for (const [name, href] of APPS) {
      expect(
        screen.getByRole("heading", { name }).closest("a")!,
      ).toHaveAttribute("href", href);
    }
  });

  it("marks itself as the current page in the nav", () => {
    renderApp();
    expect(
      within(screen.getByRole("navigation", { name: "Primary" })).getByRole(
        "link",
        { name: "Home" },
      ),
    ).toHaveAttribute("aria-current", "page");
  });

  it("names every app and describes what it is", () => {
    renderApp();
    for (const [name, , tagline] of APPS) {
      expect(screen.getByRole("heading", { name })).toBeInTheDocument();
      expect(screen.getByText(tagline)).toBeInTheDocument();
    }
  });
});
