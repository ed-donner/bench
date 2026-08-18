import {
  describe,
  expect,
  it,
  afterAll,
  beforeEach,
  afterEach,
  vi,
} from "vitest";
import { currentLang, initI18n, locale, toggleLang } from "./i18n";

const bundle = {
  en: { probe: { hello: "Hello", count_one: "{{count}} thing" } },
  es: { probe: { hello: "Hola", count_one: "{{count}} cosa" } },
};

// jsdom declares location.reload non-configurable, so the whole location object is swapped
// rather than the one method spied on.
const realLocation = window.location;
const reload = vi.fn();
Object.defineProperty(window, "location", {
  configurable: true,
  value: { reload },
});

afterAll(() => {
  Object.defineProperty(window, "location", {
    configurable: true,
    value: realLocation,
  });
});

beforeEach(() => {
  localStorage.clear();
  reload.mockClear();
});

afterEach(() => {
  // Put the suite-wide instance back, since these tests re-initialise it.
  localStorage.setItem("bench.lang", "en");
});

describe("initI18n", () => {
  it("follows the stored choice", () => {
    localStorage.setItem("bench.lang", "es");
    initI18n(bundle);
    expect(currentLang()).toBe("es");
  });

  it("follows the browser on a first visit, and only for Spanish", () => {
    vi.spyOn(navigator, "language", "get").mockReturnValue("es-419");
    initI18n(bundle);
    expect(currentLang()).toBe("es");

    vi.spyOn(navigator, "language", "get").mockReturnValue("fr-FR");
    initI18n(bundle);
    expect(currentLang()).toBe("en");
  });

  it("ignores a stored value that is not a language it has", () => {
    localStorage.setItem("bench.lang", "de");
    initI18n(bundle);
    expect(currentLang()).toBe("en");
  });

  it("tells the document which language it is in", () => {
    localStorage.setItem("bench.lang", "es");
    initI18n(bundle);
    expect(document.documentElement.lang).toBe("es");
  });
});

describe("locale", () => {
  it("maps the language onto a tag Intl and date-fns understand", () => {
    initI18n(bundle);
    expect(locale()).toBe("en-US");
    localStorage.setItem("bench.lang", "es");
    initI18n(bundle);
    expect(locale()).toBe("es-ES");
  });
});

describe("toggleLang", () => {
  it("stores the other language and reloads, since labels are read once", () => {
    initI18n(bundle);
    toggleLang();
    expect(localStorage.getItem("bench.lang")).toBe("es");
    expect(reload).toHaveBeenCalledOnce();

    initI18n(bundle);
    toggleLang();
    expect(localStorage.getItem("bench.lang")).toBe("en");
  });
});
