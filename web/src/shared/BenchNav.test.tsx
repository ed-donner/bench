import { describe, expect, it, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LocaleProvider } from "./LocaleProvider";
import BenchNav from "./BenchNav";

const empty = { en: {}, hi: {} };

function renderNav(active: "home" | "crm" | "space" | "rolodex" | "groove") {
  return render(
    <LocaleProvider messages={empty}>
      <BenchNav active={active} />
    </LocaleProvider>,
  );
}

const nav = () => within(screen.getByRole("navigation", { name: "Primary" }));

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
      screen.getByRole("button", { name: /Switch to dark|डार्क मोड/ }),
    );
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(localStorage.getItem("bench.theme")).toBe("dark");

    await userEvent.click(
      screen.getByRole("button", { name: /Switch to light|लाइट मोड/ }),
    );
    expect(document.documentElement.dataset.theme).toBe("light");
    expect(localStorage.getItem("bench.theme")).toBe("light");
  });

  it("toggles the locale and remembers the choice", async () => {
    renderNav("crm");
    expect(document.documentElement.lang).toBe("en");
    await userEvent.click(
      screen.getByRole("button", { name: /Switch to Hindi|हिंदी में/ }),
    );
    expect(document.documentElement.lang).toBe("hi");
    expect(localStorage.getItem("bench.locale")).toBe("hi");
    expect(nav().getByRole("link", { name: /होम/ })).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole("button", { name: /Switch to English|अंग्रेज़ी में/ }),
    );
    expect(document.documentElement.lang).toBe("en");
    expect(localStorage.getItem("bench.locale")).toBe("en");
  });
});
