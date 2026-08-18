import { Link } from "react-router";
import { Contact, Deal } from "../types";
import { StageChip, StatusChip } from "./Chips";
import { formatMoney } from "../format";
import { useTranslation } from "react-i18next";

/** The deals and contacts panels shown on both the contact and the organization detail pages. */

export function DealList({ deals }: { deals: Deal[] }) {
  const { t } = useTranslation("crm");
  if (deals.length === 0) return <p className="muted">{t("empty.deals")}</p>;
  return (
    <div className="task-list">
      {deals.map((d) => (
        <div key={d.id} className="task-item">
          <div style={{ flex: 1 }}>
            <Link className="entity-link" to={`/deals/${d.id}`}>
              {d.name}
            </Link>
            <div className="muted">{formatMoney(d.value)}</div>
          </div>
          <StageChip stage={d.stage} />
        </div>
      ))}
    </div>
  );
}

export function ContactList({ contacts }: { contacts: Contact[] }) {
  const { t } = useTranslation("crm");
  if (contacts.length === 0)
    return <p className="muted">{t("empty.contacts")}</p>;
  return (
    <div className="task-list">
      {contacts.map((c) => (
        <div key={c.id} className="task-item">
          <div style={{ flex: 1 }}>
            <Link className="entity-link" to={`/contacts/${c.id}`}>
              {c.name}
            </Link>
            <div className="muted">{c.job_title || c.email || ""}</div>
          </div>
          <StatusChip status={c.status} />
        </div>
      ))}
    </div>
  );
}
