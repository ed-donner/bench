import { NavLink, Route, Routes } from "react-router";
import BenchNav from "../shared/BenchNav";
import { IconCrm } from "../shared/AppIcons";
import type { MessageKey } from "../shared/i18n";
import { useT } from "../shared/useLocale";
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

const NAV: {
  to: string;
  labelKey: MessageKey;
  end?: boolean;
  Icon: typeof IconDashboard;
}[] = [
  { to: "/", labelKey: "crm.nav.dashboard", end: true, Icon: IconDashboard },
  {
    to: "/organizations",
    labelKey: "crm.nav.organizations",
    Icon: IconOrganizations,
  },
  { to: "/contacts", labelKey: "crm.nav.contacts", Icon: IconContacts },
  { to: "/deals", labelKey: "crm.nav.deals", Icon: IconDeals },
  { to: "/pipeline", labelKey: "crm.nav.pipeline", Icon: IconPipeline },
];

export default function App() {
  const t = useT();

  return (
    <>
      <BenchNav active="crm" />
      <div className="app">
        <aside className="sidebar">
          <div className="brand">
            <IconCrm size={19} />
            {t("crm.brand")}
          </div>
          <nav>
            {NAV.map(({ to, labelKey, end, Icon }) => (
              <NavLink key={to} to={to} end={end} className="nav-link">
                <Icon size={17} />
                <span>{t(labelKey)}</span>
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
