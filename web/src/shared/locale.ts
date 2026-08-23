/**
 * One locale across all four apps. Each is its own document, so the choice travels in
 * localStorage rather than in React state, and every entry point calls initLocale() before it
 * renders - set after the first paint, copy would flash the wrong language on every navigation.
 */
export type Locale = "en" | "es";

const KEY = "bench.locale";

export function currentLocale(): Locale {
  const stored = document.documentElement.lang;
  return stored === "es" ? "es" : "en";
}

/** English unless the user chose Spanish before. */
export function initLocale(): void {
  const stored = localStorage.getItem(KEY);
  const locale: Locale = stored === "es" ? "es" : "en";
  document.documentElement.lang = locale;
}

export function setLocale(locale: Locale): Locale {
  document.documentElement.lang = locale;
  localStorage.setItem(KEY, locale);
  return locale;
}

export function toggleLocale(): Locale {
  return setLocale(currentLocale() === "en" ? "es" : "en");
}
