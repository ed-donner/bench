import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import App from "./App";
import { initTheme } from "../shared/theme";
import { initI18n } from "../shared/i18n";
import { spaceResources } from "./locales";
import "./styles.css";

initTheme();
initI18n(spaceResources);

createRoot(document.getElementById("root")!).render(
  <BrowserRouter basename="/space">
    <App />
  </BrowserRouter>,
);
