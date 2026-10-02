import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { api } from "../api";
import { useFetch } from "../hooks";
import { useLocale } from "../../shared/useLocale";
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
  const { t, locale } = useLocale();
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
  const withOrg = org ? ` · ${org.name}` : "";

  if (!deal) return null;

  async function remove() {
    await api.delete(`/api/crm/deals/${id}`);
    void navigate("/deals");
  }

  return (
    <>
      <div className="breadcrumb">
        <Link to="/deals">{t("breadcrumb.deals")}</Link> / {deal.name}
      </div>
      <PageHeader
        icon={<IconDeals size={20} />}
        title={deal.name}
        sub={formatMoney(deal.value, locale) + withOrg}
      >
        <div className="header-actions">
          <button className="btn btn-primary" onClick={() => setLogging(true)}>
            {t("common.logActivity")}
          </button>
          <button className="btn btn-ghost" onClick={() => setEditing(true)}>
            {t("common.edit")}
          </button>
          <button className="btn btn-danger" onClick={() => setDeleting(true)}>
            {t("common.delete")}
          </button>
        </div>
      </PageHeader>
      <div className="detail-grid">
        <div className="card">
          <h2>{t("common.details")}</h2>
          <dl className="props">
            <dt>{t("common.stage")}</dt>
            <dd>
              <StageChip stage={deal.stage} />
            </dd>
            <dt>{t("common.value")}</dt>
            <dd>{formatMoney(deal.value, locale)}</dd>
            <dt>{t("common.closeDate")}</dt>
            <dd>{formatDate(deal.close_date, locale)}</dd>
            <dt>{t("common.organization")}</dt>
            <dd>
              {org ? (
                <Link className="entity-link" to={`/organizations/${org.id}`}>
                  {org.name}
                </Link>
              ) : (
                t("common.dash")
              )}
            </dd>
            <dt>{t("common.primaryContact")}</dt>
            <dd>
              {contact ? (
                <Link className="entity-link" to={`/contacts/${contact.id}`}>
                  {contact.name}
                </Link>
              ) : (
                t("common.dash")
              )}
            </dd>
          </dl>
        </div>
        <div className="card">
          <h2>{t("common.activity")}</h2>
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
          title={t("deals.deleteTitle")}
          message={t("deals.deleteMessageQuoted", { name: deal.name })}
          onConfirm={() => void remove()}
          onCancel={() => setDeleting(false)}
        />
      )}
    </>
  );
}
