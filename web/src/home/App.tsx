/** Launcher: one card per app. Plain anchors - each app is its own document. */
import BenchNav from "../shared/BenchNav";
import { useT } from "../shared/useLocale";
import {
  IconCrm,
  IconGroove,
  IconRolodex,
  IconSpace,
} from "../shared/AppIcons";
import type { MessageKey } from "../shared/i18n";

interface AppCard {
  href: string;
  nameKey: MessageKey;
  taglineKey: MessageKey;
  detailKey: MessageKey;
  factKeys: MessageKey[];
  Icon: (p: { size?: number }) => React.ReactElement;
}

const APPS: AppCard[] = [
  {
    href: "/crm/",
    nameKey: "home.app.crm.name",
    taglineKey: "home.app.crm.tagline",
    detailKey: "home.app.crm.detail",
    factKeys: [
      "home.app.crm.fact.pipeline",
      "home.app.crm.fact.dashboard",
      "home.app.crm.fact.activities",
    ],
    Icon: IconCrm,
  },
  {
    href: "/space/",
    nameKey: "home.app.space.name",
    taglineKey: "home.app.space.tagline",
    detailKey: "home.app.space.detail",
    factKeys: [
      "home.app.space.fact.pages",
      "home.app.space.fact.databases",
      "home.app.space.fact.search",
    ],
    Icon: IconSpace,
  },
  {
    href: "/rolodex/",
    nameKey: "home.app.rolodex.name",
    taglineKey: "home.app.rolodex.tagline",
    detailKey: "home.app.rolodex.detail",
    factKeys: [
      "home.app.rolodex.fact.checkins",
      "home.app.rolodex.fact.circles",
      "home.app.rolodex.fact.calendar",
    ],
    Icon: IconRolodex,
  },
  {
    href: "/groove/",
    nameKey: "home.app.groove.name",
    taglineKey: "home.app.groove.tagline",
    detailKey: "home.app.groove.detail",
    factKeys: [
      "home.app.groove.fact.units",
      "home.app.groove.fact.steps",
      "home.app.groove.fact.webAudio",
    ],
    Icon: IconGroove,
  },
];

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
                <h2>{t(app.nameKey)}</h2>
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
          <span>{t("home.footer.dev")}</span>
          <span>{t("home.footer.data")}</span>
        </footer>
      </div>
    </>
  );
}
