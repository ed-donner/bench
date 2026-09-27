/** Space's text. Pages, databases, properties and options are the user's and never pass through. */
import { makeT } from "../shared/i18n";
import en from "./locales/en.json";
import es from "./locales/es.json";

export const { t, useT } = makeT({ en, es });
