import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import App from "./App";
import { initTheme } from "../shared/theme";
import { initLang } from "../shared/i18n";
import "./styles.css";

initTheme();
initLang();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter basename="/crm">
      <App />
    </BrowserRouter>
  </StrictMode>,
);
