import { useContext } from "react";
import { translate, type TranslateFn } from "./i18n";
import { LocaleContext, type LocaleContextValue } from "./localeContext";

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}

export function useT(): TranslateFn {
  const ctx = useContext(LocaleContext);
  if (ctx) return ctx.t;
  // Unit tests render panels outside LocaleProvider; fall back to English.
  return (key, params) => translate("en", key, params);
}
