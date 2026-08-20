import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  currentLocale,
  LOCALE_EVENT,
  setLocale as persistLocale,
  syncLocaleWithServer,
  toggleLocale as flipLocale,
  type Locale,
} from "./locale";
import { LocaleContext } from "./localeContextDef";

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(currentLocale);
  const [reseeded, setReseeded] = useState(false);

  useEffect(() => {
    const onChange = (e: Event) => {
      setLocaleState((e as CustomEvent<Locale>).detail);
    };
    window.addEventListener(LOCALE_EVENT, onChange);
    return () => window.removeEventListener(LOCALE_EVENT, onChange);
  }, []);

  const setLocale = useCallback((next: Locale) => {
    persistLocale(next);
    setLocaleState(next);
    void syncLocaleWithServer(next).then(({ reseeded: did }) => {
      setReseeded(did);
      if (did) window.location.reload();
    });
  }, []);

  const toggleLocale = useCallback(() => {
    const next = flipLocale();
    setLocaleState(next);
    void syncLocaleWithServer(next).then(({ reseeded: did }) => {
      setReseeded(did);
      if (did) window.location.reload();
    });
  }, []);

  const value = useMemo(
    () => ({ locale, setLocale, toggleLocale, reseeded }),
    [locale, setLocale, toggleLocale, reseeded],
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}
