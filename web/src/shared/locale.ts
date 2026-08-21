import {
  DEFAULT_LOCALE,
  nextLocale,
  parseLocale,
  type Locale,
} from "./locales";

const KEY = "bench.locale";

export function currentLocale(): Locale {
  return document.documentElement.lang === "hi" ? "hi" : DEFAULT_LOCALE;
}

export function initLocale(): void {
  document.documentElement.lang = parseLocale(localStorage.getItem(KEY));
}

export function setLocale(next: Locale): Locale {
  document.documentElement.lang = next;
  localStorage.setItem(KEY, next);
  return next;
}

export function toggleLocale(): Locale {
  return setLocale(nextLocale(currentLocale()));
}
