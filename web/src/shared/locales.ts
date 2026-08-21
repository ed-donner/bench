/** Supported locales. Add a language here, its catalog, and shared nav strings. */
export const LOCALES = ["en", "hi"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

/** BCP 47 tags passed to Intl formatters per locale. */
const INTL_TAGS: Record<Locale, string> = {
  en: "en-US",
  hi: "hi-IN",
};

export function intlTag(locale: Locale): string {
  return INTL_TAGS[locale];
}

export function nextLocale(current: Locale): Locale {
  const index = LOCALES.indexOf(current);
  return LOCALES[(index + 1) % LOCALES.length];
}

export function parseLocale(stored: string | null): Locale {
  return stored === "hi" ? "hi" : DEFAULT_LOCALE;
}

export type Translate = (
  key: string,
  vars?: Record<string, string | number>,
) => string;
