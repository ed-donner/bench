import { createContext } from "react";
import type { TranslateFn } from "./i18n";
import type { Locale } from "./locale";

export interface LocaleContextValue {
  locale: Locale;
  t: TranslateFn;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
}

export const LocaleContext = createContext<LocaleContextValue | null>(null);
