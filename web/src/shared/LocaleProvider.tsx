import { useCallback, useMemo, useState, type ReactNode } from "react";
import { translate, type MessageKey, type TranslateFn } from "./i18n";
import { LocaleContext } from "./localeContext";
import {
  currentLocale,
  setLocale as persistLocale,
  toggleLocale as flipLocale,
  type Locale,
} from "./locale";

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(currentLocale);

  const setLocale = useCallback((next: Locale) => {
    persistLocale(next);
    setLocaleState(next);
  }, []);

  const toggleLocale = useCallback(() => {
    setLocaleState(flipLocale());
  }, []);

  const t = useCallback<TranslateFn>(
    (key: MessageKey, params) => translate(locale, key, params),
    [locale],
  );

  const value = useMemo(
    () => ({ locale, t, setLocale, toggleLocale }),
    [locale, t, setLocale, toggleLocale],
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}
