/** Launcher: one card per app. Plain anchors - each app is its own document. */
import BenchNav from "../shared/BenchNav";
import { useT } from "../shared/useLocale";
import {
  IconCrm,
  IconGroove,
  IconRolodex,
  IconSpace,
} from "../shared/AppIcons";

export default function App() {
  const th = useT("home");

  const APPS = [
    {
      href: "/crm/",
      name: "CRM",
      tagline: th("crmTagline"),
      detail: th("crmDetail"),
      facts: [
        th("crmFactPipeline"),
        th("crmFactDashboard"),
        th("crmFactActivities"),
      ],
      Icon: IconCrm,
    },
    {
      href: "/space/",
      name: "Space",
      tagline: th("spaceTagline"),
      detail: th("spaceDetail"),
      facts: [
        th("spaceFactPages"),
        th("spaceFactDatabases"),
        th("spaceFactSearch"),
      ],
      Icon: IconSpace,
    },
    {
      href: "/rolodex/",
      name: "Rolodex",
      tagline: th("rolodexTagline"),
      detail: th("rolodexDetail"),
      facts: [
        th("rolodexFactCheckins"),
        th("rolodexFactCircles"),
        th("rolodexFactCalendar"),
      ],
      Icon: IconRolodex,
    },
    {
      href: "/groove/",
      name: "Groove",
      tagline: th("grooveTagline"),
      detail: th("grooveDetail"),
      facts: [
        th("grooveFactUnits"),
        th("grooveFactSteps"),
        th("grooveFactWebAudio"),
      ],
      Icon: IconGroove,
    },
  ];

  return (
    <>
      <BenchNav active="home" />
      <div className="home">
        <header className="home-header">
          <p className="home-eyebrow">{th("eyebrow")}</p>
          <h1>Bench</h1>
          <p className="home-lede">{th("lede")}</p>
        </header>

        <div className="home-grid">
          {APPS.map((app) => (
            <a className="home-card" href={app.href} key={app.href}>
              <app.Icon size={104} />
              <div className="home-card-body">
                <h2>{app.name}</h2>
                <p className="home-tagline">{app.tagline}</p>
                <p className="home-detail">{app.detail}</p>
                <ul className="home-facts">
                  {app.facts.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              </div>
              <span className="home-open">
                {th("open")}
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
            <strong>npm run dev</strong> · {th("footerDev")}
          </span>
          <span>{th("footerData")}</span>
        </footer>
      </div>
    </>
  );
}
