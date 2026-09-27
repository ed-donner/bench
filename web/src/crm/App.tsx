import { useEffect } from "react";
import { NavLink, Route, Routes } from "react-router";
import BenchNav from "../shared/BenchNav";
import { IconCrm } from "../shared/AppIcons";
import {
  IconContacts,
  IconDashboard,
  IconDeals,
  IconOrganizations,
  IconPipeline,
} from "./components/Icons";
import Dashboard from "./pages/Dashboard";
import Organizations from "./pages/Organizations";
import OrganizationDetail from "./pages/OrganizationDetail";
import Contacts from "./pages/Contacts";
import ContactDetail from "./pages/ContactDetail";
import Deals from "./pages/Deals";
import DealDetail from "./pages/DealDetail";
import Pipeline from "./pages/Pipeline";
import { useT } from "./strings";

const NAV = [
  { to: "/", label: "dashboard", end: true, Icon: IconDashboard },
  {
    to: "/organizations",
    label: "organizations",
    end: false,
    Icon: IconOrganizations,
  },
  { to: "/contacts", label: "contacts", end: false, Icon: IconContacts },
  { to: "/deals", label: "deals", end: false, Icon: IconDeals },
  { to: "/pipeline", label: "pipeline", end: false, Icon: IconPipeline },
] as const;

export default function App() {
  const t = useT();
  useEffect(() => {
    document.title = t("app.name");
  }, [t]);
  return (
    <>
      <BenchNav active="crm" />
      <div className="app">
        <aside className="sidebar">
          <div className="brand">
            <IconCrm size={19} />
            {t("app.name")}
          </div>
          <nav>
            {NAV.map(({ to, label, end, Icon }) => (
              <NavLink key={to} to={to} end={end} className="nav-link">
                <Icon size={17} />
                <span>{t(`nav.${label}`)}</span>
              </NavLink>
            ))}
          </nav>
        </aside>
        <main className="content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/organizations" element={<Organizations />} />
            <Route path="/organizations/:id" element={<OrganizationDetail />} />
            <Route path="/contacts" element={<Contacts />} />
            <Route path="/contacts/:id" element={<ContactDetail />} />
            <Route path="/deals" element={<Deals />} />
            <Route path="/deals/:id" element={<DealDetail />} />
            <Route path="/pipeline" element={<Pipeline />} />
          </Routes>
        </main>
      </div>
    </>
  );
}
