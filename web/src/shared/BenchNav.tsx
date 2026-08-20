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

/** Colour marks the active app and nothing else: one amber chip, wherever you are. An app is
    told apart by its glyph, which is what still works once there are more of them than there
    are brand colours. */
const APPS: {
  key: AppKey;
  href: string;
  labelKey?: string;
  label?: string;
  Icon: (p: { size?: number }) => React.ReactElement;
}[] = [
  { key: "home", href: "/", labelKey: "nav.home", Icon: IconHome },
  { key: "crm", href: "/crm/", label: "CRM", Icon: IconCrm },
  { key: "space", href: "/space/", label: "Space", Icon: IconSpace },
  { key: "rolodex", href: "/rolodex/", label: "Rolodex", Icon: IconRolodex },
  { key: "groove", href: "/groove/", label: "Groove", Icon: IconGroove },
];

export default function BenchNav({ active }: { active: AppKey }) {
  const [theme, setTheme] = useState<Theme>(currentTheme);
  const { locale, toggleLocale, t } = useLocale();
  return (
    <header className="bench-nav">
      <span className="bench-nav-brand">
        <BenchMark size={21} />
        Bench
      </span>
      <nav className="bench-nav-links" aria-label="Primary">
        {APPS.map(({ key, href, labelKey, label, Icon }) => (
          <a
            key={key}
            className="bench-nav-link"
            href={href}
            aria-current={key === active ? "page" : undefined}
          >
            <Icon size={16} />
            {labelKey ? t(labelKey) : label}
          </a>
        ))}
      </nav>
      <div className="bench-nav-controls">
        <button
          type="button"
          className="bench-nav-locale"
          onClick={toggleLocale}
          aria-label={
            locale === "en" ? t("nav.localeToHindi") : t("nav.localeToEnglish")
          }
          title={
            locale === "en" ? t("nav.localeToHindi") : t("nav.localeToEnglish")
          }
        >
          <span className={locale === "en" ? "bench-nav-locale-active" : ""}>
            {t("nav.localeEn")}
          </span>
          <span className="bench-nav-locale-sep">/</span>
          <span className={locale === "hi" ? "bench-nav-locale-active" : ""}>
            {t("nav.localeHi")}
          </span>
        </button>
        <button
          type="button"
          className="bench-nav-theme"
          onClick={() => setTheme(toggleTheme())}
          aria-label={
            theme === "dark" ? t("nav.themeToLight") : t("nav.themeToDark")
          }
          title={
            theme === "dark" ? t("nav.themeToLight") : t("nav.themeToDark")
          }
        >
          {theme === "dark" ? <IconSun size={16} /> : <IconMoon size={16} />}
        </button>
      </div>
    </header>
  );
}
