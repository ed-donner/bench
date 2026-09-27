/** The strip's and the launcher's text. Each app keeps its own catalogs beside its own code. */
import { makeT } from "./i18n";
import en from "./locales/en.json";
import es from "./locales/es.json";

export const { useT } = makeT({ en, es });
