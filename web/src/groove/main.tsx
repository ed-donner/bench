import { createRoot } from "react-dom/client";
import App from "./App";
import { initTheme } from "../shared/theme";
import { initI18n } from "../shared/i18n";
import { grooveResources } from "./locales";
import "./styles.css";

initTheme();
initI18n(grooveResources);

createRoot(document.getElementById("root")!).render(<App />);
