import type { Locale } from "../../shared/locales";
import { grooveEn } from "./en";
import { grooveHi } from "./hi";

export const grooveMessages: Record<Locale, typeof grooveEn> = {
  en: grooveEn,
  hi: grooveHi,
};
