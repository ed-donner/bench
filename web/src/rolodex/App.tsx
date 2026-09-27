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
import StoreProvider from "./StoreProvider";
import { useT } from "./strings";
import Today from "./pages/Today";
import People from "./pages/People";
import PersonDetail from "./pages/PersonDetail";
import Circles from "./pages/Circles";
import CalendarPage from "./pages/CalendarPage";
import TimelinePage from "./pages/TimelinePage";

const NAV = [
  { to: "/", label: "today", end: true, Icon: LayoutDashboard },
  { to: "/people", label: "people", end: false, Icon: Users },
  { to: "/circles", label: "circles", end: false, Icon: UsersRound },
  { to: "/calendar", label: "calendar", end: false, Icon: CalendarDays },
  { to: "/timeline", label: "timeline", end: false, Icon: History },
] as const;

function Shell() {
  const t = useT();
  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <IconRolodex size={19} />
          {t("app.name")}
        </div>
        <nav>
          {NAV.map(({ to, label, end, Icon }) => (
            <NavLink key={to} to={to} end={end} className="nav-item">
              <Icon size={17} />
              <span>{t(`nav.${label}`)}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          {t("app.footer1")}
          <br />
          {t("app.footer2")}
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
