import type { Messages } from "./en";
import { en } from "./en";
import { es } from "./es";

export type Locale = "en" | "es";
export type { Messages, Namespace, MessageKey } from "./en";

const catalogs: Record<Locale, Messages> = { en, es };

export function translate(
  locale: Locale,
  namespace: keyof Messages,
  key: string,
): string {
  const table = catalogs[locale][namespace] as Record<
    string,
    string | undefined
  >;
  const fallback = catalogs.en[namespace] as Record<string, string | undefined>;
  return table[key] ?? fallback[key] ?? key;
}

/** Replace {name} placeholders in a template string. */
export function interpolate(
  template: string,
  vars: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (_, k: string) =>
    String(vars[k] ?? ""),
  );
}
