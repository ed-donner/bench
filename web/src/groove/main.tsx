import { createRoot } from "react-dom/client";
import App from "./App";
import { LocaleProvider } from "../shared/LocaleProvider";
import { initLocale } from "../shared/locale";
import { initTheme } from "../shared/theme";
import { grooveMessages } from "./i18n";
import "./styles.css";

initTheme();
initLocale();

createRoot(document.getElementById("root")!).render(
  <LocaleProvider messages={grooveMessages}>
    <App />
  </LocaleProvider>,
);
