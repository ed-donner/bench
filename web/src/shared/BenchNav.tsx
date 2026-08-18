/**
 * The primary navigation, identical in all four documents. Each app is its own page, so these
 * are plain anchors rather than router links.
 */
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  BenchMark,
  IconCrm,
  IconGlobe,
  IconGroove,
  IconHome,
  IconMoon,
  IconRolodex,
  IconSpace,
  IconSun,
} from "./AppIcons";
import { currentTheme, toggleTheme, type Theme } from "./theme";
import { toggleLang } from "./i18n";
import "./nav.css";

type AppKey = "home" | "crm" | "space" | "rolodex" | "groove";

/** Colour marks the active app and nothing else: one amber chip, wherever you are. An app is
    told apart by its glyph, which is what still works once there are more of them than there
    are brand colours. */
const APPS: {
  key: AppKey;
  href: string;
  Icon: (p: { size?: number }) => React.ReactElement;
}[] = [
  { key: "home", href: "/", Icon: IconHome },
  { key: "crm", href: "/crm/", Icon: IconCrm },
  { key: "space", href: "/space/", Icon: IconSpace },
  { key: "rolodex", href: "/rolodex/", Icon: IconRolodex },
  { key: "groove", href: "/groove/", Icon: IconGroove },
];

export default function BenchNav({ active }: { active: AppKey }) {
  const { t } = useTranslation("nav");
  const [theme, setTheme] = useState<Theme>(currentTheme);
  const themeLabel = theme === "dark" ? t("theme.toLight") : t("theme.toDark");
  return (
    <header className="bench-nav">
      <span className="bench-nav-brand">
        <BenchMark size={21} />
        Bench
      </span>
      <nav className="bench-nav-links" aria-label="Primary">
        {APPS.map(({ key, href, Icon }) => (
          <a
            key={key}
            className="bench-nav-link"
            href={href}
            aria-current={key === active ? "page" : undefined}
          >
            <Icon size={16} />
            {t(`app.${key}`)}
          </a>
        ))}
      </nav>
      {/* The strip's own 28px gap is meant for the blocks either side of it; these two belong
          together, so they sit in one group at the link spacing. */}
      <div className="bench-nav-controls">
        <button
          type="button"
          className="bench-nav-lang"
          onClick={toggleLang}
          aria-label={t("language.switch")}
          title={t("language.switch")}
        >
          <IconGlobe size={16} />
          {t("language.code")}
        </button>
        <button
          type="button"
          className="bench-nav-theme"
          onClick={() => setTheme(toggleTheme())}
          aria-label={themeLabel}
          title={themeLabel}
        >
          {theme === "dark" ? <IconSun size={16} /> : <IconMoon size={16} />}
        </button>
      </div>
    </header>
  );
}
