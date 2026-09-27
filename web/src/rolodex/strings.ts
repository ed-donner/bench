/** Rolodex's text, and the date-fns locale that goes with it. */
import { enUS, es as esDates } from "date-fns/locale";
import { currentLang, makeT } from "../shared/i18n";
import en from "./locales/en.json";
import es from "./locales/es.json";

export const { t, useT } = makeT({ en, es });

/** For every date-fns format call, so month and weekday names follow the language. */
export function dateLocale() {
  return currentLang() === "es" ? esDates : enUS;
}
