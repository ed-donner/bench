import { NavLink, Route, Routes } from "react-router";
import BenchNav from "../shared/BenchNav";
import { useLocale } from "../shared/useLocale";
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
  { to: "/", key: "nav.dashboard", end: true, Icon: IconDashboard },
  { to: "/organizations", key: "nav.organizations", Icon: IconOrganizations },
  { to: "/contacts", key: "nav.contacts", Icon: IconContacts },
  { to: "/deals", key: "nav.deals", Icon: IconDeals },
  { to: "/pipeline", key: "nav.pipeline", Icon: IconPipeline },
] as const;

export default function App() {
  const { t } = useLocale();

  return (
    <>
      <BenchNav active="crm" />
      <div className="app">
        <aside className="sidebar">
          <div className="brand">
            <IconCrm size={19} />
            {t("brand.title")}
          </div>
          <nav>
            {NAV.map(({ to, key, Icon }) => (
              <NavLink key={to} to={to} end={to === "/"} className="nav-link">
                <Icon size={17} />
                <span>{t(key)}</span>
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
