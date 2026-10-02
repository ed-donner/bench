import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import App from "./App";
import { LocaleProvider } from "../shared/LocaleProvider";
import { initLocale } from "../shared/locale";
import { initTheme } from "../shared/theme";
import { spaceMessages } from "./i18n";
import "./styles.css";

initTheme();
initLocale();

createRoot(document.getElementById("root")!).render(
  <LocaleProvider messages={spaceMessages}>
    <BrowserRouter basename="/space">
      <App />
    </BrowserRouter>
  </LocaleProvider>,
);
