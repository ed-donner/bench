import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import App from "./App";
import { LocaleProvider } from "../shared/LocaleContext";
import { initLocale } from "../shared/locale";
import { initTheme } from "../shared/theme";
import "./styles.css";

initTheme();
initLocale();

createRoot(document.getElementById("root")!).render(
  <LocaleProvider>
    <BrowserRouter basename="/rolodex">
      <App />
    </BrowserRouter>
  </LocaleProvider>,
);
