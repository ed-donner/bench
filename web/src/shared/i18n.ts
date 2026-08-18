/**
 * One language across all four apps, the counterpart to theme.ts. Each app is its own document,
 * so the choice travels in localStorage rather than in React state, and every entry point calls
 * initI18n() with its own strings before it renders.
 *
 * Switching reloads the page. The apps hold their labels in module-level tables, and a module
 * body runs before main.tsx gets to call initI18n - so nothing here may be translated at import
 * time. Tables carry keys; t() is called where the label is rendered.
 */
import i18next, { type Resource } from "i18next";
import { initReactI18next } from "react-i18next";
import navEn from "./locales/en";
import navEs from "./locales/es";

export type Lang = "en" | "es";

const KEY = "bench.lang";

function stored(): Lang | null {
  const value = localStorage.getItem(KEY);
  return value === "en" || value === "es" ? value : null;
}

/** The stored choice, or the browser's language the first time you arrive. */
function chosen(): Lang {
  return stored() ?? (navigator.language.startsWith("es") ? "es" : "en");
}

export function currentLang(): Lang {
  return i18next.language === "es" ? "es" : "en";
}

/** "en-US" or "es-ES", for Intl and for date-fns. */
export function locale(): string {
  return currentLang() === "es" ? "es-ES" : "en-US";
}

/** Called by every entry point before it renders, with that app's own resource bundle. */
export function initI18n(app: Resource): void {
  const lng = chosen();
  void i18next.use(initReactI18next).init({
    lng,
    fallbackLng: "en",
    defaultNS: false,
    resources: {
      en: { nav: navEn, ...app.en },
      es: { nav: navEs, ...app.es },
    },
    // React escapes everything it renders, so i18next escaping again would double it.
    interpolation: { escapeValue: false },
    // A key with no entry renders as the key itself, which is easy to miss in a screenshot.
    // Under vitest it fails the test instead.
    saveMissing: import.meta.env.MODE === "test",
    missingKeyHandler: (_lngs, ns, key) => {
      throw new Error(`Missing translation: ${ns}:${key}`);
    },
  });
  document.documentElement.lang = lng;
}

/**
 * For modules that are not components - a formatter, a derived value. Inside a component use
 * useTranslation(). Namespace the key, since there is no default: t("crm:field.name").
 */
export function translate(key: string, vars?: Record<string, unknown>): string {
  return i18next.t(key, vars);
}

export function toggleLang(): void {
  localStorage.setItem(KEY, currentLang() === "es" ? "en" : "es");
  location.reload();
}
