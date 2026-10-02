import { useCallback, useMemo, useState, type ReactNode } from "react";
import { createT, mergeMessages, type Messages } from "./i18n";
import {
  currentLocale,
  setLocale as persistLocale,
  toggleLocale as flipLocale,
} from "./locale";
import type { Locale } from "./locales";
import { LocaleContext } from "./useLocale";
import { sharedEn } from "./messages/shared.en";
import { sharedHi } from "./messages/shared.hi";

const shared = { en: sharedEn, hi: sharedHi };

/** Wrap each app root. Merges shared strings with the app's own catalog. */
export function LocaleProvider({
  messages,
  children,
}: {
  messages: Record<Locale, Messages>;
  children: ReactNode;
}) {
  const catalog = useMemo(() => mergeMessages(shared, messages), [messages]);
  const translate = useMemo(() => createT(catalog), [catalog]);
  const [locale, setLocaleState] = useState<Locale>(() => currentLocale());

  const setLocale = useCallback((next: Locale) => {
    persistLocale(next);
    setLocaleState(next);
  }, []);

  const toggleLocale = useCallback(() => {
    setLocale(flipLocale());
  }, [setLocale]);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) =>
      translate(locale, key, vars),
    [locale, translate],
  );

  const value = useMemo(
    () => ({ locale, setLocale, toggleLocale, t }),
    [locale, setLocale, toggleLocale, t],
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}
