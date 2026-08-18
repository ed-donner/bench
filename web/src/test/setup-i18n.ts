/**
 * i18next for the unit suite. Components read their strings through it, so without this every
 * label renders as its key. English, deliberately: the suites assert on English, and pinning it
 * here keeps them independent of the machine's language.
 */
import { initI18n } from "../shared/i18n";
import { crmResources } from "../crm/locales";
import { spaceResources } from "../space/locales";
import { rolodexResources } from "../rolodex/locales";
import { grooveResources } from "../groove/locales";
import { homeResources } from "../home/locales";

localStorage.setItem("bench.lang", "en");
initI18n({
  en: {
    ...crmResources.en,
    ...spaceResources.en,
    ...rolodexResources.en,
    ...grooveResources.en,
    ...homeResources.en,
  },
  es: {
    ...crmResources.es,
    ...spaceResources.es,
    ...rolodexResources.es,
    ...grooveResources.es,
    ...homeResources.es,
  },
});
