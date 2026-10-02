import type { Locale } from "../../shared/locales";
import type { Messages } from "../../shared/i18n";
import { spaceEn } from "./en";
import { spaceHi } from "./hi";

export const spaceMessages: Record<Locale, Messages> = {
  en: spaceEn,
  hi: spaceHi,
};
