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
import { useLocale } from "./useLocale";
import { currentTheme, toggleTheme, type Theme } from "./theme";
import "./nav.css";

type AppKey = "home" | "crm" | "space" | "rolodex" | "groove";

const APPS: {
  key: AppKey;
  href: string;
  labelKey:
    | "shared.nav.home"
    | "shared.nav.crm"
    | "shared.nav.space"
    | "shared.nav.rolodex"
    | "shared.nav.groove";
  Icon: (p: { size?: number }) => React.ReactElement;
}[] = [
  { key: "home", href: "/", labelKey: "shared.nav.home", Icon: IconHome },
  { key: "crm", href: "/crm/", labelKey: "shared.nav.crm", Icon: IconCrm },
  {
    key: "space",
    href: "/space/",
    labelKey: "shared.nav.space",
    Icon: IconSpace,
  },
  {
    key: "rolodex",
    href: "/rolodex/",
    labelKey: "shared.nav.rolodex",
    Icon: IconRolodex,
  },
  {
    key: "groove",
    href: "/groove/",
    labelKey: "shared.nav.groove",
    Icon: IconGroove,
  },
];

export default function BenchNav({ active }: { active: AppKey }) {
  const { t, locale, toggleLocale } = useLocale();
  const [theme, setTheme] = useState<Theme>(currentTheme);
  return (
    <header className="bench-nav">
      <span className="bench-nav-brand">
        <BenchMark size={21} />
        {t("shared.brand")}
      </span>
      <nav className="bench-nav-links" aria-label={t("shared.nav.primaryAria")}>
        {APPS.map(({ key, href, labelKey, Icon }) => (
          <a
            key={key}
            className="bench-nav-link"
            href={href}
            aria-current={key === active ? "page" : undefined}
          >
            <Icon size={16} />
            {t(labelKey)}
          </a>
        ))}
      </nav>
      <div className="bench-nav-controls">
        <button
          type="button"
          className="bench-nav-locale"
          onClick={toggleLocale}
          aria-label={
            locale === "en"
              ? t("shared.locale.switchToSpanish")
              : t("shared.locale.switchToEnglish")
          }
          title={
            locale === "en"
              ? t("shared.locale.switchToSpanish")
              : t("shared.locale.switchToEnglish")
          }
        >
          {locale === "en" ? t("shared.locale.es") : t("shared.locale.en")}
        </button>
        <button
          type="button"
          className="bench-nav-theme"
          onClick={() => setTheme(toggleTheme())}
          aria-label={
            theme === "dark"
              ? t("shared.theme.switchToLight")
              : t("shared.theme.switchToDark")
          }
          title={
            theme === "dark"
              ? t("shared.theme.switchToLight")
              : t("shared.theme.switchToDark")
          }
        >
          {theme === "dark" ? <IconSun size={16} /> : <IconMoon size={16} />}
        </button>
      </div>
    </header>
  );
}
