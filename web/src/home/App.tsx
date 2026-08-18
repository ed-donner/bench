/** Launcher: one card per app. Plain anchors - each app is its own document. */
import { useTranslation } from "react-i18next";
import BenchNav from "../shared/BenchNav";
import {
  IconCrm,
  IconGroove,
  IconRolodex,
  IconSpace,
} from "../shared/AppIcons";

interface AppCard {
  key: string;
  href: string;
  name: string;
  Icon: (p: { size?: number }) => React.ReactElement;
}

/** The app names are product names and stay put; everything else about a card is translated. */
const APPS: AppCard[] = [
  { key: "crm", href: "/crm/", name: "CRM", Icon: IconCrm },
  { key: "space", href: "/space/", name: "Space", Icon: IconSpace },
  { key: "rolodex", href: "/rolodex/", name: "Rolodex", Icon: IconRolodex },
  { key: "groove", href: "/groove/", name: "Groove", Icon: IconGroove },
];

export default function App() {
  const { t } = useTranslation("home");
  return (
    <>
      <BenchNav active="home" />
      <div className="home">
        <header className="home-header">
          <p className="home-eyebrow">{t("eyebrow")}</p>
          <h1>Bench</h1>
          <p className="home-lede">{t("lede")}</p>
        </header>

        <div className="home-grid">
          {APPS.map((app) => (
            <a className="home-card" href={app.href} key={app.href}>
              <app.Icon size={104} />
              <div className="home-card-body">
                <h2>{app.name}</h2>
                <p className="home-tagline">{t(`card.${app.key}.tagline`)}</p>
                <p className="home-detail">{t(`card.${app.key}.detail`)}</p>
                <ul className="home-facts">
                  {/* i18next types an object lookup as opaque; the bundle holds three strings. */}
                  {(
                    t(`card.${app.key}.facts`, {
                      returnObjects: true,
                    }) as string[]
                  ).map((fact) => (
                    <li key={fact}>{fact}</li>
                  ))}
                </ul>
              </div>
              <span className="home-open">
                {t("open")}
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
            <strong>npm run dev</strong> {t("footer.ports")}
          </span>
          <span>{t("footer.data")}</span>
        </footer>
      </div>
    </>
  );
}
