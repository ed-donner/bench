import { NavLink, Route, Routes } from "react-router";
import {
  CalendarDays,
  History,
  LayoutDashboard,
  Users,
  UsersRound,
} from "lucide-react";
import BenchNav from "../shared/BenchNav";
import { IconRolodex } from "../shared/AppIcons";
import type { MessageKey } from "../shared/i18n";
import { useT } from "../shared/useLocale";
import StoreProvider from "./StoreProvider";
import Today from "./pages/Today";
import People from "./pages/People";
import PersonDetail from "./pages/PersonDetail";
import Circles from "./pages/Circles";
import CalendarPage from "./pages/CalendarPage";
import TimelinePage from "./pages/TimelinePage";

const NAV: {
  to: string;
  labelKey: MessageKey;
  end?: boolean;
  Icon: typeof LayoutDashboard;
}[] = [
  { to: "/", labelKey: "rolodex.nav.today", end: true, Icon: LayoutDashboard },
  { to: "/people", labelKey: "rolodex.nav.people", Icon: Users },
  { to: "/circles", labelKey: "rolodex.nav.circles", Icon: UsersRound },
  { to: "/calendar", labelKey: "rolodex.nav.calendar", Icon: CalendarDays },
  { to: "/timeline", labelKey: "rolodex.nav.timeline", Icon: History },
];

function Shell() {
  const t = useT();
  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <IconRolodex size={19} />
          {t("rolodex.brand")}
        </div>
        <nav>
          {NAV.map(({ to, labelKey, end, Icon }) => (
            <NavLink key={to} to={to} end={end} className="nav-item">
              <Icon size={17} />
              <span>{t(labelKey)}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          {t("rolodex.sidebar.footer")
            .split("\n")
            .map((line, i) => (
              <span key={i}>
                {i > 0 && <br />}
                {line}
              </span>
            ))}
        </div>
      </aside>
      <main className="main">
        <Routes>
          <Route path="/" element={<Today />} />
          <Route path="/people" element={<People />} />
          <Route path="/people/:id" element={<PersonDetail />} />
          <Route path="/circles" element={<Circles />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/timeline" element={<TimelinePage />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <>
      <BenchNav active="rolodex" />
      <StoreProvider>
        <Shell />
      </StoreProvider>
    </>
  );
}
