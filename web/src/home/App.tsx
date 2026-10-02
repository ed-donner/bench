/** Launcher: one card per app. Plain anchors - each app is its own document. */
import BenchNav from "../shared/BenchNav";
import { useLocale } from "../shared/useLocale";
import {
  IconCrm,
  IconGroove,
  IconRolodex,
  IconSpace,
} from "../shared/AppIcons";

interface AppCard {
  href: string;
  name: string;
  taglineKey: string;
  detailKey: string;
  factKeys: string[];
  Icon: (p: { size?: number }) => React.ReactElement;
}

const APPS: AppCard[] = [
  {
    href: "/crm/",
    name: "CRM",
    taglineKey: "home.crm.tagline",
    detailKey: "home.crm.detail",
    factKeys: ["home.crm.fact1", "home.crm.fact2", "home.crm.fact3"],
    Icon: IconCrm,
  },
  {
    href: "/space/",
    name: "Space",
    taglineKey: "home.space.tagline",
    detailKey: "home.space.detail",
    factKeys: ["home.space.fact1", "home.space.fact2", "home.space.fact3"],
    Icon: IconSpace,
  },
  {
    href: "/rolodex/",
    name: "Rolodex",
    taglineKey: "home.rolodex.tagline",
    detailKey: "home.rolodex.detail",
    factKeys: [
      "home.rolodex.fact1",
      "home.rolodex.fact2",
      "home.rolodex.fact3",
    ],
    Icon: IconRolodex,
  },
  {
    href: "/groove/",
    name: "Groove",
    taglineKey: "home.groove.tagline",
    detailKey: "home.groove.detail",
    factKeys: ["home.groove.fact1", "home.groove.fact2", "home.groove.fact3"],
    Icon: IconGroove,
  },
];

export default function App() {
  const { t } = useLocale();
  return (
    <>
      <BenchNav active="home" />
      <div className="home">
        <header className="home-header">
          <p className="home-eyebrow">{t("home.eyebrow")}</p>
          <h1>Bench</h1>
          <p className="home-lede">{t("home.lede")}</p>
        </header>

        <div className="home-grid">
          {APPS.map((app) => (
            <a className="home-card" href={app.href} key={app.href}>
              <app.Icon size={104} />
              <div className="home-card-body">
                <h2>{app.name}</h2>
                <p className="home-tagline">{t(app.taglineKey)}</p>
                <p className="home-detail">{t(app.detailKey)}</p>
                <ul className="home-facts">
                  {app.factKeys.map((key) => (
                    <li key={key}>{t(key)}</li>
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
            <strong>npm run dev</strong> · API on 8100, Vite on 8101
          </span>
          <span>{t("home.footerData")}</span>
        </footer>
      </div>
    </>
  );
}
