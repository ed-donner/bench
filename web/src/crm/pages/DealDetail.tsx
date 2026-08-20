import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { useT } from "../../shared/useLocale";
import { api } from "../api";
import { useFetch } from "../hooks";
import { Activity, Contact, Deal, Organization } from "../types";
import DealForm from "../components/DealForm";
import ConfirmDialog from "../components/ConfirmDialog";
import ActivityForm from "../components/ActivityForm";
import ActivityTimeline from "../components/ActivityTimeline";
import { StageChip } from "../components/Chips";
import { formatDate, formatMoney } from "../format";
import PageHeader from "../components/PageHeader";
import { IconDeals } from "../components/Icons";

export default function DealDetail() {
  const t = useT();
  const { id } = useParams();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [logging, setLogging] = useState(false);
  const { data: deal, reload } = useFetch<Deal>(`/api/crm/deals/${id}`);
  const { data: activities, reload: reloadActivities } = useFetch<Activity[]>(
    `/api/crm/activities?deal_id=${id}`,
  );
  const { data: orgs } = useFetch<Organization[]>("/api/crm/organizations");
  const { data: contacts } = useFetch<Contact[]>("/api/crm/contacts");
  const org = orgs?.find((o) => o.id === deal?.organization_id);
  const contact = contacts?.find((c) => c.id === deal?.contact_id);
  const withOrg = org ? t("crm.deals.withOrg", { orgName: org.name }) : "";

  if (!deal) return null;

  async function remove() {
    await api.delete(`/api/crm/deals/${id}`);
    void navigate("/deals");
  }

  return (
    <>
      <div className="breadcrumb">
        <Link to="/deals">{t("crm.nav.deals")}</Link> / {deal.name}
      </div>
      <PageHeader
        icon={<IconDeals size={20} />}
        title={deal.name}
        sub={formatMoney(deal.value) + withOrg}
      >
        <div className="header-actions">
          <button className="btn btn-primary" onClick={() => setLogging(true)}>
            {t("crm.form.logActivity")}
          </button>
          <button className="btn btn-ghost" onClick={() => setEditing(true)}>
            {t("shared.common.edit")}
          </button>
          <button className="btn btn-danger" onClick={() => setDeleting(true)}>
            {t("shared.common.delete")}
          </button>
        </div>
      </PageHeader>
      <div className="detail-grid">
        <div className="card">
          <h2>{t("shared.common.details")}</h2>
          <dl className="props">
            <dt>{t("crm.deals.facts.stage")}</dt>
            <dd>
              <StageChip stage={deal.stage} />
            </dd>
            <dt>{t("crm.deals.facts.value")}</dt>
            <dd>{formatMoney(deal.value)}</dd>
            <dt>{t("crm.deals.facts.closeDate")}</dt>
            <dd>{formatDate(deal.close_date)}</dd>
            <dt>{t("crm.deals.facts.organization")}</dt>
            <dd>
              {org ? (
                <Link className="entity-link" to={`/organizations/${org.id}`}>
                  {org.name}
                </Link>
              ) : (
                t("shared.common.emDash")
              )}
            </dd>
            <dt>{t("crm.deals.facts.primaryContact")}</dt>
            <dd>
              {contact ? (
                <Link className="entity-link" to={`/contacts/${contact.id}`}>
                  {contact.name}
                </Link>
              ) : (
                t("shared.common.emDash")
              )}
            </dd>
          </dl>
        </div>
        <div className="card">
          <h2>{t("crm.deals.activitySection")}</h2>
          <ActivityTimeline
            activities={activities ?? []}
            onChanged={reloadActivities}
          />
        </div>
      </div>
      {logging && (
        <ActivityForm
          dealId={deal.id}
          onSaved={reloadActivities}
          onClose={() => setLogging(false)}
        />
      )}
      {editing && (
        <DealForm
          existing={deal}
          organizations={orgs ?? []}
          contacts={contacts ?? []}
          onSaved={reload}
          onClose={() => setEditing(false)}
        />
      )}
      {deleting && (
        <ConfirmDialog
          title={t("crm.deals.deleteTitle")}
          message={t("crm.deals.deleteMessageQuoted", { name: deal.name })}
          onConfirm={() => void remove()}
          onCancel={() => setDeleting(false)}
        />
      )}
    </>
  );
}
