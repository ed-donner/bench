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
import { useT } from "../shared/useLocale";
import StoreProvider from "./StoreProvider";
import Today from "./pages/Today";
import People from "./pages/People";
import PersonDetail from "./pages/PersonDetail";
import Circles from "./pages/Circles";
import CalendarPage from "./pages/CalendarPage";
import TimelinePage from "./pages/TimelinePage";

function Shell() {
  const t = useT("rolodex");
  const nav = [
    { to: "/", label: t("navToday"), end: true, Icon: LayoutDashboard },
    { to: "/people", label: t("navPeople"), Icon: Users },
    { to: "/circles", label: t("navCircles"), Icon: UsersRound },
    { to: "/calendar", label: t("navCalendar"), Icon: CalendarDays },
    { to: "/timeline", label: t("navTimeline"), Icon: History },
  ];

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <IconRolodex size={19} />
          {t("brand")}
        </div>
        <nav>
          {nav.map(({ to, label, end, Icon }) => (
            <NavLink key={to} to={to} end={end} className="nav-item">
              <Icon size={17} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          {t("footer")}
          <br />
          {t("footerSub")}
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
