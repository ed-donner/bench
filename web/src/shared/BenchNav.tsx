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
import { currentTheme, toggleTheme, type Theme } from "./theme";
import { LANGS, setLang, useLang } from "./i18n";
import { useT } from "./strings";
import "./nav.css";

type AppKey = "home" | "crm" | "space" | "rolodex" | "groove";

/** Colour marks the active app and nothing else: one amber chip, wherever you are. An app is
    told apart by its glyph, which is what still works once there are more of them than there
    are brand colours. */
const APPS: {
  key: AppKey;
  href: string;
  /** The app's own name, the same in every language - except the launcher, which is "Home". */
  label: string | null;
  Icon: (p: { size?: number }) => React.ReactElement;
}[] = [
  { key: "home", href: "/", label: null, Icon: IconHome },
  { key: "crm", href: "/crm/", label: "CRM", Icon: IconCrm },
  { key: "space", href: "/space/", label: "Space", Icon: IconSpace },
  { key: "rolodex", href: "/rolodex/", label: "Rolodex", Icon: IconRolodex },
  { key: "groove", href: "/groove/", label: "Groove", Icon: IconGroove },
];

export default function BenchNav({ active }: { active: AppKey }) {
  const [theme, setTheme] = useState<Theme>(currentTheme);
  const lang = useLang();
  const t = useT();
  const themeLabel = theme === "dark" ? t("nav.toLight") : t("nav.toDark");
  return (
    <header className="bench-nav">
      <span className="bench-nav-brand">
        <BenchMark size={21} />
        {t("nav.brand")}
      </span>
      <nav className="bench-nav-links" aria-label={t("nav.primary")}>
        {APPS.map(({ key, href, label, Icon }) => (
          <a
            key={key}
            className="bench-nav-link"
            href={href}
            aria-current={key === active ? "page" : undefined}
          >
            <Icon size={16} />
            {label ?? t("nav.home")}
          </a>
        ))}
      </nav>
      <button
        type="button"
        className="bench-nav-lang"
        onClick={() => setLang(lang === "en" ? "es" : "en")}
        aria-label={t("nav.toOtherLang")}
        title={t("nav.toOtherLang")}
      >
        {LANGS.map((l) => (
          <span key={l} aria-current={l === lang ? "true" : undefined}>
            {l.toUpperCase()}
          </span>
        ))}
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
    </header>
  );
}
