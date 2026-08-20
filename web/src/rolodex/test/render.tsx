import type { ReactElement } from "react";
import { LocaleProvider } from "../../shared/LocaleProvider";
import { rolodexMessages } from "../i18n";

/** Wrap Rolodex UI under test with the app's i18n catalog (English by default). */
export function withLocale(ui: ReactElement): ReactElement {
  return <LocaleProvider messages={rolodexMessages}>{ui}</LocaleProvider>;
}
