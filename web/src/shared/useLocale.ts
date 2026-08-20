import { useContext, useMemo } from "react";
import { currentLocale, type Locale } from "./locale";
import {
  interpolate,
  translate,
  type MessageKey,
  type Namespace,
} from "./locales";
import { LocaleContext, type LocaleContextValue } from "./localeContextDef";

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale requires LocaleProvider");
  return ctx;
}

export function useT<N extends Namespace>(namespace: N) {
  const { locale } = useLocale();
  return useMemo(() => {
    const lookup = (key: MessageKey<N>) => translate(locale, namespace, key);
    const i = (key: MessageKey<N>, vars: Record<string, string | number>) =>
      interpolate(lookup(key), vars);
    return Object.assign(lookup, { i });
  }, [locale, namespace]);
}

/** For components outside LocaleProvider (e.g. tests) or non-React code. */
export function t<N extends Namespace>(
  namespace: N,
  key: MessageKey<N>,
  locale: Locale = currentLocale(),
): string {
  return translate(locale, namespace, key);
}
