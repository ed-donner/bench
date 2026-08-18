import { NavLink, Route, Routes } from "react-router";
import { useTranslation } from "react-i18next";
import {
  CalendarDays,
  History,
  LayoutDashboard,
  Users,
  UsersRound,
} from "lucide-react";
import BenchNav from "../shared/BenchNav";
import { IconRolodex } from "../shared/AppIcons";
import StoreProvider from "./StoreProvider";
import Today from "./pages/Today";
import People from "./pages/People";
import PersonDetail from "./pages/PersonDetail";
import Circles from "./pages/Circles";
import CalendarPage from "./pages/CalendarPage";
import TimelinePage from "./pages/TimelinePage";

const NAV = [
  { to: "/", key: "today", end: true, Icon: LayoutDashboard },
  { to: "/people", key: "people", Icon: Users },
  { to: "/circles", key: "circles", Icon: UsersRound },
  { to: "/calendar", key: "calendar", Icon: CalendarDays },
  { to: "/timeline", key: "timeline", Icon: History },
];

function Shell() {
  const { t } = useTranslation("rolodex");
  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <IconRolodex size={19} />
          Rolodex
        </div>
        <nav>
          {NAV.map(({ to, key, end, Icon }) => (
            <NavLink key={to} to={to} end={end} className="nav-item">
              <Icon size={17} />
              <span>{t(`nav.${key}`)}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          {t("footer.line1")}
          <br />
          {t("footer.line2")}
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
