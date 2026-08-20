/**
 * One locale across all four apps. Each is its own document, so the choice travels in
 * localStorage rather than in React state, and every entry point calls initLocale() before it
 * renders.
 */
export type Locale = "en" | "es";

const KEY = "bench.locale";
export const LOCALE_EVENT = "bench:locale";

export function currentLocale(): Locale {
  return document.documentElement.lang === "es" ? "es" : "en";
}

function preferredLocale(): Locale {
  return navigator.language.toLowerCase().startsWith("es") ? "es" : "en";
}

/** The stored choice, or the browser language the first time you arrive. */
export function initLocale(): void {
  const stored = localStorage.getItem(KEY);
  const locale: Locale =
    stored === "en" || stored === "es" ? stored : preferredLocale();
  document.documentElement.lang = locale;
}

export function setLocale(locale: Locale): Locale {
  document.documentElement.lang = locale;
  localStorage.setItem(KEY, locale);
  window.dispatchEvent(new CustomEvent(LOCALE_EVENT, { detail: locale }));
  return locale;
}

export function toggleLocale(): Locale {
  const next: Locale = currentLocale() === "es" ? "en" : "es";
  return setLocale(next);
}

export async function syncLocaleWithServer(locale: Locale): Promise<{
  reseeded: boolean;
}> {
  const res = await fetch("/api/bench/locale", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Bench-Locale": locale },
    body: JSON.stringify({ locale }),
  });
  if (!res.ok) return { reseeded: false };
  return (await res.json()) as { reseeded: boolean };
}

/** Header value for API calls from any app. */
export function localeHeader(): Record<string, string> {
  return { "X-Bench-Locale": currentLocale() };
}
