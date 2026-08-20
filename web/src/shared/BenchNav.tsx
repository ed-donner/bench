/**
 * The primary navigation, identical in all four documents. Each app is its own page, so these
 * are plain anchors rather than router links.
 */
import { useState } from "react";
import {
  BenchMark,
  IconCrm,
  IconGroove,
  IconHome,
  IconMoon,
  IconRolodex,
  IconSpace,
  IconSun,
} from "./AppIcons";
import { useLocale, useT } from "./useLocale";
import { currentTheme, toggleTheme, type Theme } from "./theme";
import "./nav.css";

type AppKey = "home" | "crm" | "space" | "rolodex" | "groove";

const APP_KEYS: {
  key: AppKey;
  href: string;
  labelKey: "home" | null;
  name: string;
  Icon: (p: { size?: number }) => React.ReactElement;
}[] = [
  { key: "home", href: "/", labelKey: "home", name: "", Icon: IconHome },
  { key: "crm", href: "/crm/", labelKey: null, name: "CRM", Icon: IconCrm },
  {
    key: "space",
    href: "/space/",
    labelKey: null,
    name: "Space",
    Icon: IconSpace,
  },
  {
    key: "rolodex",
    href: "/rolodex/",
    labelKey: null,
    name: "Rolodex",
    Icon: IconRolodex,
  },
  {
    key: "groove",
    href: "/groove/",
    labelKey: null,
    name: "Groove",
    Icon: IconGroove,
  },
];

export default function BenchNav({ active }: { active: AppKey }) {
  const [theme, setTheme] = useState<Theme>(currentTheme);
  const { locale, toggleLocale } = useLocale();
  const ts = useT("shared");

  return (
    <header className="bench-nav">
      <span className="bench-nav-brand">
        <BenchMark size={21} />
        Bench
      </span>
      <nav className="bench-nav-links" aria-label={ts("navPrimary")}>
        {APP_KEYS.map(({ key, href, labelKey, name, Icon }) => (
          <a
            key={key}
            className="bench-nav-link"
            href={href}
            aria-current={key === active ? "page" : undefined}
          >
            <Icon size={16} />
            {labelKey ? ts(labelKey) : name}
          </a>
        ))}
      </nav>
      <div className="bench-nav-controls">
        <button
          type="button"
          className="bench-nav-locale"
          onClick={toggleLocale}
          aria-label={
            locale === "en" ? ts("switchToSpanish") : ts("switchToEnglish")
          }
          title={
            locale === "en" ? ts("switchToSpanish") : ts("switchToEnglish")
          }
        >
          {locale === "en" ? "ES" : "EN"}
        </button>
        <button
          type="button"
          className="bench-nav-theme"
          onClick={() => setTheme(toggleTheme())}
          aria-label={
            theme === "dark" ? ts("switchToLight") : ts("switchToDark")
          }
          title={theme === "dark" ? ts("switchToLight") : ts("switchToDark")}
        >
          {theme === "dark" ? <IconSun size={16} /> : <IconMoon size={16} />}
        </button>
      </div>
    </header>
  );
}
