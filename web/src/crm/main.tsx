import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import App from "./App";
import { LocaleProvider } from "../shared/LocaleProvider";
import { initLocale } from "../shared/locale";
import { initTheme } from "../shared/theme";
import "./styles.css";

initTheme();
initLocale();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <LocaleProvider>
      <BrowserRouter basename="/crm">
        <App />
      </BrowserRouter>
    </LocaleProvider>
  </StrictMode>,
);
