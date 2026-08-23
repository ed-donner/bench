import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { useT } from "../../shared/useLocale";
import { api } from "../api";
import { useFetch } from "../hooks";
import { Contact, Deal, Organization } from "../types";
import OrganizationForm from "../components/OrganizationForm";
import ConfirmDialog from "../components/ConfirmDialog";
import { ContactList, DealList } from "../components/RelatedLists";
import PageHeader from "../components/PageHeader";
import { IconOrganizations } from "../components/Icons";

function OrganizationFacts({ org }: { org: Organization }) {
  const t = useT();

  return (
    <dl className="props">
      <dt>{t("crm.organizations.facts.website")}</dt>
      <dd>{org.website || t("shared.common.emDash")}</dd>
      <dt>{t("crm.organizations.facts.industry")}</dt>
      <dd>{org.industry || t("shared.common.emDash")}</dd>
      <dt>{t("crm.organizations.facts.notes")}</dt>
      <dd>{org.notes || t("shared.common.emDash")}</dd>
    </dl>
  );
}

export default function OrganizationDetail() {
  const t = useT();
  const { id } = useParams();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { data: org, reload } = useFetch<Organization>(
    `/api/crm/organizations/${id}`,
  );
  const { data: contacts } = useFetch<Contact[]>(
    `/api/crm/contacts?organization_id=${id}`,
  );
  const { data: deals } = useFetch<Deal[]>(
    `/api/crm/deals?organization_id=${id}`,
  );

  if (!org) return null;

  async function remove() {
    await api.delete(`/api/crm/organizations/${id}`);
    void navigate("/organizations");
  }

  return (
    <>
      <div className="breadcrumb">
        <Link to="/organizations">{t("crm.nav.organizations")}</Link> /{" "}
        {org.name}
      </div>
      <PageHeader
        icon={<IconOrganizations size={20} />}
        title={org.name}
        sub={org.industry || t("crm.organizations.fallbackSub")}
      >
        <div className="header-actions">
          <button className="btn btn-ghost" onClick={() => setEditing(true)}>
            {t("shared.common.edit")}
          </button>
          <button className="btn btn-danger" onClick={() => setDeleting(true)}>
            {t("shared.common.delete")}
          </button>
        </div>
      </PageHeader>
      <div className="detail-grid">
        <div className="card full">
          <h2>{t("shared.common.details")}</h2>
          <OrganizationFacts org={org} />
        </div>
        <div className="card">
          <h2>
            {t("crm.organizations.contactsSection", {
              count: contacts?.length ?? 0,
            })}
          </h2>
          <ContactList contacts={contacts ?? []} />
        </div>
        <div className="card">
          <h2>
            {t("crm.organizations.dealsSection", {
              count: deals?.length ?? 0,
            })}
          </h2>
          <DealList deals={deals ?? []} />
        </div>
      </div>
      {editing && (
        <OrganizationForm
          existing={org}
          onSaved={reload}
          onClose={() => setEditing(false)}
        />
      )}
      {deleting && (
        <ConfirmDialog
          title={t("crm.organizations.deleteTitle")}
          message={t("crm.organizations.deleteMessageDetail", {
            name: org.name,
          })}
          onConfirm={() => void remove()}
          onCancel={() => setDeleting(false)}
        />
      )}
    </>
  );
}
