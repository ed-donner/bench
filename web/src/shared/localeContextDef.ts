import { createContext } from "react";
import type { Locale } from "./locale";

export interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  reseeded: boolean;
}

export const LocaleContext = createContext<LocaleContextValue | null>(null);
