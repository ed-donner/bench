import { describe, expect, it, beforeEach, vi } from "vitest";
import { currentLocale, initLocale, setLocale, toggleLocale } from "./locale";

beforeEach(() => {
  localStorage.clear();
  document.documentElement.lang = "en";
});

describe("locale", () => {
  it("defaults to English when storage is empty and the browser is English", () => {
    vi.stubGlobal("navigator", { language: "en-US" });
    initLocale();
    expect(currentLocale()).toBe("en");
    expect(document.documentElement.lang).toBe("en");
  });

  it("follows a Spanish browser on first visit", () => {
    vi.stubGlobal("navigator", { language: "es-MX" });
    initLocale();
    expect(currentLocale()).toBe("es");
    expect(document.documentElement.lang).toBe("es");
  });

  it("restores a stored preference over the browser default", () => {
    localStorage.setItem("bench.locale", "es");
    vi.stubGlobal("navigator", { language: "en-US" });
    initLocale();
    expect(currentLocale()).toBe("es");
  });

  it("persists toggles in localStorage", () => {
    initLocale();
    expect(toggleLocale()).toBe("es");
    expect(localStorage.getItem("bench.locale")).toBe("es");
    expect(toggleLocale()).toBe("en");
    expect(localStorage.getItem("bench.locale")).toBe("en");
  });

  it("dispatches an event when the locale changes", () => {
    initLocale();
    const handler = vi.fn();
    window.addEventListener("bench:locale", handler);
    setLocale("es");
    expect(handler).toHaveBeenCalled();
    window.removeEventListener("bench:locale", handler);
  });
});
