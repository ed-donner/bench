import type { Locale } from "./locales";

export type Messages = Record<string, string>;

/** Replace {{name}} placeholders in a translated string. */
function interpolate(
  template: string,
  vars?: Record<string, string | number>,
): string {
  if (!vars) return template;
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) =>
    String(vars[key] ?? ""),
  );
}

function messageFor(
  catalog: Record<Locale, Messages>,
  locale: Locale,
  key: string,
): string {
  if (key in catalog[locale]) return catalog[locale][key];
  if (key in catalog.en) return catalog.en[key];
  return key;
}

export function createT(catalog: Record<Locale, Messages>) {
  return (
    locale: Locale,
    key: string,
    vars?: Record<string, string | number>,
  ): string => interpolate(messageFor(catalog, locale, key), vars);
}

export function mergeMessages(
  ...parts: Record<Locale, Messages>[]
): Record<Locale, Messages> {
  const en: Messages = {};
  const hi: Messages = {};
  for (const part of parts) {
    Object.assign(en, part.en);
    Object.assign(hi, part.hi);
  }
  return { en, hi };
}
