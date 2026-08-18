import { createRoot } from "react-dom/client";
import App from "./App";
import { initTheme } from "../shared/theme";
import { initI18n } from "../shared/i18n";
import { homeResources } from "./locales";
import "./styles.css";

initTheme();
initI18n(homeResources);

createRoot(document.getElementById("root")!).render(<App />);
