import { describe, expect, it, beforeEach } from "vitest";
import { DEFAULT_LOCALE, LOCALES, nextLocale, parseLocale } from "./locales";
import { currentLocale, initLocale, setLocale, toggleLocale } from "./locale";

beforeEach(() => {
  localStorage.clear();
  document.documentElement.lang = "en";
});

describe("locales", () => {
  it("cycles through every supported locale", () => {
    expect(nextLocale("en")).toBe("hi");
    expect(nextLocale("hi")).toBe("en");
    expect(LOCALES).toEqual(["en", "hi"]);
  });

  it("parses stored values safely", () => {
    expect(parseLocale(null)).toBe(DEFAULT_LOCALE);
    expect(parseLocale("hi")).toBe("hi");
    expect(parseLocale("fr")).toBe(DEFAULT_LOCALE);
  });
});

describe("locale persistence", () => {
  it("defaults to English", () => {
    initLocale();
    expect(currentLocale()).toBe("en");
  });

  it("reads a stored Hindi choice", () => {
    localStorage.setItem("bench.locale", "hi");
    initLocale();
    expect(currentLocale()).toBe("hi");
  });

  it("toggles and persists", () => {
    initLocale();
    expect(toggleLocale()).toBe("hi");
    expect(localStorage.getItem("bench.locale")).toBe("hi");
    expect(setLocale("en")).toBe("en");
    expect(document.documentElement.lang).toBe("en");
  });
});
