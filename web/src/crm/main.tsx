import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { LocaleProvider } from "../shared/LocaleProvider";
import { initLocale } from "../shared/locale";
import App from "./App";
import { crmMessages } from "./i18n";
import { initTheme } from "../shared/theme";
import "./styles.css";

initTheme();
initLocale();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <LocaleProvider messages={crmMessages}>
      <BrowserRouter basename="/crm">
        <App />
      </BrowserRouter>
    </LocaleProvider>
  </StrictMode>,
);
