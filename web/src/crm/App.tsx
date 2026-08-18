import { NavLink, Route, Routes } from "react-router";
import { useTranslation } from "react-i18next";
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

const NAV = [
  { to: "/", key: "dashboard", end: true, Icon: IconDashboard },
  { to: "/organizations", key: "organizations", Icon: IconOrganizations },
  { to: "/contacts", key: "contacts", Icon: IconContacts },
  { to: "/deals", key: "deals", Icon: IconDeals },
  { to: "/pipeline", key: "pipeline", Icon: IconPipeline },
];

export default function App() {
  const { t } = useTranslation("crm");
  return (
    <>
      <BenchNav active="crm" />
      <div className="app">
        <aside className="sidebar">
          <div className="brand">
            <IconCrm size={19} />
            {t("brand")}
          </div>
          <nav>
            {NAV.map(({ to, key, end, Icon }) => (
              <NavLink key={to} to={to} end={end} className="nav-link">
                <Icon size={17} />
                <span>{t(`nav.${key}`)}</span>
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
