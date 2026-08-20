import type { Locale } from "./locale";
import { en } from "./messages/en";
import { es } from "./messages/es";

export type MessageKey = keyof typeof en;

const catalogs: Record<Locale, Record<MessageKey, string>> = { en, es };

/** Replace `{name}` placeholders in a translated string. */
function format(
  template: string,
  params?: Record<string, string | number>,
): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_, key: string) =>
    String(params[key] ?? `{${key}}`),
  );
}

export function translate(
  locale: Locale,
  key: MessageKey,
  params?: Record<string, string | number>,
): string {
  return format(catalogs[locale][key], params);
}

export type TranslateFn = (
  key: MessageKey,
  params?: Record<string, string | number>,
) => string;
