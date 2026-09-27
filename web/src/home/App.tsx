/** Launcher: one card per app. Plain anchors - each app is its own document. */
import BenchNav from "../shared/BenchNav";
import {
  IconCrm,
  IconGroove,
  IconRolodex,
  IconSpace,
} from "../shared/AppIcons";
import { useT } from "../shared/strings";

/** The name is the app's own and stays English; everything said about it is in the catalogs. */
const APPS = [
  { key: "crm", href: "/crm/", name: "CRM", Icon: IconCrm },
  { key: "space", href: "/space/", name: "Space", Icon: IconSpace },
  { key: "rolodex", href: "/rolodex/", name: "Rolodex", Icon: IconRolodex },
  { key: "groove", href: "/groove/", name: "Groove", Icon: IconGroove },
] as const;

const FACTS = ["fact1", "fact2", "fact3"] as const;

export default function App() {
  const t = useT();
  return (
    <>
      <BenchNav active="home" />
      <div className="home">
        <header className="home-header">
          <p className="home-eyebrow">{t("home.eyebrow")}</p>
          <h1>{t("home.title")}</h1>
          <p className="home-lede">{t("home.lede")}</p>
        </header>

        <div className="home-grid">
          {APPS.map((app) => (
            <a className="home-card" href={app.href} key={app.href}>
              <app.Icon size={104} />
              <div className="home-card-body">
                <h2>{app.name}</h2>
                <p className="home-tagline">{t(`home.${app.key}.tagline`)}</p>
                <p className="home-detail">{t(`home.${app.key}.detail`)}</p>
                <ul className="home-facts">
                  {FACTS.map((f) => (
                    <li key={f}>{t(`home.${app.key}.${f}`)}</li>
                  ))}
                </ul>
              </div>
              <span className="home-open">
                {t("home.open")}
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M5 12h13M12 5.5 18.5 12 12 18.5" />
                </svg>
              </span>
            </a>
          ))}
        </div>

        <footer className="home-footer">
          <span>
            <strong>{"npm run dev"}</strong> · {t("home.footerRun")}
          </span>
          <span>{t("home.footerData")}</span>
        </footer>
      </div>
    </>
  );
}
