import { describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import { currentLang, initLang, intlLocale, makeT, setLang } from "./i18n";

const { t, useT } = makeT({
  en: {
    greeting: "Hello, {name}",
    "items.one": "{count} item",
    "items.other": "{count} items",
  },
  es: {
    greeting: "Hola, {name}",
    "items.one": "{count} elemento",
    "items.other": "{count} elementos",
  },
});

function Greeting() {
  const tr = useT();
  return <p>{tr("greeting", { name: "Ada" })}</p>;
}

describe("initLang", () => {
  it("follows the browser on a first visit", () => {
    vi.spyOn(navigator, "language", "get").mockReturnValue("es-MX");
    initLang();
    expect(currentLang()).toBe("es");
    expect(document.documentElement.lang).toBe("es");
    vi.restoreAllMocks();
  });

  it("falls back to English for any other browser language", () => {
    vi.spyOn(navigator, "language", "get").mockReturnValue("fr-FR");
    initLang();
    expect(currentLang()).toBe("en");
    vi.restoreAllMocks();
  });

  it("prefers the stored choice over the browser", () => {
    localStorage.setItem("bench.lang", "es");
    initLang();
    expect(currentLang()).toBe("es");
  });

  it("ignores a stored value it does not know", () => {
    localStorage.setItem("bench.lang", "de");
    initLang();
    expect(currentLang()).toBe("en");
  });
});

describe("setLang", () => {
  it("remembers the choice and marks the document", () => {
    setLang("es");
    expect(localStorage.getItem("bench.lang")).toBe("es");
    expect(document.documentElement.lang).toBe("es");
    expect(intlLocale()).toBe("es");
    setLang("en");
    expect(intlLocale()).toBe("en-US");
  });
});

describe("makeT", () => {
  it("interpolates named values", () => {
    expect(t("greeting", { name: "Ada" })).toBe("Hello, Ada");
  });

  it("picks the plural form from count, per language", () => {
    expect(t("items", { count: 1 })).toBe("1 item");
    expect(t("items", { count: 3 })).toBe("3 items");
    setLang("es");
    expect(t("items", { count: 1 })).toBe("1 elemento");
    // Spanish's "many" form for a million falls back to "other".
    expect(t("items", { count: 1_000_000 })).toBe("1000000 elementos");
  });

  it("throws on a key neither catalog has, rather than rendering blank", () => {
    expect(() => t("missing" as "greeting")).toThrow(/missing/);
  });

  it("re-renders a component in place when the language switches", () => {
    render(<Greeting />);
    expect(screen.getByText("Hello, Ada")).toBeInTheDocument();
    act(() => setLang("es"));
    expect(screen.getByText("Hola, Ada")).toBeInTheDocument();
    act(() => setLang("en"));
    expect(screen.getByText("Hello, Ada")).toBeInTheDocument();
  });
});
