import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import App from "./App";
import { initTheme } from "../shared/theme";
import { initI18n } from "../shared/i18n";
import { crmResources } from "./locales";
import "./styles.css";

initTheme();
initI18n(crmResources);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter basename="/crm">
      <App />
    </BrowserRouter>
  </StrictMode>,
);
