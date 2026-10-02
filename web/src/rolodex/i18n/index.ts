import type { Locale } from "../../shared/locales";
import type { Messages } from "../../shared/i18n";
import { rolodexEn } from "./en";
import { rolodexHi } from "./hi";

export const rolodexMessages: Record<Locale, Messages> = {
  en: rolodexEn,
  hi: rolodexHi,
};
